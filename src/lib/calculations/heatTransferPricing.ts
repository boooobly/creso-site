export type HeatTransferProductType = 'mug' | 'tshirt' | 'film';
export type MugType = 'white330' | 'chameleon';
export type MugPrintType = 'single' | 'wrap';
export type TshirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type TshirtGender = 'male' | 'female';

export type HeatTransferPricingInput = {
  productType: HeatTransferProductType;
  mugType: MugType;
  mugPrintType: MugPrintType;
  mugQuantity: number;
  tshirtSize: TshirtSize;
  tshirtGender: TshirtGender;
  useOwnClothes: boolean;
  tshirtQuantity: number;
  filmLength: string;
  filmUrgent: boolean;
  filmTransfer: boolean;
};

export type HeatTransferPricing = {
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  summaryType: string;
  details: string[];
};

const MUG_PRICES: Record<MugType, Record<MugPrintType, number>> = {
  white330: { single: 550, wrap: 700 },
  chameleon: { single: 850, wrap: 1000 },
};

export const HEAT_TRANSFER_QUICK_QTY = [1, 5, 10, 20, 50] as const;

export function getHeatTransferQuantity(input: Pick<HeatTransferPricingInput, 'productType' | 'mugQuantity' | 'tshirtQuantity'>): number {
  if (input.productType === 'mug') return input.mugQuantity;
  if (input.productType === 'tshirt') return input.tshirtQuantity;
  return 1;
}

export function calculateHeatTransferPricing(input: HeatTransferPricingInput): HeatTransferPricing {
  if (input.productType === 'mug') {
    const unitPrice = MUG_PRICES[input.mugType][input.mugPrintType];
    const subtotal = unitPrice * input.mugQuantity;
    const discount = input.mugQuantity >= 10 ? subtotal * 0.1 : 0;
    return {
      unitPrice,
      subtotal,
      discount,
      total: subtotal - discount,
      summaryType: 'Кружка',
      details: [
        `Модель: ${input.mugType === 'white330' ? 'Белая кружка 330 мл' : 'Кружка хамелеон'}`,
        `Печать: ${input.mugPrintType === 'single' ? 'Обычная (1 сторона)' : 'Круговая'}`,
      ],
    };
  }

  if (input.productType === 'tshirt') {
    const unitPrice = input.useOwnClothes ? 700 : 1200;
    const subtotal = unitPrice * input.tshirtQuantity;
    const discount = input.tshirtQuantity >= 10 ? subtotal * 0.1 : 0;
    return {
      unitPrice,
      subtotal,
      discount,
      total: subtotal - discount,
      summaryType: 'Футболка',
      details: [
        `Размер: ${input.tshirtSize}`,
        `Пол: ${input.tshirtGender === 'male' ? 'Мужская' : 'Женская'}`,
        'Печать: Формат A4',
        input.useOwnClothes ? 'Своя вещь: да' : 'Своя вещь: нет',
      ],
    };
  }

  const length = Number(input.filmLength);
  const safeLength = Number.isFinite(length) && length > 0 ? length : 0;
  const base = safeLength * 400;
  const transferCost = input.filmTransfer ? 300 : 0;
  const subtotal = base + transferCost;
  const withUrgent = input.filmUrgent ? subtotal * 1.3 : subtotal;

  return {
    unitPrice: 400,
    subtotal,
    discount: 0,
    total: withUrgent > 0 ? Math.max(withUrgent, 400) : 400,
    summaryType: 'Термоплёнка',
    details: [
      `Длина реза: ${safeLength || 0} м`,
      'Плёнка: белая',
      `Срочность: ${input.filmUrgent ? 'да (+30%)' : 'нет'}`,
      `Перенос на деталь: ${input.filmTransfer ? 'да (+300 ₽)' : 'нет'}`,
    ],
  };
}

export function formatHeatTransferMoney(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
