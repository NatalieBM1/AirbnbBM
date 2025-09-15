// backend/controllers/propertyController.js (ESM)
import csv from "csv-parser";
import { Readable } from "stream";
import { gunzipSync } from "zlib";

// === URLs InsideAirbnb por ciudad ===
const urls = {
  asheville: "https://data.insideairbnb.com/united-states/nc/asheville/2025-06-17/visualisations/listings.csv.gz",
  austin:   "https://data.insideairbnb.com/united-states/tx/austin/2025-06-13/visualisations/listings.csv.gz",
  boston:   "https://data.insideairbnb.com/united-states/ma/boston/2025-06-19/visualisations/listings.csv.gz",
  chicago:  "https://data.insideairbnb.com/united-states/il/chicago/2025-06-17/visualisations/listings.csv.gz",
  dallas:   "https://data.insideairbnb.com/united-states/tx/dallas/2025-08-19/visualisations/listings.csv.gz",
};

// === Caché simple ===
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 min
const cache = new Map(); // city -> { at, rows }

// === Utils ===
function normalizeCity(q) {
  const city = (q || "asheville").toLowerCase();
  return urls[city] ? city : null;
}
function int(v) {
  const n = parseInt(String(v ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}
function num(v) {
  if (v == null) return null;
  const s = String(v).replace(/[^0-9.\-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// Mapea filas a un esquema estable
function mapProperty(row) {
  return {
    id: String(row.id ?? row.listing_id ?? ""),
    nombre: row.name || row.listing_name || "Sin título",
    descripcion: row.description || row.summary || row.neighborhood_overview || "",
    precio: num(row.price) ?? num(row.minimum_nights_avg_ntm) ?? null,
    ubicacion: row.neighbourhood_cleansed || row.neighbourhood || row.city || "",
    accommodates: int(row.accommodates),
    bedrooms: int(row.bedrooms),
    bathrooms: num(row.bathrooms_text) ?? num(row.bathrooms),
    property_type: row.property_type || "",
    room_type: row.room_type || "",
    host_name: row.host_name || "",
    latitude: num(row.latitude),
    longitude: num(row.longitude),
    picture_url: row.picture_url || row.thumbnail_url || "",
    raw: row,
  };
}

// === Descarga segura con fallback: gz -> CSV plano ===
async function fetchCSVRows(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);

  // Descargamos a memoria para decidir si es gzip o CSV plano
  const ab = await res.arrayBuffer();
  let buf = Buffer.from(ab);

  const ct = (res.headers.get("content-type") || "").toLowerCase();     // application/gzip, text/csv, etc.
  const ce = (res.headers.get("content-encoding") || "").toLowerCase(); // gzip, etc.
  const looksGzip = url.endsWith(".gz") || ct.includes("gzip") || ce.includes("gzip");

  let csvBuffer = buf;
  if (looksGzip) {
    try {
      csvBuffer = gunzipSync(buf);
    } catch {
      // Si no era realmente gzip, seguimos con el buffer tal cual
      csvBuffer = buf;
    }
  }

  // Evita parsear HTML de error como CSV
  const head = csvBuffer.slice(0, 200).toString("utf8");
  if (/<!doctype html>|<html/i.test(head)) {
    throw new Error("El endpoint devolvió HTML en lugar de CSV; revisa la URL de InsideAirbnb.");
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

// === Acceso con caché ===
async function getRowsForCity(city) {
  const hit = cache.get(city);
  const now = Date.now();
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.rows;
  const rows = await fetchCSVRows(urls[city]);
  cache.set(city, { at: now, rows });
  return rows;
}

// === Handlers ===

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
    let mapped = rows.map(mapProperty);

    // Filtros existentes
    if (accommodatesQ != null) mapped = mapped.filter((p) => (p.accommodates ?? 0) >= accommodatesQ);
    if (priceMin != null) mapped = mapped.filter((p) => p.precio == null || p.precio >= priceMin);
    if (priceMax != null) mapped = mapped.filter((p) => p.precio == null || p.precio <= priceMax);

    // === Filtros extra: neighbourhood/barrio y room_type ===
    const neighbourhood = (req.query.neighbourhood || req.query.barrio || "").toString().toLowerCase();
    const roomType = (req.query.room_type || "").toString().toLowerCase();

    if (neighbourhood) {
      mapped = mapped.filter((p) =>
        (p.ubicacion || "").toString().toLowerCase().includes(neighbourhood)
      );
    }
    if (roomType) {
      mapped = mapped.filter((p) =>
        (p.room_type || "").toString().toLowerCase().includes(roomType)
      );
    }
    // =======================================================

    const total = mapped.length;
    const slice = mapped.slice(offset, offset + (limit || total));

    res.json({ city, total, count: slice.length, offset, limit, items: slice });
  } catch (error) {
    console.error("getProperties error:", error);
    res.status(500).json({ message: "Error al obtener propiedades", error: error.message });
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
    console.error("getPropertyDetail error:", error);
    res.status(500).json({ message: "Error al obtener detalle de propiedad", error: error.message });
  }
};

// GET /api/properties/cities
export const getCities = (_req, res) => {
  res.json({ cities: Object.keys(urls) });
};
