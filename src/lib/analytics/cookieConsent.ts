export const COOKIE_CONSENT_VERSION = 'v2026_05';
export const COOKIE_CONSENT_STORAGE_KEY = `credomir_cookie_consent_${COOKIE_CONSENT_VERSION}`;
export const COOKIE_CONSENT_CHANGED_EVENT = 'credomir-cookie-consent-changed';

export type CookieConsentState = {
  necessary: true;
  analytics: boolean;
  acceptedAt: string;
  version: string;
};

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage?.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.necessary !== true) return null;
    if (typeof parsed.analytics !== 'boolean') return null;
    if (typeof parsed.acceptedAt !== 'string' || !parsed.acceptedAt) return null;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;

    return {
      necessary: true,
      analytics: parsed.analytics,
      acceptedAt: parsed.acceptedAt,
      version: parsed.version,
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsentState | null {
  if (typeof window === 'undefined') return null;

  const consent: CookieConsentState = {
    necessary: true,
    analytics,
    acceptedAt: new Date().toISOString(),
    version: COOKIE_CONSENT_VERSION,
  };

  try {
    window.localStorage?.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent }));
    return consent;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics === true;
}
