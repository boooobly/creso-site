import { afterEach, describe, expect, it, vi } from 'vitest';
import { COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_VERSION } from '@/lib/analytics/cookieConsent';

const ENV_KEYS = ['NEXT_PUBLIC_YANDEX_METRIKA_ID'] as const;
const snapshot = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

const originalWindow = globalThis.window;

const createStorage = (consent?: boolean) => {
  const map = new Map<string, string>();
  if (typeof consent === 'boolean') {
    map.set(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ necessary: true, analytics: consent, acceptedAt: new Date().toISOString(), version: COOKIE_CONSENT_VERSION }),
    );
  }

  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
};

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) delete process.env[key];
    else process.env[key] = snapshot[key];
  }
  if (originalWindow === undefined) delete (globalThis as { window?: Window }).window;
  else globalThis.window = originalWindow;
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('yandex metrica helpers', () => {
  it('no-ops safely when counter id is missing', async () => {
    delete process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    const ym = vi.fn();
    (globalThis as { window: Window & { ym?: typeof ym } }).window = { ym, localStorage: createStorage(true) } as unknown as Window & { ym?: typeof ym };
    const { trackHit, reachGoal, trackContactClick, YANDEX_GOALS } = await import('@/lib/analytics/yandexMetrica');
    expect(() => trackHit('/services')).not.toThrow();
    expect(() => reachGoal(YANDEX_GOALS.contactFormSubmitSuccess)).not.toThrow();
    expect(() => trackContactClick('phone')).not.toThrow();
    expect(ym).not.toHaveBeenCalled();
  });

  it('rejecting analytics keeps tracking disabled', async () => {
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = '123456';
    const ym = vi.fn();
    (globalThis as { window: Window & { ym?: typeof ym } }).window = { ym, localStorage: createStorage(false) } as unknown as Window & { ym?: typeof ym };
    const { trackGoal, YANDEX_GOALS } = await import('@/lib/analytics/yandexMetrica');
    expect(() => trackGoal(YANDEX_GOALS.reviewSubmitSuccess)).not.toThrow();
    expect(ym).not.toHaveBeenCalled();
  });

  it('sends events when analytics consent is accepted', async () => {
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = '123456';
    const ym = vi.fn();
    (globalThis as { window: Window & { ym?: typeof ym } }).window = { ym, localStorage: createStorage(true) } as unknown as Window & { ym?: typeof ym };
    const { YANDEX_GOALS, trackGoal, trackContactClick } = await import('@/lib/analytics/yandexMetrica');
    trackGoal(YANDEX_GOALS.mainLeadSubmitSuccess, { source: 'main' });
    trackContactClick('email');
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.mainLeadSubmitSuccess, { source: 'main' });
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.emailClick, undefined);
  });
});
