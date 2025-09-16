// backend/controllers/propertyController.js (ESM)
import csv from "csv-parser";
import { Readable } from "stream";
import { gunzipSync } from "zlib";

/* ===========================
   1) FUENTES (InsideAirbnb)
   =========================== */
const urls = {
  asheville:
    "https://data.insideairbnb.com/united-states/nc/asheville/2025-06-17/visualisations/listings.csv.gz",
  austin:
    "https://data.insideairbnb.com/united-states/tx/austin/2025-06-13/visualisations/listings.csv.gz",
  boston:
    "https://data.insideairbnb.com/united-states/ma/boston/2025-06-19/visualisations/listings.csv.gz",
  chicago:
    "https://data.insideairbnb.com/united-states/il/chicago/2025-06-17/visualisations/listings.csv.gz",
  dallas:
    "https://data.insideairbnb.com/united-states/tx/dallas/2025-08-19/visualisations/listings.csv.gz",
};

const CITY_LABELS = {
  asheville: "Asheville, NC",
  austin: "Austin, TX",
  boston: "Boston, MA",
  chicago: "Chicago, IL",
  dallas: "Dallas, TX",
};

/* ===========================
   2) CACHÉ Y HELPERS
   =========================== */
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 min
const cache = new Map(); // city -> { at, rows }

function int(v) {
  const n = parseInt(String(v ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}
function num(v) {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function normalizeCity(q) {
  const city = (q || "asheville").toLowerCase();
  if (!urls[city]) return null;
  return city;
}

/* ===========================
   3) IMAGEN DE RESPALDO (100% gratis, sin llamadas externas)
   =========================== */
function fallbackImage({ id, city, property_type, room_type }) {
  const seed = encodeURIComponent(
    `${id || ""}-${city || ""}-${property_type || ""}-${room_type || ""}`
  );
  // Picsum genera una imagen estable por "seed"
  return `https://picsum.photos/seed/${seed}/800/600`;
}

/* ======================================================
   4) DESCARGA ROBUSTA DEL CSV (detecta gzip por magic bytes)
   ====================================================== */
async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const isHtml = body?.toLowerCase?.().includes("<html");
    throw new Error(
      `Descarga fallida ${res.status} ${res.statusText} en ${url}${isHtml ? " (parece HTML/404)" : ""}`
    );
  }

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);

  // Magic bytes gzip: 1F 8B
  const isGzip = buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b;

  let csvBuffer = buf;
  if (isGzip) {
    try {
      csvBuffer = gunzipSync(buf);
    } catch (e) {
      throw new Error(`No se pudo descomprimir GZIP (${e.message}) en ${url}`);
    }
  }

  return new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(csvBuffer)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function getRowsForCity(city) {
  const hit = cache.get(city);
  const now = Date.now();
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.rows;
  const rows = await fetchCSV(urls[city]);
  cache.set(city, { at: now, rows });
  return rows;
}

/* ===========================
   5) MAPEADOR DE PROPIEDADES
   =========================== */
function mapProperty(row) {
  const base = {
    id: String(row.id ?? row.listing_id ?? ""),
    nombre: row.name || row.listing_name || "Sin título",
    descripcion:
      row.description || row.summary || row.neighborhood_overview || "",
    precio: num(row.price) ?? num(row.minimum_nights_avg_ntm) ?? null,
    ubicacion:
      row.neighbourhood_cleansed || row.neighbourhood || row.city || "",
    accommodates: int(row.accommodates),
    bedrooms: int(row.bedrooms),
    bathrooms: num(row.bathrooms_text) ?? num(row.bathrooms),
    property_type: row.property_type || "",
    room_type: row.room_type || "",
    host_name: row.host_name || "",
    latitude: num(row.latitude),
    longitude: num(row.longitude),
    raw: row,
  };

  let picture_url =
    (row.picture_url && String(row.picture_url).trim()) ||
    (row.medium_url && String(row.medium_url).trim()) ||
    (row.xl_picture_url && String(row.xl_picture_url).trim()) ||
    (row.thumbnail_url && String(row.thumbnail_url).trim());

  if (!picture_url) {
    picture_url = fallbackImage({
      id: base.id,
      city: base.ubicacion || row.city,
      property_type: base.property_type,
      room_type: base.room_type,
    });
  }

  return { ...base, picture_url };
}

/* ===========================
   6) ENDPOINTS
   =========================== */

// GET /api/properties
export const getProperties = async (req, res) => {
  try {
    const city = normalizeCity(req.query.city);
    if (!city) return res.status(400).json({ message: "Ciudad no soportada" });

    const limit = Math.max(0, int(req.query.limit) ?? 20);
    const offset = Math.max(0, int(req.query.offset) ?? 0);
    const priceMin = num(req.query.price_min);
    const priceMax = num(req.query.price_max);
    const accommodatesQ = int(req.query.accommodates);

    const rows = await getRowsForCity(city);

    let filtered = rows.filter((r) => {
      if (accommodatesQ != null && int(r.accommodates) < accommodatesQ)
        return false;
      const p = num(r.price);
      if (priceMin != null && p != null && p < priceMin) return false;
      if (priceMax != null && p != null && p > priceMax) return false;
      return true;
    });

    const total = filtered.length;
    const slice = filtered.slice(offset, offset + (limit || total));
    const items = slice.map(mapProperty);

    res.json({ city, total, count: items.length, offset, limit, items });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener propiedades", error: error.message });
  }
};

// GET /api/properties/:id
export const getPropertyDetail = async (req, res) => {
  try {
    const city = normalizeCity(req.query.city);
    if (!city) return res.status(400).json({ message: "Ciudad no soportada" });

    const id = String(req.params.id);
    const rows = await getRowsForCity(city);
    const raw = rows.find((r) => String(r.id ?? r.listing_id ?? "") === id);
    if (!raw) return res.status(404).json({ message: "Propiedad no encontrada" });

    res.json(mapProperty(raw));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener detalle de propiedad", error: error.message });
  }
};

// GET /api/properties/popular
export const getPopular = async (req, res) => {
  try {
    const city = normalizeCity(req.query.city);
    if (!city) return res.status(400).json({ message: "Ciudad no soportada" });
    const limit = Math.max(0, int(req.query.limit) ?? 12);

    const rows = await getRowsForCity(city);

    const sorted = [...rows].sort((a, b) => {
      const ra = num(a.review_scores_rating) ?? 0; // 0..100
      const rb = num(b.review_scores_rating) ?? 0;
      const ca = int(a.number_of_reviews) ?? 0;
      const cb = int(b.number_of_reviews) ?? 0;
      return rb - ra || cb - ca; // rating desc, luego reviews desc
    });

    const slice = sorted.slice(0, limit);
    const items = slice.map(mapProperty);

    res.json({ city, count: items.length, items });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en populares", error: error.message });
  }
};

// GET /api/properties/next-month
export const getNextMonth = async (req, res) => {
  try {
    const city = normalizeCity(req.query.city);
    if (!city) return res.status(400).json({ message: "Ciudad no soportada" });
    const limit = Math.max(0, int(req.query.limit) ?? 12);

    const rows = await getRowsForCity(city);
    const availKeys = ["availability_30", "availability_60", "availability_90", "availability_365"];

    let filtered = rows.filter((r) => availKeys.some((k) => Number(r?.[k] ?? 0) > 0));
    if (filtered.length === 0) filtered = rows; // fallback para no dejar vacío

    const slice = filtered.slice(0, limit);
    const items = slice.map(mapProperty);

    res.json({ city, count: items.length, items });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en next-month", error: error.message });
  }
};

// GET /api/properties/cities
export const getCities = async (req, res) => {
  try {
    const withCounts = String(req.query.withCounts || "").trim() === "1";
    const citiesBase = Object.keys(urls).map((key) => ({
      key,
      name: CITY_LABELS[key] || key,
    }));

    if (!withCounts) {
      return res.json({ count: citiesBase.length, items: citiesBase });
    }

    const items = await Promise.all(
      citiesBase.map(async (c) => {
        try {
          const rows = await getRowsForCity(c.key);
          return { ...c, count: rows.length };
        } catch {
          return { ...c, count: 0 };
        }
      })
    );

    res.json({ count: items.length, items });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al obtener ciudades", error: err.message });
  }
};
