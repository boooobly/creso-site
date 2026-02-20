export type MillingMaterialGroup = {
  id: string;
  title: string;
  description: string;
  rows: Array<{
    thickness: string;
    price: string;
  }>;
};

export const MILLING_PRICE_PDF_PATH = '/prices/milling-price.pdf';

export const MILLING_MATERIAL_GROUPS: MillingMaterialGroup[] = [
  {
    id: 'pvc',
    title: 'ПВХ',
    description: 'Фрезеровка ПВХ листов разных толщин.',
    rows: [
      { thickness: '2 мм', price: 'от 35 ₽/м.п.' },
      { thickness: '3 мм', price: 'от 40 ₽/м.п.' },
      { thickness: '4–5 мм', price: 'от 48 ₽/м.п.' },
      { thickness: '8–10 мм', price: 'от 60 ₽/м.п.' },
    ],
  },
  {
    id: 'acrylic',
    title: 'Оргстекло (акрил)',
    description: 'Прозрачное и цветное оргстекло.',
    rows: [
      { thickness: '2 мм', price: 'от 45 ₽/м.п.' },
      { thickness: '3 мм', price: 'от 52 ₽/м.п.' },
      { thickness: '4 мм', price: 'от 58 ₽/м.п.' },
      { thickness: '5–6 мм', price: 'от 70 ₽/м.п.' },
      { thickness: '8–10 мм', price: 'от 90 ₽/м.п.' },
    ],
  },
  {
    id: 'polystyrene',
    title: 'Полистирол',
    description: 'Листовой полистирол для рекламы и POS.',
    rows: [
      { thickness: '1–2 мм', price: 'от 35 ₽/м.п.' },
      { thickness: '3 мм', price: 'от 42 ₽/м.п.' },
      { thickness: '4 мм', price: 'от 50 ₽/м.п.' },
    ],
  },
  {
    id: 'cast-polycarbonate',
    title: 'Литой поликарбонат',
    description: 'Точная резка ударопрочного материала.',
    rows: [
      { thickness: '2 мм', price: 'от 55 ₽/м.п.' },
      { thickness: '3 мм', price: 'от 68 ₽/м.п.' },
      { thickness: '4–5 мм', price: 'от 85 ₽/м.п.' },
      { thickness: '6–8 мм', price: 'от 105 ₽/м.п.' },
    ],
  },
  {
    id: 'apet',
    title: 'A-PET',
    description: 'Прозрачный пластик для упаковки и дисплеев.',
    rows: [
      { thickness: '0.7–1 мм', price: 'от 32 ₽/м.п.' },
      { thickness: '1.5 мм', price: 'от 38 ₽/м.п.' },
      { thickness: '2 мм', price: 'от 45 ₽/м.п.' },
    ],
  },
  {
    id: 'acp',
    title: 'АКП (алюминиевый композит)',
    description: 'Фрезеровка и раскрой композитных панелей.',
    rows: [
      { thickness: '3 мм', price: 'от 70 ₽/м.п.' },
      { thickness: '4 мм', price: 'от 78 ₽/м.п.' },
      { thickness: '4 мм (двухсторонняя)', price: 'от 90 ₽/м.п.' },
    ],
  },
  {
    id: 'xps',
    title: 'XPS пенополистирол',
    description: 'Резка легких вспененных материалов.',
    rows: [
      { thickness: '10 мм', price: 'от 42 ₽/м.п.' },
      { thickness: '20 мм', price: 'от 55 ₽/м.п.' },
      { thickness: '30–50 мм', price: 'от 70 ₽/м.п.' },
    ],
  },
  {
    id: 'chipboard',
    title: 'ДСП',
    description: 'Фрезеровка древесно-стружечных плит.',
    rows: [
      { thickness: '10 мм', price: 'от 80 ₽/м.п.' },
      { thickness: '16 мм', price: 'от 95 ₽/м.п.' },
      { thickness: '18–22 мм', price: 'от 120 ₽/м.п.' },
    ],
  },
  {
    id: 'plywood',
    title: 'Фанера',
    description: 'Фигурная резка фанеры для декора и рекламы.',
    rows: [
      { thickness: '4 мм', price: 'от 65 ₽/м.п.' },
      { thickness: '6 мм', price: 'от 78 ₽/м.п.' },
      { thickness: '8–10 мм', price: 'от 95 ₽/м.п.' },
      { thickness: '12–15 мм', price: 'от 120 ₽/м.п.' },
    ],
  },
  {
    id: 'mdf',
    title: 'МДФ',
    description: 'Фрезеровка фасадных и декоративных элементов.',
    rows: [
      { thickness: '6 мм', price: 'от 75 ₽/м.п.' },
      { thickness: '8–10 мм', price: 'от 90 ₽/м.п.' },
      { thickness: '16 мм', price: 'от 120 ₽/м.п.' },
      { thickness: '19–22 мм', price: 'от 145 ₽/м.п.' },
    ],
  },
  {
    id: 'v-groove',
    title: 'V-groove',
    description: 'V-образная выборка для гибки АКП и пластиков.',
    rows: [
      { thickness: 'АКП 3 мм', price: 'от 95 ₽/м.п.' },
      { thickness: 'АКП 4 мм', price: 'от 110 ₽/м.п.' },
      { thickness: 'ПВХ/пластик', price: 'от 85 ₽/м.п.' },
    ],
  },
];

export const MILLING_ADDITIONAL_SERVICES: Array<{ title: string; price: string }> = [
  { title: 'Подготовка макета к фрезеровке', price: 'от 600 ₽' },
  { title: 'Перезапуск/перенастройка станка (малые тиражи)', price: 'от 350 ₽' },
  { title: 'Снятие фаски / скругление кромки', price: 'от 25 ₽/м.п.' },
  { title: 'Маркировка/нумерация деталей', price: 'от 20 ₽/шт' },
  { title: 'Упаковка деталей', price: 'от 150 ₽' },
];

export const MILLING_MATERIAL_OPTIONS = MILLING_MATERIAL_GROUPS.map((group) => ({
  value: group.title,
  label: group.title,
}));

export const MILLING_THICKNESS_BY_MATERIAL = Object.fromEntries(
  MILLING_MATERIAL_GROUPS.map((group) => [group.title, group.rows.map((row) => row.thickness)]),
) as Record<string, string[]>;

export const MILLING_ALLOWED_EXTENSIONS = ['.pdf', '.cdr', '.ai', '.eps', '.dxf', '.svg'] as const;

export const MILLING_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/postscript',
  'application/illustrator',
  'image/svg+xml',
  'application/dxf',
  'image/vnd.dxf',
] as const;

export const MILLING_MAX_UPLOAD_SIZE_MB = 50;
