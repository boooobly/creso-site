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

    const { trackHit, reachGoal, trackContactClick, YANDEX_GOALS } = await import('@/lib/analytics/yandexMetrica');

    expect(() => trackHit('/services')).not.toThrow();
    expect(() => reachGoal(YANDEX_GOALS.contactFormSubmitSuccess)).not.toThrow();
    expect(() => trackContactClick('phone')).not.toThrow();
    expect(ym).not.toHaveBeenCalled();
  });

  it('no-ops safely when ym function is unavailable', async () => {
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = '123456';
    (globalThis as { window: Window & { ym?: undefined } }).window = {} as Window;

    const { trackGoal, YANDEX_GOALS } = await import('@/lib/analytics/yandexMetrica');

    expect(() => trackGoal(YANDEX_GOALS.reviewSubmitSuccess)).not.toThrow();
  });

  it('sends goal events via typed helpers when configured', async () => {
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = '123456';
    const ym = vi.fn();
    (globalThis as { window: Window & { ym?: typeof ym } }).window = { ym } as Window & { ym?: typeof ym };

    const { YANDEX_GOALS, trackGoal, trackContactClick } = await import('@/lib/analytics/yandexMetrica');

    trackGoal(YANDEX_GOALS.mainLeadSubmitSuccess, { source: 'main' });
    trackGoal(YANDEX_GOALS.wideFormatOrderSubmitSuccess);
    trackGoal(YANDEX_GOALS.bagetOrderSubmitSuccess);
    trackGoal(YANDEX_GOALS.mugsOrderSubmitSuccess);
    trackGoal(YANDEX_GOALS.millingOrderSubmitSuccess);
    trackGoal(YANDEX_GOALS.businessCardsOrderSubmitSuccess);
    trackGoal(YANDEX_GOALS.tshirtsOrderSubmitSuccess);
    trackGoal(YANDEX_GOALS.plotterOrderSubmitSuccess);
    trackGoal(YANDEX_GOALS.outdoorLeadSubmitSuccess);
    trackGoal(YANDEX_GOALS.reviewSubmitSuccess);
    trackContactClick('email');

    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.mainLeadSubmitSuccess, { source: 'main' });
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.wideFormatOrderSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.bagetOrderSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.mugsOrderSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.millingOrderSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.businessCardsOrderSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.tshirtsOrderSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.plotterOrderSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.outdoorLeadSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.reviewSubmitSuccess, undefined);
    expect(ym).toHaveBeenCalledWith(123456, 'reachGoal', YANDEX_GOALS.emailClick, undefined);
  });
});
