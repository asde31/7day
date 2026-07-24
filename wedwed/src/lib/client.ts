// Обёртка над fetch для админ-панели: JSON, обработка ошибок, credentials.
export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({ ok: false, error: 'Ошибка сети' }));
  if (!res.ok || !json.ok) {
    throw new Error(json.error || `Ошибка ${res.status}`);
  }
  return json.data as T;
}
