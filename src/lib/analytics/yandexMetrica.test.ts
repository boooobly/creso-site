import { afterEach, describe, expect, it, vi } from 'vitest';

const ENV_KEYS = ['NEXT_PUBLIC_YANDEX_METRIKA_ID'] as const;
const snapshot = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

const originalWindow = globalThis.window;

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = snapshot[key];
    }
  }

  if (originalWindow === undefined) {
    delete (globalThis as { window?: Window }).window;
  } else {
    globalThis.window = originalWindow;
  }

  vi.resetModules();
  vi.restoreAllMocks();
});

describe('yandex metrica helpers', () => {
  it('no-ops safely when counter id is missing', async () => {
    delete process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    const ym = vi.fn();
    (globalThis as { window: Window & { ym?: typeof ym } }).window = { ym } as Window & { ym?: typeof ym };

    const { trackHit, reachGoal, trackContactClick } = await import('@/lib/analytics/yandexMetrica');

    expect(() => trackHit('/services')).not.toThrow();
    expect(() => reachGoal('cta_click')).not.toThrow();
    expect(() => trackContactClick('phone')).not.toThrow();
    expect(ym).not.toHaveBeenCalled();
  });

  it('no-ops safely when ym function is unavailable', async () => {
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = '123456';
    (globalThis as { window: Window & { ym?: undefined } }).window = {} as Window;

    const { trackGoal } = await import('@/lib/analytics/yandexMetrica');

    expect(() => trackGoal('calculator_submit')).not.toThrow();
  });

  it('sends goal events via typed helpers when configured', async () => {
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = '123456';
    const ym = vi.fn();
    (globalThis as { window: Window & { ym?: typeof ym } }).window = { ym } as Window & { ym?: typeof ym };

    const {
      YANDEX_GOALS,
      trackLeadFormSubmit,
      trackWideFormatFormSubmit,
      trackBagetOrderSubmit,
      trackMugsOrderSubmit,
      trackCalculatorStart,
      trackCalculatorSubmit,
      trackCtaClick,
      trackContactClick,
    } = await import('@/lib/analytics/yandexMetrica');

    trackLeadFormSubmit({ source: 'main' });
    trackWideFormatFormSubmit();
    trackBagetOrderSubmit();
    trackMugsOrderSubmit();
    trackCalculatorStart();
    trackCalculatorSubmit();
    trackCtaClick();
    trackContactClick('email');

    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.leadFormSubmit, { source: 'main' });
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.wideFormatFormSubmit, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.bagetOrderSubmit, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.mugsOrderSubmit, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.calculatorStart, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.calculatorSubmit, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.ctaClick, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.emailClick, undefined);
  });
});
