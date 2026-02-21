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
      { thickness: '1–3 мм', price: '30 ₽/м.п.' },
      { thickness: '4–6 мм', price: '35 ₽/м.п.' },
      { thickness: '8–10 мм', price: '45 ₽/м.п.' },
      { thickness: 'свыше 10 мм', price: '60 ₽/м.п.' },
    ],
  },
  {
    id: 'acrylic',
    title: 'Оргстекло (акрил)',
    description: 'Прозрачное и цветное оргстекло.',
    rows: [
      { thickness: '1–2 мм', price: '30 ₽/м.п.' },
      { thickness: '3–4 мм', price: '35 ₽/м.п.' },
      { thickness: '5–6 мм', price: '45 ₽/м.п.' },
      { thickness: '8 мм', price: '60 ₽/м.п.' },
      { thickness: '10 мм', price: '80 ₽/м.п.' },
      { thickness: '15 мм', price: '110 ₽/м.п.' },
      { thickness: '20 мм', price: '135 ₽/м.п.' },
    ],
  },
  {
    id: 'polystyrene',
    title: 'Полистирол',
    description: 'Листовой полистирол для рекламы и POS.',
    rows: [
      { thickness: '1–3 мм', price: '35 ₽/м.п.' },
      { thickness: '4–6 мм', price: '45 ₽/м.п.' },
    ],
  },
  {
    id: 'cast-polycarbonate',
    title: 'Поликарбонат литой',
    description: 'Фрезеровка листового литого поликарбоната.',
    rows: [
      { thickness: '1–2 мм', price: '60 ₽/м.п.' },
      { thickness: '3–4 мм', price: '90 ₽/м.п.' },
      { thickness: '5–6 мм', price: '120 ₽/м.п.' },
      { thickness: '8 мм', price: '180 ₽/м.п.' },
      { thickness: '10 мм', price: '210 ₽/м.п.' },
    ],
  },
  {
    id: 'apet',
    title: 'А-ПЭТ',
    description: 'Прозрачный пластик для упаковки и дисплеев.',
    rows: [
      { thickness: '0.5–1 мм', price: '45 ₽/м.п.' },
      { thickness: '1.5–2 мм', price: '50 ₽/м.п.' },
    ],
  },
  {
    id: 'acp',
    title: 'АКП',
    description: 'Фрезеровка и раскрой композитных панелей.',
    rows: [
      { thickness: '3 мм', price: '35 ₽/м.п.' },
      { thickness: '4 мм', price: '40 ₽/м.п.' },
      { thickness: '6 мм', price: '50 ₽/м.п.' },
    ],
  },
  {
    id: 'v-groove',
    title: 'V-канавка',
    description: 'Дополнительная операция к базовой стоимости реза.',
    rows: [
      { thickness: 'Доплата', price: '+10 ₽/м.п.' },
    ],
  },
  {
    id: 'polyamide-polyethylene-polypropylene',
    title: 'Полиамид / Полиэтилен / Полипропилен',
    description: 'Фрезеровка инженерных и конструкционных полимерных листов.',
    rows: [
      { thickness: 'до 10 мм', price: '80 ₽/м.п.' },
      { thickness: 'до 20 мм', price: '160 ₽/м.п.' },
      { thickness: 'до 30 мм', price: '240 ₽/м.п.' },
    ],
  },
  {
    id: 'xps',
    title: 'XPS пенополистирол (экструдированный)',
    description: 'Резка листов XPS по контуру.',
    rows: [
      { thickness: '25–30 мм', price: '40 ₽/м.п.' },
      { thickness: '40 мм', price: '50 ₽/м.п.' },
      { thickness: '50 мм', price: '60 ₽/м.п.' },
    ],
  },
  {
    id: 'chipboard',
    title: 'ДСП',
    description: 'Фрезеровка древесно-стружечных плит.',
    rows: [
      { thickness: '8 мм', price: '55 ₽/м.п.' },
      { thickness: '16 мм', price: '70 ₽/м.п.' },
      { thickness: '18–20 мм', price: '90 ₽/м.п.' },
      { thickness: '22 мм', price: '120 ₽/м.п.' },
    ],
  },
  {
    id: 'plywood',
    title: 'Фанера',
    description: 'Фигурная резка фанеры для декора и рекламы.',
    rows: [
      { thickness: '3–6 мм', price: '45 ₽/м.п.' },
      { thickness: '8–12 мм', price: '50 ₽/м.п.' },
      { thickness: '15–18 мм', price: '70 ₽/м.п.' },
      { thickness: '20 мм и более', price: '100 ₽/м.п.' },
    ],
  },
  {
    id: 'mdf',
    title: 'МДФ',
    description: 'Фрезеровка фасадных и декоративных элементов.',
    rows: [
      { thickness: '4–6 мм', price: '35 ₽/м.п.' },
      { thickness: '8–10 мм', price: '50 ₽/м.п.' },
      { thickness: '12–16 мм', price: '60 ₽/м.п.' },
      { thickness: '18–22 мм', price: '80 ₽/м.п.' },
      { thickness: '25 мм и более', price: '100 ₽/м.п.' },
    ],
  },
];

export const MILLING_ADDITIONAL_SERVICES: Array<{ title: string; price: string }> = [
  { title: 'Срочность (день в день)', price: '+30%, не менее 350 ₽' },
  { title: 'Заказ при вас (от 30 мин)', price: '+50%, не менее 700 ₽' },
  { title: 'Компоновка деталей на материале', price: 'от 300 ₽' },
  { title: 'Фрезеровка из кусков материала заказчика', price: '+10% за каждый последующий кусок' },
  { title: 'Подготовка макета', price: 'от 300 ₽' },
  {
    title: 'Фрезеровка малых деталей до 50 мм, множества отверстий, тонких форм',
    price: '+50%',
  },
  { title: 'Погрузка или выгрузка материала заказчика', price: '100 ₽/лист' },
  {
    title: 'Хранение материала клиента',
    price: 'бесплатно 3 суток до фрезеровки, бесплатно 3 суток после, далее 150 ₽/сутки',
  },
  { title: 'Доставка отфрезерованных деталей по городу', price: 'от 500 ₽' },
  { title: 'Полировка торцов прозрачного оргстекла', price: '90 ₽/м.п.' },
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
