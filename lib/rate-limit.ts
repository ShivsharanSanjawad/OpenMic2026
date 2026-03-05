type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function checkRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || now > current.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (current.count >= max) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  store.set(key, current);
  return { allowed: true, remaining: max - current.count, resetAt: current.resetAt };
}
