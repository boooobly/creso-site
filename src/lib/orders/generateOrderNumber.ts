export function generateOrderNumber(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CRD-${yyyy}${mm}${dd}-${randomPart}`;
}
