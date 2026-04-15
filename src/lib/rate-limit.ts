// In-memory limiter is a single-instance fallback.
// For production scaling across multiple instances, inject a shared store implementation.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_IP_ENTRIES = 10_000;

type Store = Map<string, number[]>;
type SlidingWindowRecord = {
  ip: string;
  timestamps: number[];
};

export type SlidingWindowRateLimitStore = {
  get(ip: string): number[] | undefined;
  set(ip: string, timestamps: number[]): void;
  delete(ip: string): void;
  size(): number;
  entries(): SlidingWindowRecord[];
};

function createInMemoryRateLimitStore(): SlidingWindowRateLimitStore {
  const store: Store = new Map();
  return {
    get: (ip) => store.get(ip),
    set: (ip, timestamps) => {
      store.set(ip, timestamps);
    },
    delete: (ip) => {
      store.delete(ip);
    },
    size: () => store.size,
    entries: () => [...store.entries()].map(([ip, timestamps]) => ({ ip, timestamps })),
  };
}

function trimWindow(timestamps: number[], now: number): number[] {
  const threshold = now - WINDOW_MS;
  return timestamps.filter((ts) => ts > threshold);
}

function cleanupStore(store: SlidingWindowRateLimitStore, now: number): void {
  for (const { ip, timestamps } of store.entries()) {
    const kept = trimWindow(timestamps, now);
    if (kept.length === 0) {
      store.delete(ip);
      continue;
    }
    if (kept.length !== timestamps.length) {
      store.set(ip, kept);
    }
  }

  if (store.size() <= MAX_IP_ENTRIES) {
    return;
  }

  const entries = store.entries()
    .map(({ ip, timestamps }) => ({ ip, lastSeen: timestamps[timestamps.length - 1] ?? 0 }))
    .sort((a, b) => a.lastSeen - b.lastSeen);

  const toDelete = store.size() - MAX_IP_ENTRIES;
  for (let i = 0; i < toDelete; i += 1) {
    const entry = entries[i];
    if (!entry) break;
    store.delete(entry.ip);
  }
}

export function createSlidingWindowRateLimiter(options: { store?: SlidingWindowRateLimitStore } = {}) {
  const store = options.store ?? createInMemoryRateLimitStore();

  return {
    isRateLimited(ip: string, now = Date.now()): boolean {
      if (store.size() > 0 && now % 20 === 0) {
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
