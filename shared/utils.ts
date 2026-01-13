
export function generateId(prefix: string = ''): string {
  // Simple random ID for local use. In production, use crypto.randomUUID
  const randomPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
  return prefix ? `${prefix}_${randomPart}` : randomPart;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
