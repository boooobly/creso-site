import { sourceTitle } from '@/lib/utils/sourceTitle';

export type LeadNotificationFile = {
  name: string;
  size: number;
  type?: string;
  bytes?: Buffer;
};

export type LeadNotificationInput = {
  source: string;
  name: string;
  phone?: string;
  email?: string;
  widthMm?: number;
  heightMm?: number;
  comment?: string;
  extras?: Record<string, unknown>;
  pageUrl?: string;
  files?: LeadNotificationFile[];
};

const EXTRA_LABELS: Record<string, string> = {
  service: 'Услуга',
  serviceType: 'Тип услуги',
  productType: 'Тип изделия',
  address: 'Адрес',
  dimensions: 'Размеры',
  budget: 'Бюджет',
  material: 'Материал',
  thickness: 'Толщина',
  fabric: 'Тип ткани',
  color: 'Цвет ткани',
  tshirtSource: 'Футболка',
  transferType: 'Тип переноса',
  side: 'Сторона',
  quantity: 'Количество',
  total: 'Стоимость',
};

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeNumber(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

function toDisplayValue(value: unknown): string | undefined {
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  return normalizeText(value) || normalizeNumber(value);
}

function sanitizeComment(comment?: string): string | undefined {
  const text = normalizeText(comment);
  if (!text) return undefined;

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^Страница:\s*/i.test(line));

  return lines.length > 0 ? lines.join('\n') : undefined;
}

function extractPageUrl(input: LeadNotificationInput): string | undefined {
  if (normalizeText(input.pageUrl)) return normalizeText(input.pageUrl);

  const fromExtras = normalizeText(input.extras?.pageUrl);
  if (fromExtras) return fromExtras;

  return undefined;
}

function getServiceName(input: LeadNotificationInput): string {
  return normalizeText(input.extras?.service) || sourceTitle(input.source);
}

function buildSize(widthMm?: number, heightMm?: number): string | undefined {
  if (!widthMm || !heightMm) return undefined;
  return `${widthMm} × ${heightMm} мм`;
}

function pushLabeled(lines: string[], label: string, value: unknown) {
  const displayValue = toDisplayValue(value);
  if (displayValue) lines.push(`${label}: ${displayValue}`);
}

function buildHeatTransferLines(extras: Record<string, unknown> | undefined): string[] {
  if (!extras) return [];

  const lines: string[] = [];
  pushLabeled(lines, 'Тип изделия', extras.productType);

  const pricing = extras.pricing as Record<string, unknown> | undefined;
  if (pricing) {
    pushLabeled(lines, 'Количество', pricing.quantity);
    if (typeof pricing.total === 'number' && Number.isFinite(pricing.total)) {
      lines.push(`Стоимость: ${Math.round(pricing.total).toLocaleString('ru-RU')} ₽`);
    }
  }

  return lines;
}

function buildGenericExtraLines(extras: Record<string, unknown> | undefined, source: string): string[] {
  if (!extras) return [];

  const lines: string[] = [];
  const skipKeys = new Set(['service', 'consent', 'agreed', 'pageUrl', 'files', 'contact', 'configuration', 'pricing']);

  if (source === 'heat-transfer') {
    lines.push(...buildHeatTransferLines(extras));
    skipKeys.add('productType');
  }

  for (const [key, rawValue] of Object.entries(extras)) {
    if (skipKeys.has(key)) continue;

    const label = EXTRA_LABELS[key];
    if (!label) continue;
    pushLabeled(lines, label, rawValue);
  }

  return lines;
}

function buildFilesLine(files: LeadNotificationFile[] | undefined): string | undefined {
  if (!files || files.length === 0) return undefined;
  const names = files.map((file) => file.name.trim()).filter(Boolean);
  if (names.length === 0) return undefined;
  return `Файлы: ${names.join(', ')}`;
}

export function buildLeadNotificationText(input: LeadNotificationInput): string {
  const serviceName = getServiceName(input);
  const pageUrl = extractPageUrl(input);
  const comment = sanitizeComment(input.comment);
  const size = buildSize(input.widthMm, input.heightMm);
  const extraLines = buildGenericExtraLines(input.extras, input.source);
  const filesLine = buildFilesLine(input.files);

  return [
    `🆕 Новая заявка — ${serviceName}`,
    '',
    `Услуга: ${serviceName}`,
    `Имя: ${input.name}`,
    `Телефон: ${input.phone || '—'}`,
    `Email: ${input.email || '—'}`,
    ...(size ? [`Размер: ${size}`] : []),
    ...extraLines,
    ...(comment ? [`Комментарий: ${comment}`] : []),
    ...(filesLine ? [filesLine] : []),
    ...(pageUrl ? [`Страница: ${pageUrl}`] : []),
  ].join('\n');
}
