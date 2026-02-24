export const BUSINESS_CARD_ALLOWED_QUANTITIES = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000] as const;

const LAMINATION_MULTIPLIER = 1.15;
const DEFAULT_QUANTITY = 1000;

function normalizeQuantity(qty: number): number {
  if (BUSINESS_CARD_ALLOWED_QUANTITIES.includes(qty as (typeof BUSINESS_CARD_ALLOWED_QUANTITIES)[number])) {
    return qty;
  }

  console.warn(`[business-cards] Invalid quantity "${qty}". Falling back to ${DEFAULT_QUANTITY}.`);
  return DEFAULT_QUANTITY;
}

export function getUnitPrice(qty: number): number {
  const normalizedQty = normalizeQuantity(qty);

  if (normalizedQty <= 2000) return 2;
  if (normalizedQty === 3000) return 1.6;
  if (normalizedQty === 4000) return 1.5;
  return 1.4;
}

export function calculateTotal({ qty, lamination }: { qty: number; lamination: boolean }): number {
  const normalizedQty = normalizeQuantity(qty);
  const baseTotal = normalizedQty * getUnitPrice(normalizedQty);
  const total = lamination ? baseTotal * LAMINATION_MULTIPLIER : baseTotal;

  return Math.round(total);
}
