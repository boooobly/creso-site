export type Baguette = {
  id: string;
  name: string;
  image: string;
  availableLength: number;
  profileWidth?: number;
};

export const BAGUETTES: Baguette[] = [
  { id: 'bg-01', name: 'Классик Орех', image: '/logo.svg', availableLength: 420, profileWidth: 3.2 },
  { id: 'bg-02', name: 'Сканди Белый', image: '/logo.svg', availableLength: 300, profileWidth: 2.4 },
  { id: 'bg-03', name: 'Золото Премиум', image: '/logo.svg', availableLength: 510, profileWidth: 4.1 },
  { id: 'bg-04', name: 'Минимал Черный', image: '/logo.svg', availableLength: 220, profileWidth: 1.8 },
];

export type BagetInputValidation = {
  inputsFilled: boolean;
  isValid: boolean;
  widthNum: number;
  heightNum: number;
};

export function validateBagetDimensions(width: string, height: string): BagetInputValidation {
  const widthNum = Number(width);
  const heightNum = Number(height);
  const inputsFilled = width !== '' && height !== '';

  const isValid =
    inputsFilled &&
    Number.isFinite(widthNum) &&
    Number.isFinite(heightNum) &&
    widthNum > 0 &&
    heightNum > 0;

  return {
    inputsFilled,
    isValid,
    widthNum,
    heightNum,
  };
}

export function calculateRequiredBagetLength(isValid: boolean, width: number, height: number): number | null {
  return isValid ? (width + height) * 2 : null;
}

export function isBaguetteSuitable(availableLength: number, requiredLength: number | null): boolean {
  return requiredLength !== null && availableLength >= requiredLength;
}
