export async function postJSON<T>(url: string, data: unknown): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('Failed request');
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}