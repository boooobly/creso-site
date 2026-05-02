import { beforeEach, describe, expect, it } from 'vitest';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  hasAnalyticsConsent,
  readCookieConsent,
  writeCookieConsent,
} from '@/lib/analytics/cookieConsent';

const createStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
};

beforeEach(() => {
  (globalThis as { window?: Window }).window = { localStorage: createStorage(), dispatchEvent: () => true } as unknown as Window;
});

describe('cookie consent storage', () => {
  it('default state does not load analytics consent', () => {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    expect(readCookieConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('accepting analytics enables it', () => {
    const result = writeCookieConsent(true);
    expect(result?.necessary).toBe(true);
    expect(result?.analytics).toBe(true);
    expect(result?.version).toBe(COOKIE_CONSENT_VERSION);
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('rejecting analytics keeps it disabled', () => {
    writeCookieConsent(false);
    expect(readCookieConsent()?.analytics).toBe(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('changing settings updates localStorage', () => {
    writeCookieConsent(false);
    const first = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    writeCookieConsent(true);
    const second = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    expect(first).not.toEqual(second);
    expect(readCookieConsent()?.analytics).toBe(true);
  });

  it('does not throw when localStorage read fails', () => {
    (globalThis as { window?: Window }).window = {
      localStorage: { getItem: () => { throw new Error('blocked'); } },
      dispatchEvent: () => true,
    } as unknown as Window;

    expect(() => readCookieConsent()).not.toThrow();
    expect(readCookieConsent()).toBeNull();
  });

  it('does not throw when localStorage write fails', () => {
    (globalThis as { window?: Window }).window = {
      localStorage: { setItem: () => { throw new Error('blocked'); } },
      dispatchEvent: () => true,
    } as unknown as Window;

    expect(() => writeCookieConsent(true)).not.toThrow();
    expect(writeCookieConsent(true)).toBeNull();
  });
});
