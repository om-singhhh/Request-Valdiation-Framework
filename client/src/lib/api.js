const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function apiFetch(path, init) {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { ok: false, error: { message: 'Invalid JSON from server' } };
  }
  return { res, json };
}

export function getApiBase() {
  return BASE;
}
