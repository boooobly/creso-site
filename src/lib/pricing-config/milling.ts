export type MillingMaterialGroup = {
  id: string;
  title: string;
  description: string;
  rows: Array<{
    thickness: string;
    price: string;
  }>;
};

export type MillingMaterialRateDefinition = {
  key: string;
  thickness: string;
  defaultPrice: number;
  sortOrder: number;
};

export type MillingMaterialGroupDefinition = {
  id: string;
  title: string;
  description: string;
  rows: MillingMaterialRateDefinition[];
};

export const MILLING_PRICE_PDF_PATH = '/prices/milling-price.pdf';

function formatPricePerMeter(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽/м.п.`;
}

export const MILLING_MATERIAL_GROUP_DEFINITIONS: MillingMaterialGroupDefinition[] = [
  {
    id: 'pvc',
    title: 'ПВХ',
    description: 'Фрезеровка ПВХ листов разных толщин.',
    rows: [
      { key: 'price_1_3_mm', thickness: '1–3 мм', defaultPrice: 30, sortOrder: 10 },
      { key: 'price_4_6_mm', thickness: '4–6 мм', defaultPrice: 35, sortOrder: 20 },
      { key: 'price_8_10_mm', thickness: '8–10 мм', defaultPrice: 45, sortOrder: 30 },
      { key: 'price_over_10_mm', thickness: 'свыше 10 мм', defaultPrice: 60, sortOrder: 40 },
    ],
  },
  {
    id: 'acrylic',
    title: 'Оргстекло (акрил)',
    description: 'Прозрачное и цветное оргстекло.',
    rows: [
      { key: 'price_1_2_mm', thickness: '1–2 мм', defaultPrice: 30, sortOrder: 10 },
      { key: 'price_3_4_mm', thickness: '3–4 мм', defaultPrice: 35, sortOrder: 20 },
      { key: 'price_5_6_mm', thickness: '5–6 мм', defaultPrice: 45, sortOrder: 30 },
      { key: 'price_8_mm', thickness: '8 мм', defaultPrice: 60, sortOrder: 40 },
      { key: 'price_10_mm', thickness: '10 мм', defaultPrice: 80, sortOrder: 50 },
      { key: 'price_15_mm', thickness: '15 мм', defaultPrice: 110, sortOrder: 60 },
      { key: 'price_20_mm', thickness: '20 мм', defaultPrice: 135, sortOrder: 70 },
    ],
  },
  {
    id: 'polystyrene',
    title: 'Полистирол',
    description: 'Листовой полистирол для рекламы и POS.',
    rows: [
      { key: 'price_1_3_mm', thickness: '1–3 мм', defaultPrice: 35, sortOrder: 10 },
      { key: 'price_4_6_mm', thickness: '4–6 мм', defaultPrice: 45, sortOrder: 20 },
    ],
  },
  {
    id: 'cast-polycarbonate',
    title: 'Поликарбонат литой',
    description: 'Фрезеровка листового литого поликарбоната.',
    rows: [
      { key: 'price_1_2_mm', thickness: '1–2 мм', defaultPrice: 60, sortOrder: 10 },
      { key: 'price_3_4_mm', thickness: '3–4 мм', defaultPrice: 90, sortOrder: 20 },
      { key: 'price_5_6_mm', thickness: '5–6 мм', defaultPrice: 120, sortOrder: 30 },
      { key: 'price_8_mm', thickness: '8 мм', defaultPrice: 180, sortOrder: 40 },
      { key: 'price_10_mm', thickness: '10 мм', defaultPrice: 210, sortOrder: 50 },
    ],
  },
  {
    id: 'apet',
    title: 'А-ПЭТ',
    description: 'Прозрачный пластик для упаковки и дисплеев.',
    rows: [
      { key: 'price_0_5_1_mm', thickness: '0.5–1 мм', defaultPrice: 45, sortOrder: 10 },
      { key: 'price_1_5_2_mm', thickness: '1.5–2 мм', defaultPrice: 50, sortOrder: 20 },
    ],
  },
  {
    id: 'acp',
    title: 'АКП',
    description: 'Фрезеровка и раскрой композитных панелей.',
    rows: [
      { key: 'price_3_mm', thickness: '3 мм', defaultPrice: 35, sortOrder: 10 },
      { key: 'price_4_mm', thickness: '4 мм', defaultPrice: 40, sortOrder: 20 },
      { key: 'price_6_mm', thickness: '6 мм', defaultPrice: 50, sortOrder: 30 },
    ],
  },
  {
    id: 'v-groove',
    title: 'V-канавка',
    description: 'Дополнительная операция к базовой стоимости реза.',
    rows: [
      { key: 'price_markup', thickness: 'Доплата', defaultPrice: 10, sortOrder: 10 },
    ],
  },
  {
    id: 'polyamide-polyethylene-polypropylene',
    title: 'Полиамид / Полиэтилен / Полипропилен',
    description: 'Фрезеровка инженерных и конструкционных полимерных листов.',
    rows: [
      { key: 'price_up_to_10_mm', thickness: 'до 10 мм', defaultPrice: 80, sortOrder: 10 },
      { key: 'price_up_to_20_mm', thickness: 'до 20 мм', defaultPrice: 160, sortOrder: 20 },
      { key: 'price_up_to_30_mm', thickness: 'до 30 мм', defaultPrice: 240, sortOrder: 30 },
    ],
  },
  {
    id: 'xps',
    title: 'XPS пенополистирол (экструдированный)',
    description: 'Резка листов XPS по контуру.',
    rows: [
      { key: 'price_25_30_mm', thickness: '25–30 мм', defaultPrice: 40, sortOrder: 10 },
      { key: 'price_40_mm', thickness: '40 мм', defaultPrice: 50, sortOrder: 20 },
      { key: 'price_50_mm', thickness: '50 мм', defaultPrice: 60, sortOrder: 30 },
    ],
  },
  {
    id: 'chipboard',
    title: 'ДСП',
    description: 'Фрезеровка древесно-стружечных плит.',
    rows: [
      { key: 'price_8_mm', thickness: '8 мм', defaultPrice: 55, sortOrder: 10 },
      { key: 'price_16_mm', thickness: '16 мм', defaultPrice: 70, sortOrder: 20 },
      { key: 'price_18_20_mm', thickness: '18–20 мм', defaultPrice: 90, sortOrder: 30 },
      { key: 'price_22_mm', thickness: '22 мм', defaultPrice: 120, sortOrder: 40 },
    ],
  },
  {
    id: 'plywood',
    title: 'Фанера',
    description: 'Фигурная резка фанеры для декора и рекламы.',
    rows: [
      { key: 'price_3_6_mm', thickness: '3–6 мм', defaultPrice: 45, sortOrder: 10 },
      { key: 'price_8_12_mm', thickness: '8–12 мм', defaultPrice: 50, sortOrder: 20 },
      { key: 'price_15_18_mm', thickness: '15–18 мм', defaultPrice: 70, sortOrder: 30 },
      { key: 'price_20_mm_and_more', thickness: '20 мм и более', defaultPrice: 100, sortOrder: 40 },
    ],
  },
  {
    id: 'mdf',
    title: 'МДФ',
    description: 'Фрезеровка фасадных и декоративных элементов.',
    rows: [
      { key: 'price_4_6_mm', thickness: '4–6 мм', defaultPrice: 35, sortOrder: 10 },
      { key: 'price_8_10_mm', thickness: '8–10 мм', defaultPrice: 50, sortOrder: 20 },
      { key: 'price_12_16_mm', thickness: '12–16 мм', defaultPrice: 60, sortOrder: 30 },
      { key: 'price_18_22_mm', thickness: '18–22 мм', defaultPrice: 80, sortOrder: 40 },
      { key: 'price_25_mm_and_more', thickness: '25 мм и более', defaultPrice: 100, sortOrder: 50 },
    ],
  },
];

export const MILLING_MATERIAL_GROUPS: MillingMaterialGroup[] = MILLING_MATERIAL_GROUP_DEFINITIONS.map((group) => ({
  id: group.id,
  title: group.title,
  description: group.description,
  rows: group.rows.map((row) => ({
    thickness: row.thickness,
    price: formatPricePerMeter(row.defaultPrice),
  })),
}));

export type MillingAdditionalServiceItem = {
  key: string;
  label: string;
  details: string;
  badges?: string[];
};

export type MillingAdditionalServiceGroup = {
  id: string;
  title: string;
  items: MillingAdditionalServiceItem[];
};

export const MILLING_ADDITIONAL_SERVICE_GROUPS: MillingAdditionalServiceGroup[] = [
  {
    id: 'urgency',
    title: 'Срочность',
    items: [
      {
        key: 'same_day',
        label: 'День в день',
        details: '30%, минимум 350 ₽',
        badges: ['+30%', 'минимум 350 ₽'],
      },
      {
        key: 'while_you_wait',
        label: 'Заказ при вас (от 30 мин)',
        details: '50%, минимум 700 ₽',
        badges: ['+50%', 'минимум 700 ₽'],
      },
    ],
  },
  {
    id: 'preparation-and-complexity',
    title: 'Подготовка и сложность',
    items: [
      { key: 'layout_preparation', label: 'Подготовка макета', details: 'от 300 ₽' },
      { key: 'parts_nesting', label: 'Компоновка деталей', details: 'от 300 ₽' },
      {
        key: 'small_parts_complexity',
        label: 'Фрезеровка малых деталей до 50 мм, множества отверстий, тонких форм',
        details: '50%',
        badges: ['+50%'],
      },
      { key: 'transparent_acrylic_edge_polishing', label: 'Полировка торцов прозрачного оргстекла', details: '90 ₽/м.п.' },
    ],
  },
  {
    id: 'customer-material-logistics-storage',
    title: 'Материал заказчика, логистика и хранение',
    items: [
      {
        key: 'customer_material_piece_markup',
        label: 'Фрезеровка из кусков материала заказчика',
        details: '10% за каждый последующий кусок',
        badges: ['+10%'],
      },
      { key: 'customer_material_loading', label: 'Погрузка/выгрузка материалов заказчика', details: '100 ₽/лист' },
      {
        key: 'storage_after_free_period',
        label: 'Хранение материалов клиента',
        details: 'бесплатно 3 суток до фрезеровки и 3 суток после, далее 150 ₽/сутки',
      },
      { key: 'city_delivery', label: 'Доставка отфрезерованных деталей по городу', details: 'от 500 ₽' },
    ],
  },
];

export const MILLING_MATERIAL_OPTIONS = MILLING_MATERIAL_GROUP_DEFINITIONS.map((group) => ({
  value: group.title,
  label: group.title,
}));

export const MILLING_THICKNESS_BY_MATERIAL = Object.fromEntries(
  MILLING_MATERIAL_GROUP_DEFINITIONS.map((group) => [group.title, group.rows.map((row) => row.thickness)]),
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
