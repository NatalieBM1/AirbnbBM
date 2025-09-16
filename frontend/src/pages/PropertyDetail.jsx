import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../styles/airbnb.css";
import { fetchDetail } from "../services/api";

function currencyForCity(city) {
  const map = { asheville: "USD", austin: "USD", boston: "USD", chicago: "USD", dallas: "USD" };
  return map[String(city || "").toLowerCase()] || "USD";
}

export default function PropertyDetail() {
  const nav = useNavigate();
  const { id: idFromParams } = useParams();
  const [sp] = useSearchParams();

  // Soporta /property/:id?city=... y /property?id=...&city=...
  const id = idFromParams || sp.get("id") || "";
  const city = sp.get("city") || "chicago";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const curr = currencyForCity(city);

  // Fallback de imagen principal
  const fallback = useMemo(
    () => `https://picsum.photos/seed/${encodeURIComponent(id || "property")}/1200/800`,
    [id]
  );
  const [heroSrc, setHeroSrc] = useState(fallback);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) {
        setErr("Falta el parámetro ID.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const d = await fetchDetail({ city, id });
        if (!alive) return;
        setData(d);
        const mainUrl =
          (d?.picture_url && String(d.picture_url).trim()) ||
          (d?.raw?.thumbnail_url && String(d.raw.thumbnail_url).trim()) ||
          "";
        setHeroSrc(mainUrl || fallback);
        setErr("");
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el detalle.");
        setHeroSrc(fallback);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [city, id, fallback]);

  // Helpers para render condicional sin "N/D"
  const detailItems = useMemo(() => {
    const items = [];

    const tipo = [data?.property_type, data?.room_type].filter(Boolean).join(" – ");
    if (tipo) items.push({ k: "Tipo", v: tipo });

    if (data?.accommodates != null) items.push({ k: "Huéspedes", v: String(data.accommodates) });
    if (data?.bedrooms != null) items.push({ k: "Habitaciones", v: String(data.bedrooms) });
    if (data?.bathrooms != null) items.push({ k: "Baños", v: String(data.bathrooms) });
    if (data?.host_name) items.push({ k: "Anfitrión", v: data.host_name });
    if (data?.id) items.push({ k: "ID", v: String(data.id) });

    return items;
  }, [data]);

  return (
    <main className="ab-container">
      {err && <div className="ab-alert ab-alert-danger">{err}</div>}

      <button className="ab-arrow" onClick={() => nav(-1)} aria-label="Volver">
        ←
      </button>

      <section className="ab-section" style={{ marginTop: 12 }}>
        {loading ? (
          <div className="ab-card ab-skel">
            <div className="ab-card-media skel" style={{ aspectRatio: "3/2" }} />
            <div className="ab-card-info">
              <div className="skel skel-line" />
              <div className="skel skel-line w-60" />
              <div className="skel skel-line w-40" />
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={heroSrc}
                alt={data?.nombre || "Propiedad"}
                style={{ width: "100%", height: "auto", display: "block" }}
                referrerPolicy="no-referrer"
                decoding="async"
                onError={() => heroSrc !== fallback && setHeroSrc(fallback)}
              />
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
              <h1 style={{ margin: 0 }}>{data?.nombre || "Propiedad"}</h1>
              <div style={{ color: "var(--muted)" }}>
                {data?.ubicacion || "Ubicación no disponible"}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="ab-card" style={{ minWidth: 0 }}>
                  <div className="ab-card-info">
                    <h3 className="ab-title">Detalles</h3>
                    <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
                      {detailItems.length === 0 ? (
                        <li>—</li>
                      ) : (
                        detailItems.map((it) => (
                          <li key={it.k}>
                            {it.k}: {it.v}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                <div className="ab-card" style={{ minWidth: 0 }}>
                  <div className="ab-card-info">
                    <h3 className="ab-title">Precio</h3>
                    <div className="ab-price" style={{ fontSize: 18 }}>
                      {data?.precio != null ? (
                        <>
                          <strong>
                            ${Number(data.precio).toLocaleString()}
                          </strong>
                          <span>&nbsp;{curr} por 2 noches</span>
                        </>
                      ) : (
                        <span>No disponible</span>
                      )}
                    </div>
                    <p style={{ color: "var(--muted)" }}>
                      *Precios aproximados según dataset de InsideAirbnb (moneda local de la ciudad).
                    </p>
                  </div>
                </div>
              </div>

              {data?.descripcion ? (
                <div className="ab-card">
                  <div className="ab-card-info">
                    <h3 className="ab-title">Descripción</h3>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {data.descripcion}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="ab-card">
                <div className="ab-card-info">
                  <h3 className="ab-title">Ubicación</h3>
                  <p style={{ margin: 0 }}>
                    {data?.latitude != null && data?.longitude != null
                      ? `Lat: ${data.latitude} – Lng: ${data.longitude}`
                      : "Coordenadas no disponibles"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
