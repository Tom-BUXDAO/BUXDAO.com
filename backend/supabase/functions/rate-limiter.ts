const kv = await Deno.openKv();

export async function rateLimit(ip: string, limit: number, window: number): Promise<boolean> {
  const key = ['rate-limit', ip];
  const now = Date.now();

  const result = await kv.get(key);
  let timestamps: number[] = result.value || [];

  timestamps = timestamps.filter((timestamp: number) => now - timestamp < window);
  
  if (timestamps.length >= limit) {
    return false;
  }

  timestamps.push(now);
  await kv.set(key, timestamps);

  return true;
}
