import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function currencyForCity(city) {
  // Tus ciudades son de USA → USD
  const map = { asheville: "USD", austin: "USD", boston: "USD", chicago: "USD", dallas: "USD" };
  return map[String(city || "").toLowerCase()] || "USD";
}

export default function PropertyCard({ item, city }) {
  const nav = useNavigate();

  // Fallback estable por si la URL del dataset viene vacía o falla (403/404)
  const fallback = useMemo(
    () =>
      `https://picsum.photos/seed/${encodeURIComponent(
        item?.id || item?.nombre || "listing"
      )}/800/600`,
    [item?.id, item?.nombre]
  );

  // URL principal del dataset (puede venir vacía)
  const mainUrl =
    (item?.picture_url && String(item.picture_url).trim()) ||
    (item?.raw?.thumbnail_url && String(item.raw.thumbnail_url).trim()) ||
    "";

  const [imgSrc, setImgSrc] = useState(mainUrl || fallback);

  const handleImgError = () => {
    if (imgSrc !== fallback) setImgSrc(fallback);
  };

  const rating100 = Number(item?.raw?.review_scores_rating ?? 0); // 0..100
  const rating5 = rating100 ? (rating100 / 20).toFixed(2) : null;

  const goDetail = () =>
    nav(`/property/${encodeURIComponent(item.id)}?city=${encodeURIComponent(city)}`);

  const curr = currencyForCity(city);

  return (
    <article className="ab-card" onClick={goDetail} role="button" tabIndex={0}>
      <div className="ab-card-media">
        <img
          src={imgSrc}
          alt={item?.nombre || "Propiedad"}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImgError}
        />
        <button
          className="ab-like"
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Guardar"
        >
          ♥
        </button>
        <div className="ab-badge">Favorito entre huéspedes</div>
      </div>

      <div className="ab-card-info">
        <h3 className="ab-title" title={item?.nombre}>
          {item?.nombre || "Sin título"}
        </h3>

        <div className="ab-subline">
          {item?.ubicacion ? item.ubicacion : "\u00A0"}
          {rating5 ? <span className="ab-rating">★ {rating5}</span> : null}
        </div>

        <div className="ab-price">
          {item?.precio != null ? (
            <>
              <strong>${Number(item.precio).toLocaleString()}</strong>
              <span>&nbsp;{curr} por 2 noches</span>
            </>
          ) : (
            <span>Precio no disponible</span>
          )}
        </div>
      </div>
    </article>
  );
}
