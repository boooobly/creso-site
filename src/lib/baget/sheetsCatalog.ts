import { parse } from 'csv-parse/sync';
import localCatalogData from '../../../data/baget.json';
import { normalizeBagetImageUrl } from './normalizeBagetImageUrl';

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
};

function toNumber(input: string, fallback?: number): number {
  const normalized = input.trim().replace(',', '.');
  if (!normalized) return fallback ?? Number.NaN;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : (fallback ?? Number.NaN);
}

function toBoolean(input: string): boolean {
  const normalized = input.trim().toLowerCase();
  if (['true', '1', 'yes', 'да'].includes(normalized)) return true;
  if (['false', '0', 'no', 'нет'].includes(normalized)) return false;
  return false;
}

function mapRowToItem(row: CsvRow): BagetSheetItem | null {
  const residuesText = (row[HEADERS.residues] ?? '').trim();
  if (!residuesText) return null;

  const showOnSite = toBoolean(row[HEADERS.showOnSite] ?? '');
  if (!showOnSite) return null;

  const widthMm = toNumber(row[HEADERS.widthMm] ?? '');
  const pricePerMeter = toNumber(row[HEADERS.pricePerMeter] ?? '');
  if (!Number.isFinite(widthMm) || !Number.isFinite(pricePerMeter)) return null;

  return {
    id: (row[HEADERS.id] ?? '').trim(),
    supplier: (row[HEADERS.supplier] ?? '').trim(),
    article: (row[HEADERS.article] ?? '').trim(),
    name: (row[HEADERS.name] ?? '').trim(),
    width_mm: widthMm,
    price_per_meter: pricePerMeter,
    residues_text: residuesText,
    reserve_mm: toNumber(row[HEADERS.reserveMm] ?? '', DEFAULT_RESERVE_MM),
    show_on_site: showOnSite,
    image_url: normalizeBagetImageUrl(row[HEADERS.imageUrl] ?? ''),
    corner_image_url: normalizeBagetImageUrl(row[HEADERS.cornerImageUrl] ?? ''),
    style: (row[HEADERS.style] ?? '').trim(),
    color: (row[HEADERS.color] ?? '').trim(),
    note: (row[HEADERS.note] ?? '').trim(),
  };
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

export async function loadBagetCatalog(): Promise<BagetCatalogLoadResult> {
  const sheetId = process.env.BAGET_SHEET_ID?.trim() || DEFAULT_SHEET_ID;
  const tab = process.env.BAGET_SHEET_TAB?.trim() || DEFAULT_TAB;
  const cacheSecondsRaw = process.env.BAGET_SHEET_CACHE_SECONDS?.trim();
  const cacheSeconds = toNumber(cacheSecondsRaw ?? '', DEFAULT_CACHE_SECONDS);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;

  try {
    const response = await fetch(url, { next: { revalidate: cacheSeconds } });
    if (!response.ok) {
      const error = `Sheet response not ok: ${response.status} ${response.statusText}`;
      console.error('[baget/sheetsCatalog] fallback: invalid response', { error, sheetId, tab, url });
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
      console.error('[baget/sheetsCatalog] fallback: CSV parse failure', { error: message, sheetId, tab, url });
      return { source: 'fallback', sheetId, tab, items: getFallbackCatalog(), error: message };
    }

    const items = records
      .map(mapRowToItem)
      .filter((item): item is BagetSheetItem => item !== null);

    if (items.length === 0) {
      const error = 'Zero valid parsed items from sheet.';
      console.error('[baget/sheetsCatalog] fallback: zero valid parsed items', { error, sheetId, tab, url, rows: records.length });
      return { source: 'fallback', sheetId, tab, items: getFallbackCatalog(), error };
    }

    console.log('[baget/sheetsCatalog] loaded from Google Sheets', { sheetId, tab, count: items.length });
    return { source: 'sheet', sheetId, tab, items, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown fetch error';
    console.error('[baget/sheetsCatalog] fallback: fetch failure', { error: message, sheetId, tab, url });
    return { source: 'fallback', sheetId, tab, items: getFallbackCatalog(), error: message };
  }
}

export async function getBagetCatalogFromSheet(): Promise<BagetSheetItem[]> {
  const result = await loadBagetCatalog();
  return result.items;
}
