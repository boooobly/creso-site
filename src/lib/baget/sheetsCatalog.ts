import { parse } from 'csv-parse/sync';
import { unstable_cache } from 'next/cache';
import localCatalogData from '../../../data/baget.json';
import { normalizeBagetImageUrl } from './normalizeBagetImageUrl';
import { logger } from '@/lib/logger';

const DEFAULT_SHEET_ID = '1lH3zq_PrUQVbVa37P4WPn24Y60iAmmznnHP-soS7dYA';
const DEFAULT_TAB = 'baget_catalog';
const DEFAULT_CACHE_SECONDS = 300;
const DEFAULT_RESERVE_MM = 10;

const HEADERS = {
  id: 'ID',
  supplier: 'Поставщик',
  article: 'Артикул',
  name: 'Название багета',
  widthMm: 'Ширина в миллиметрах',
  pricePerMeter: 'Цена за метр',
  residues: 'Остатки багета, м (редактируемая строка)',
  reserveMm: 'Запас на распил, мм',
  showOnSite: 'Показывать на сайте',
  imageUrl: 'URL изображения плети',
  cornerImageUrl: 'URL изображения уголка',
  style: 'Стиль',
  color: 'Цвет',
  note: 'Примечание',
} as const;

const HEADER_ALIASES = {
  id: [HEADERS.id, 'Id', 'id'],
  supplier: [HEADERS.supplier],
  article: [HEADERS.article, 'Артикул багета'],
  name: [HEADERS.name, 'Название', 'Наименование'],
  widthMm: [HEADERS.widthMm, 'Ширина в мм', 'Ширина, мм', 'Ширина', 'Ширина профиля'],
  pricePerMeter: [HEADERS.pricePerMeter, 'Цена', 'Цена за м', 'Цена за пог.м', 'Цена за пог. м', 'Цена, ₽/м'],
  residues: [
    HEADERS.residues,
    'Остатки',
    'Остатки багета',
    'Остаток',
    'Остаток по нарядам м.п.',
    'Остатки, м',
    'Остатки м.п.',
  ],
  reserveMm: [HEADERS.reserveMm, 'Запас на распил', 'Запас, мм'],
  showOnSite: [HEADERS.showOnSite, 'Показать на сайте', 'Отображать на сайте', 'Публиковать', 'Показ'],
  imageUrl: [HEADERS.imageUrl, 'Изображение плети', 'URL плети', 'Фото плети', 'Плеть'],
  cornerImageUrl: [HEADERS.cornerImageUrl, 'Изображение уголка', 'URL уголка', 'Фото уголка', 'Уголок'],
  style: [HEADERS.style],
  color: [HEADERS.color],
  note: [HEADERS.note, 'Комментарий'],
} as const;

export type BagetSheetItem = {
  id: string;
  supplier: string;
  article: string;
  name: string;
  width_mm: number;
  price_per_meter: number;
  residues_text: string;
  reserve_mm: number;
  show_on_site: boolean;
  image_url: string;
  corner_image_url: string;
  style: string;
  color: string;
  note: string;
};

export type BagetCatalogDiagnostics = {
  rowsCount: number;
  headers: string[];
  skipped: {
    missingResidues: number;
    hidden: number;
    invalidWidth: number;
    invalidPrice: number;
    other: number;
  };
  showOnSiteHeader?: string | null;
  showOnSiteValues?: Array<{ value: string; count: number }>;
};

type CsvRow = Record<string, string>;

type BagetCatalogItem = {
  id: string;
  article: string;
  name: string;
  color: string;
  style: string;
  width_mm: number;
  price_per_meter: number;
  image: string;
};

export type BagetCatalogLoadResult = {
  source: 'sheet' | 'fallback';
  sheetId: string;
  tab: string;
  items: BagetSheetItem[];
  error: string | null;
  diagnostics?: BagetCatalogDiagnostics;
};

type BagetCatalogSourceConfig = {
  sheetId: string;
  tab: string;
  cacheSeconds: number;
};

function toNumber(input: string, fallback?: number): number {
  const trimmed = input.trim();
  if (!trimmed) return fallback ?? Number.NaN;

  const normalized = trimmed.replace(/\u00A0/g, ' ').replace(/(?<=\d)\s+(?=\d)/g, '').replace(',', '.');
  const directValue = Number(normalized);
  if (Number.isFinite(directValue)) return directValue;

  const match = normalized.match(/[-+]?\d*\.?\d+/);
  if (!match) return fallback ?? Number.NaN;

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : (fallback ?? Number.NaN);
}

function toBoolean(input: string): boolean {
  const normalized = input
    .trim()
    .replace(/\u00A0/g, ' ')
    .replace(/^['"]+|['"]+$/g, '')
    .toLowerCase()
    .replace(/ё/g, 'е');
  if (
    [
      'true',
      '1',
      'yes',
      'да',
      'д',
      'y',
      'показать',
      'показывать',
      'опубликовано',
      'on',
      'x',
      '✓',
      '+',
      'истина',
      'истинно',
      'вкл',
      'включено',
      'checked',
      'show',
      'visible',
    ].includes(normalized)
  ) return true;
  if (!normalized) return false;
  if (
    [
      'false',
      '0',
      'no',
      'нет',
      'н',
      'скрыть',
      'не показывать',
      'off',
      '-',
      'ложь',
      'ложно',
      'выкл',
      'выключено',
      'unchecked',
      'hide',
      'hidden',
    ].includes(normalized)
  ) return false;
  return false;
}

function getFirstByAliases(row: CsvRow, aliases: readonly string[]): string {
  for (const alias of aliases) {
    const value = row[alias];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function getFirstPresentHeader(headers: string[], aliases: readonly string[]): string | null {
  for (const alias of aliases) {
    if (headers.includes(alias)) return alias;
  }
  return null;
}

function mapRowToItem(
  row: CsvRow,
  skipped: {
    missingResidues: number;
    hidden: number;
    invalidWidth: number;
    invalidPrice: number;
    other: number;
  }
): BagetSheetItem | null {
  const residuesText = getFirstByAliases(row, HEADER_ALIASES.residues).trim();
  if (!residuesText) {
    skipped.missingResidues += 1;
    return null;
  }

  const showOnSite = toBoolean(getFirstByAliases(row, HEADER_ALIASES.showOnSite));
  if (!showOnSite) {
    skipped.hidden += 1;
    return null;
  }

  const widthMm = toNumber(getFirstByAliases(row, HEADER_ALIASES.widthMm));
  if (!Number.isFinite(widthMm)) {
    skipped.invalidWidth += 1;
    return null;
  }
  const pricePerMeter = toNumber(getFirstByAliases(row, HEADER_ALIASES.pricePerMeter));
  if (!Number.isFinite(pricePerMeter)) {
    skipped.invalidPrice += 1;
    return null;
  }

  try {
    return {
      id: getFirstByAliases(row, HEADER_ALIASES.id).trim(),
      supplier: getFirstByAliases(row, HEADER_ALIASES.supplier).trim(),
      article: getFirstByAliases(row, HEADER_ALIASES.article).trim(),
      name: getFirstByAliases(row, HEADER_ALIASES.name).trim(),
      width_mm: widthMm,
      price_per_meter: pricePerMeter,
      residues_text: residuesText,
      reserve_mm: toNumber(getFirstByAliases(row, HEADER_ALIASES.reserveMm), DEFAULT_RESERVE_MM),
      show_on_site: showOnSite,
      image_url: normalizeBagetImageUrl(getFirstByAliases(row, HEADER_ALIASES.imageUrl)),
      corner_image_url: normalizeBagetImageUrl(getFirstByAliases(row, HEADER_ALIASES.cornerImageUrl)),
      style: getFirstByAliases(row, HEADER_ALIASES.style).trim(),
      color: getFirstByAliases(row, HEADER_ALIASES.color).trim(),
      note: getFirstByAliases(row, HEADER_ALIASES.note).trim(),
    };
  } catch {
    skipped.other += 1;
    return null;
  }
}

function getFallbackCatalog(): BagetSheetItem[] {
  const fallbackItems = localCatalogData as BagetCatalogItem[];
  return fallbackItems.map((item) => ({
    id: item.id,
    supplier: '',
    article: item.article,
    name: item.name,
    width_mm: item.width_mm,
    price_per_meter: item.price_per_meter,
    residues_text: '100*20',
    reserve_mm: DEFAULT_RESERVE_MM,
    show_on_site: true,
    image_url: normalizeBagetImageUrl(item.image),
    corner_image_url: '',
    style: item.style,
    color: item.color,
    note: '',
  }));
}

export function mapSheetItemsToBagetItems(items: BagetSheetItem[]): BagetCatalogItem[] {
  return items.map((item) => ({
    id: item.id,
    article: item.article,
    name: item.name,
    color: item.color,
    style: item.style,
    width_mm: item.width_mm,
    price_per_meter: item.price_per_meter,
    image:
      normalizeBagetImageUrl(item.image_url) ||
      normalizeBagetImageUrl(item.corner_image_url) ||
      '/images/outdoor-portfolio/placeholder-1.svg',
  }));
}

function getBagetCatalogSourceConfig(): BagetCatalogSourceConfig {
  const sheetId = process.env.BAGET_SHEET_ID?.trim() || DEFAULT_SHEET_ID;
  const tab = process.env.BAGET_SHEET_TAB?.trim() || DEFAULT_TAB;
  const cacheSecondsRaw = process.env.BAGET_SHEET_CACHE_SECONDS?.trim();
  const cacheSeconds = toNumber(cacheSecondsRaw ?? '', DEFAULT_CACHE_SECONDS);
  return {
    sheetId,
    tab,
    cacheSeconds,
  };
}

export async function loadBagetCatalogUncached(sourceConfig = getBagetCatalogSourceConfig()): Promise<BagetCatalogLoadResult> {
  const { sheetId, tab, cacheSeconds } = sourceConfig;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;

  try {
    const response = await fetch(url, { next: { revalidate: cacheSeconds } });
    if (!response.ok) {
      const error = `Sheet response not ok: ${response.status} ${response.statusText}`;
      logger.error('baget.sheets_catalog.fallback.invalid_response', { error, sheetId, tab, url });
      return { source: 'fallback', sheetId, tab, items: getFallbackCatalog(), error };
    }

    const csvText = await response.text();

    let records: CsvRow[];
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        trim: true,
      }) as CsvRow[];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown CSV parse error';
      logger.error('baget.sheets_catalog.fallback.csv_parse_failure', { error: message, sheetId, tab, url });
      return { source: 'fallback', sheetId, tab, items: getFallbackCatalog(), error: message };
    }

    const headers = records.length > 0 ? Object.keys(records[0] ?? {}) : [];
    const skipped = {
      missingResidues: 0,
      hidden: 0,
      invalidWidth: 0,
      invalidPrice: 0,
      other: 0,
    };
    const showOnSiteHeader = getFirstPresentHeader(headers, HEADER_ALIASES.showOnSite);
    const showOnSiteHistogram = new Map<string, number>();
    for (const row of records) {
      const rawValue = (showOnSiteHeader ? row[showOnSiteHeader] : undefined) ?? '';
      const normalizedValue = rawValue.trim().replace(/\u00A0/g, ' ').replace(/^['"]+|['"]+$/g, '');
      const key = normalizedValue || '(empty)';
      showOnSiteHistogram.set(key, (showOnSiteHistogram.get(key) ?? 0) + 1);
    }
    const showOnSiteValues = Array.from(showOnSiteHistogram.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));

    const items = records
      .map((row) => mapRowToItem(row, skipped))
      .filter((item): item is BagetSheetItem => item !== null);

    const diagnostics = {
      rowsCount: records.length,
      headers,
      skipped,
      showOnSiteHeader,
      showOnSiteValues,
    };

    if (items.length === 0) {
      const headerPreview = headers.slice(0, 8).join(', ');
      const error = `Zero valid parsed items from sheet. Rows: ${records.length}. Headers: ${headerPreview || 'none'}. Skipped: hidden=${skipped.hidden}, missingResidues=${skipped.missingResidues}, invalidWidth=${skipped.invalidWidth}, invalidPrice=${skipped.invalidPrice}, other=${skipped.other}.`;
      logger.error('baget.sheets_catalog.fallback.zero_valid_items', {
        error,
        sheetId,
        tab,
        url,
        rows: records.length,
        headers,
        skipped,
        headerMatches: {
          width: getFirstPresentHeader(headers, HEADER_ALIASES.widthMm),
          price: getFirstPresentHeader(headers, HEADER_ALIASES.pricePerMeter),
          residues: getFirstPresentHeader(headers, HEADER_ALIASES.residues),
          showOnSite: getFirstPresentHeader(headers, HEADER_ALIASES.showOnSite),
        },
        showOnSiteValues,
      });
      return { source: 'fallback', sheetId, tab, items: getFallbackCatalog(), error, diagnostics };
    }

    logger.info('baget.sheets_catalog.loaded', { sheetId, tab, count: items.length, ...diagnostics });
    return { source: 'sheet', sheetId, tab, items, error: null, diagnostics };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown fetch error';
    logger.error('baget.sheets_catalog.fallback.fetch_failure', { error: message, sheetId, tab, url });
    return { source: 'fallback', sheetId, tab, items: getFallbackCatalog(), error: message };
  }
}

async function loadBagetCatalogCached(sourceConfig: BagetCatalogSourceConfig): Promise<BagetCatalogLoadResult> {
  const { sheetId, tab, cacheSeconds } = sourceConfig;
  const load = unstable_cache(
    async () => loadBagetCatalogUncached(sourceConfig),
    ['baget.sheets_catalog.parsed', sheetId, tab, String(cacheSeconds)],
    { revalidate: cacheSeconds }
  );

  try {
    return await load();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('incrementalCache missing')) {
      return loadBagetCatalogUncached(sourceConfig);
    }

    throw error;
  }
}

export async function loadBagetCatalog(): Promise<BagetCatalogLoadResult> {
  const sourceConfig = getBagetCatalogSourceConfig();
  return loadBagetCatalogCached(sourceConfig);
}

export async function getBagetCatalogFromSheet(): Promise<BagetSheetItem[]> {
  const result = await loadBagetCatalog();
  return result.items;
}
