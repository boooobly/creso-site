export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11 || !digits.startsWith('7')) {
    return null;
  }

  return digits;
}
