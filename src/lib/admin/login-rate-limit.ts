const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 10 * 60 * 1000;
const MAX_IP_ENTRIES = 10_000;

type AttemptState = {
  failures: number[];
  lockedUntil: number | null;
};

type Store = Map<string, AttemptState>;
type AdminLoginRecord = {
  ip: string;
  state: AttemptState;
};

export type AdminLoginRateLimitStore = {
  get(ip: string): AttemptState | undefined;
  set(ip: string, state: AttemptState): void;
  delete(ip: string): void;
  size(): number;
  entries(): AdminLoginRecord[];
};

function createInMemoryAdminLoginRateLimitStore(): AdminLoginRateLimitStore {
  const store: Store = new Map();
  return {
    get: (ip) => store.get(ip),
    set: (ip, state) => {
      store.set(ip, state);
    },
    delete: (ip) => {
      store.delete(ip);
    },
    size: () => store.size,
    entries: () => [...store.entries()].map(([ip, state]) => ({ ip, state })),
  };
}

function trimFailures(failures: number[], now: number): number[] {
  const threshold = now - WINDOW_MS;
  return failures.filter((ts) => ts > threshold);
}

function cleanupStore(store: AdminLoginRateLimitStore, now: number): void {
  for (const { ip, state } of store.entries()) {
    const failures = trimFailures(state.failures, now);
    const stillLocked = state.lockedUntil !== null && state.lockedUntil > now;

    if (failures.length === 0 && !stillLocked) {
      store.delete(ip);
      continue;
    }

    store.set(ip, {
      failures,
      lockedUntil: stillLocked ? state.lockedUntil : null,
    });
  }

  if (store.size() <= MAX_IP_ENTRIES) {
    return;
  }

  const entries = store.entries()
    .map(({ ip, state }) => {
      const lastFailure = state.failures[state.failures.length - 1] ?? 0;
      const lockTs = state.lockedUntil ?? 0;
      return { ip, lastSeen: Math.max(lastFailure, lockTs) };
    })
    .sort((a, b) => a.lastSeen - b.lastSeen);

  const toDelete = store.size() - MAX_IP_ENTRIES;
  for (let i = 0; i < toDelete; i += 1) {
    const entry = entries[i];
    if (!entry) break;
    store.delete(entry.ip);
  }
}

export function createAdminLoginRateLimiter(options: { store?: AdminLoginRateLimitStore } = {}) {
  const store = options.store ?? createInMemoryAdminLoginRateLimitStore();

  return {
    isLocked(ip: string, now = Date.now()): boolean {
      if (store.size() > 0 && now % 20 === 0) {
        cleanupStore(store, now);
      }

      const current = store.get(ip);
      if (!current) return false;

      if (current.lockedUntil !== null && current.lockedUntil > now) {
        return true;
      }

      const trimmed = trimFailures(current.failures, now);
      if (trimmed.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, { failures: trimmed, lockedUntil: null });
      }

      return false;
    },

    registerFailure(ip: string, now = Date.now()): { locked: boolean; failuresInWindow: number } {
      if (store.size() > 0 && now % 20 === 0) {
        cleanupStore(store, now);
      }

      const current = store.get(ip) ?? { failures: [], lockedUntil: null };

      if (current.lockedUntil !== null && current.lockedUntil > now) {
        return { locked: true, failuresInWindow: trimFailures(current.failures, now).length };
      }

      const failures = trimFailures(current.failures, now);
      failures.push(now);

      const locked = failures.length >= MAX_ATTEMPTS;
      store.set(ip, {
        failures,
        lockedUntil: locked ? now + COOLDOWN_MS : null,
      });

      return { locked, failuresInWindow: failures.length };
    },

    reset(ip: string): void {
      store.delete(ip);
    },
  };
}

const defaultAdminLoginRateLimiter = createAdminLoginRateLimiter();

export function isAdminLoginLocked(ip: string, now = Date.now()): boolean {
  return defaultAdminLoginRateLimiter.isLocked(ip, now);
}

export function registerAdminLoginFailure(ip: string, now = Date.now()): { locked: boolean; failuresInWindow: number } {
  return defaultAdminLoginRateLimiter.registerFailure(ip, now);
}

export function resetAdminLoginFailures(ip: string): void {
  defaultAdminLoginRateLimiter.reset(ip);
}

export const ADMIN_LOGIN_RATE_LIMIT_CONFIG = {
  windowMs: WINDOW_MS,
  maxAttempts: MAX_ATTEMPTS,
  cooldownMs: COOLDOWN_MS,
};
