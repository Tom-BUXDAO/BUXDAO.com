// backend/supabase/functions/rate-limiter.ts

// Mock KV store using a Map
class KVStore {
  private store: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.store.get(key);
  }

  async set(key: string, value: any, options?: { expireIn?: number }): Promise<void> {
    this.store.set(key, value);
    if (options?.expireIn) {
      setTimeout(() => this.store.delete(key), options.expireIn);
    }
  }
}

const kv = new KVStore();

export async function rateLimit(ip: string, limit: number, window: number): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const now = Date.now();

  let record = await kv.get(key);
  if (!record) {
    record = { count: 0, resetAt: now + window };
    await kv.set(key, record, { expireIn: window });
  }

  if (now > record.resetAt) {
    record = { count: 1, resetAt: now + window };
    await kv.set(key, record, { expireIn: window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  await kv.set(key, record, { expireIn: record.resetAt - now });
  return true;
}

// Example usage
export async function handleRequest(req: Request): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const allowed = await rateLimit(ip, 5, 60000); // 5 requests per minute

  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Process the request normally
  return new Response('Hello, World!');
}
