// For production scaling use Redis.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_IP_ENTRIES = 10_000;

type Store = Map<string, number[]>;

function trimWindow(timestamps: number[], now: number): number[] {
  const threshold = now - WINDOW_MS;
  return timestamps.filter((ts) => ts > threshold);
}

function cleanupStore(store: Store, now: number): void {
  for (const [ip, timestamps] of store.entries()) {
    const kept = trimWindow(timestamps, now);
    if (kept.length === 0) {
      store.delete(ip);
      continue;
    }
    if (kept.length !== timestamps.length) {
      store.set(ip, kept);
    }
  }

  if (store.size <= MAX_IP_ENTRIES) {
    return;
  }

  const entries = [...store.entries()]
    .map(([ip, timestamps]) => ({ ip, lastSeen: timestamps[timestamps.length - 1] ?? 0 }))
    .sort((a, b) => a.lastSeen - b.lastSeen);

  const toDelete = store.size - MAX_IP_ENTRIES;
  for (let i = 0; i < toDelete; i += 1) {
    const entry = entries[i];
    if (!entry) break;
    store.delete(entry.ip);
  }
}

export function createSlidingWindowRateLimiter() {
  const store: Store = new Map();

  return {
    isRateLimited(ip: string, now = Date.now()): boolean {
      if (store.size > 0 && now % 20 === 0) {
        cleanupStore(store, now);
      }

      const current = trimWindow(store.get(ip) ?? [], now);
      if (current.length >= MAX_REQUESTS) {
        store.set(ip, current);
        return true;
      }

      current.push(now);
      store.set(ip, current);
      return false;
    },
  };
}

const defaultRateLimiter = createSlidingWindowRateLimiter();

export function isIpRateLimited(ip: string, now = Date.now()): boolean {
  return defaultRateLimiter.isRateLimited(ip, now);
}
