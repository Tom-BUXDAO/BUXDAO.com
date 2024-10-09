export class KVStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map();
  private timers: Map<string, number> = new Map(); // Use number for Deno environment

  get(key: string): { count: number; resetAt: number } | undefined {
    return this.store.get(key);
  }

  set(key: string, value: { count: number; resetAt: number }, options?: { expireIn?: number }): void {
    this.store.set(key, value);
    if (options?.expireIn) {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key)!);
        console.log(`Cleared existing timer for key: ${key}`);
      }
      const timerId = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
        console.log(`Timer expired and key deleted: ${key}`);
      }, options.expireIn);
      this.timers.set(key, timerId);
      console.log(`Set new timer for key: ${key}`);
    }
  }

  clearAllTimers(): void {
    for (const [key, timerId] of this.timers.entries()) {
      clearTimeout(timerId);
      console.log(`Cleared timer for key: ${key}`);
    }
    this.timers.clear();
    console.log("Cleared all timers");
  }
}

const kv = new KVStore(); // Ensure this is not shared across tests

export function rateLimit(kv: KVStore, ip: string, limit: number, window: number): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const now = Date.now();

  let record = kv.get(key);
  if (!record) {
    record = { count: 0, resetAt: now + window };
    kv.set(key, record, { expireIn: window });
  }

  if (now > record.resetAt) {
    record = { count: 1, resetAt: now + window };
    kv.set(key, record, { expireIn: window });
    return Promise.resolve(true);
  }

  if (record.count >= limit) {
    return Promise.resolve(false);
  }

  record.count++;
  kv.set(key, record, { expireIn: record.resetAt - now });
  return Promise.resolve(true);
}

export async function handleRequest(req: Request): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const allowed = await rateLimit(kv, ip, 5, 60000); // 5 requests per minute

  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  return new Response('Hello, World!');
}