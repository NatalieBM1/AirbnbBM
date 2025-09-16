// Usa el mismo host donde estés abriendo el frontend (sirve para IPs de LAN)
const API_BASE =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/+$/, "")) ||
  `${window.location.protocol}//${window.location.hostname}:3001`;

async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${text}`);
  }
  return res.json();
}

// Búsqueda con filtros reales en /api/properties
export async function fetchSearch({ city, limit = 20, offset = 0, accommodates, priceMin, priceMax }) {
  const q = new URLSearchParams({
    city,
    limit: String(limit),
    offset: String(offset),
  });
  if (accommodates != null) q.set("accommodates", String(accommodates));
  if (priceMin != null) q.set("price_min", String(priceMin));
  if (priceMax != null) q.set("price_max", String(priceMax));
  return request(`/api/properties?${q.toString()}`);
}

// Secciones existentes
export async function fetchPopular({ city, limit = 12 }) {
  const q = new URLSearchParams({ city, limit: String(limit) });
  return request(`/api/properties/popular?${q.toString()}`);
}

export async function fetchNextMonth({ city, limit = 12 }) {
  const q = new URLSearchParams({ city, limit: String(limit) });
  return request(`/api/properties/next-month?${q.toString()}`);
}

export async function fetchDetail({ city, id }) {
  const q = new URLSearchParams({ city });
  return request(`/api/properties/${encodeURIComponent(id)}?${q.toString()}`);
}

export const api = { fetchSearch, fetchPopular, fetchNextMonth, fetchDetail };
