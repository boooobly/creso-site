export type AnalyticsPayload = Record<string, unknown>;

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
};

const runOnIdle = (task: () => void) => {
  if (typeof window === 'undefined') return;

  const clientWindow = window as IdleWindow;
  if (typeof clientWindow.requestIdleCallback === 'function') {
    clientWindow.requestIdleCallback(() => task(), { timeout: 500 });
    return;
  }

  setTimeout(task, 0);
};

export function trackEvent(eventName: string, payload?: AnalyticsPayload): void {
  if (typeof window === 'undefined') return;

  runOnIdle(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics]', eventName, payload ?? {});
    }

    // Placeholder for future analytics integrations (GA, Yandex, custom API, etc.)
    // Keep this async/non-blocking so UI interactions remain fast.
    void eventName;
    void payload;
  });
}
