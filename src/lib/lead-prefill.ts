export const LEAD_CALC_STORAGE_KEY = 'leadCalculationDraft';

export type LeadCalculationDraft = {
  service: string;
  message: string;
};

export function openLeadFormWithCalculation(draft: LeadCalculationDraft): void {
  if (typeof window === 'undefined') return;

  window.sessionStorage.setItem(LEAD_CALC_STORAGE_KEY, JSON.stringify(draft));

  if (window.location.pathname === '/contacts') {
    const form = document.getElementById('contact-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', '#contact-form');
      return;
    }
  }

  window.location.href = '/contacts#contact-form';
}

export function readLeadCalculationDraft(): LeadCalculationDraft | null {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(LEAD_CALC_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<LeadCalculationDraft>;
    if (typeof parsed.service !== 'string' || typeof parsed.message !== 'string') {
      clearLeadCalculationDraft();
      return null;
    }

    const service = parsed.service.trim();
    const message = parsed.message.trim();
    if (!service || !message) {
      clearLeadCalculationDraft();
      return null;
    }

    return {
      service,
      message,
    };
  } catch {
    clearLeadCalculationDraft();
    return null;
  }
}

export function clearLeadCalculationDraft(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(LEAD_CALC_STORAGE_KEY);
}
