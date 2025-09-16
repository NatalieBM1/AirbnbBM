import React, { useEffect, useMemo, useState } from "react";
import "../styles/airbnb.css";
import CarouselSection from "../components/CarouselSection";
import { fetchSearch, fetchPopular, fetchNextMonth } from "../services/api";

// Alias de ciudades visibles -> datasets reales
const CITY_ALIASES = {
  
  chicago: "chicago",
  austin: "austin",
  boston: "boston",
  asheville: "asheville",
  dallas: "dallas",
};

function normCity(q) {
  const s = String(q || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return CITY_ALIASES[s] || null;
}
function labelCity(c) {
  return c === "chicago"
    ? "Chicago"
    : c === "austin"
    ? "Austin"
    : c === "boston"
    ? "Boston"
    : c === "asheville"
    ? "Asheville"
    : c === "dallas"
    ? "Dallas"
    : c;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("stays"); // 'stays' | 'exp' | 'services'

  // búsqueda
  const [where, setWhere] = useState("chicago");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  // popovers sencillos
  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  // ciudades para las secciones
  const [cityPopular, setCityPopular] = useState("chicago");
  const [cityNext, setCityNext] = useState("austin");

  // datos
  const [popular, setPopular] = useState([]);
  const [nextMonth, setNextMonth] = useState([]);
  const [results, setResults] = useState([]); // resultados de búsqueda
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingNext, setLoadingNext] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState("");

  const titles = useMemo(() => {
    return {
      results:
        results?.length > 0
          ? `Resultados en ${labelCity(cityPopular)}`
          : `Sugerencias en ${labelCity(cityPopular)}`,
      popular: `Alojamientos populares en ${labelCity(cityPopular)}`,
      next: `Disponibles el próximo mes cerca de ${labelCity(cityNext)}`,
    };
  }, [results, cityPopular, cityNext]);

  // Carga inicial de secciones
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingPopular(true);
        const data = await fetchPopular({ city: cityPopular, limit: 12 });
        if (!alive) return;
        setPopular(data?.items ?? data ?? []);
      } catch (e) {
        console.error(e);
        setPopular([]);
        setError("Failed to fetch");
      } finally {
        if (alive) setLoadingPopular(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [cityPopular]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingNext(true);
        const data = await fetchNextMonth({ city: cityNext, limit: 12 });
        if (!alive) return;
        setNextMonth(data?.items ?? data ?? []);
      } catch (e) {
        console.error(e);
        setNextMonth([]);
        setError("Failed to fetch");
      } finally {
        if (alive) setLoadingNext(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [cityNext]);

  // Ejecutar búsqueda real (usa /api/properties con accommodates)
  const onSearch = async () => {
    const mapped = normCity(where);
    if (!mapped) {
      setError(
        "Ciudad no soportada. Prueba: Chicago, Austin, Boston, Asheville o Dallas."
      );
      return;
    }
    setError("");
    setCityPopular(mapped);
    setCityNext(mapped);

    try {
      setLoadingSearch(true);
      const data = await fetchSearch({
        city: mapped,
        limit: 20,
        accommodates: guests || undefined,
      });
      setResults(data?.items ?? data ?? []);
    } catch (e) {
      console.error(e);
      setResults([]);
      setError("Failed to fetch");
    } finally {
      setLoadingSearch(false);
    }
  };

  // decide qué mostrar en Alojamientos
  const stays = (
    <>
      <div className="ab-search">
        <div className="ab-chip">
          <div className="ab-chip-title">Dónde</div>
          <input
            className="ab-input"
            placeholder="Explora destinos (Chicago, Austin, Boston...)"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
          />
        </div>

        <div
          className={`ab-chip ${openIn ? "open" : ""}`}
          onClick={() => {
            setOpenIn((v) => !v);
            setOpenOut(false);
            setOpenGuests(false);
          }}
        >
          <div className="ab-chip-title">Check-in</div>
          <div className="ab-chip-sub">{checkIn || "Agrega fecha"}</div>
          {openIn && (
            <div className="ab-pop">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
          )}
        </div>

        <div
          className={`ab-chip ${openOut ? "open" : ""}`}
          onClick={() => {
            setOpenOut((v) => !v);
            setOpenIn(false);
            setOpenGuests(false);
          }}
        >
          <div className="ab-chip-title">Check-out</div>
          <div className="ab-chip-sub">{checkOut || "Agrega fecha"}</div>
          {openOut && (
            <div className="ab-pop">
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          )}
        </div>

        <div
          className={`ab-chip ${openGuests ? "open" : ""}`}
          onClick={() => {
            setOpenGuests((v) => !v);
            setOpenIn(false);
            setOpenOut(false);
          }}
        >
          <div className="ab-chip-title">Quién</div>
          <div className="ab-chip-sub">{guests || 1} huésped(es)</div>
          {openGuests && (
            <div className="ab-pop">
              <label style={{ fontSize: 13, color: "#444" }}>Huéspedes</label>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
              />
            </div>
          )}
        </div>

        <button className="ab-go" onClick={onSearch} aria-label="Buscar">
          🔎
        </button>
      </div>

      {/* Resultados (si hay búsqueda) o Populares */}
      <CarouselSection
        title={
          loadingSearch
            ? "Buscando resultados…"
            : results?.length
            ? titles.results
            : titles.popular
        }
        items={results?.length ? results : popular}
        city={cityPopular}
        loading={loadingPopular || loadingSearch}
      />

      {/* Próximo mes */}
      <CarouselSection
        title={titles.next}
        items={nextMonth}
        city={cityNext}
        loading={loadingNext}
      />
    </>
  );

  // Experiencias (placeholder bonito)
  const experiences = (
    <section className="ab-section">
      <div className="ab-head">
        <h2>Experiencias destacadas cerca de ti</h2>
      </div>
      <div className="ab-strip">
        {["Gastronómica", "Tour en bici", "Clases de café", "Caminata urbana", "Pintura local", "Bar Hopping"].map(
          (name, i) => (
            <article key={i} className="ab-card">
              <div className="ab-card-media">
                <img
                  src={`https://picsum.photos/seed/exp-${i}/800/600`}
                  alt={name}
                  loading="lazy"
                />
                <div className="ab-badge">NOVEDAD</div>
              </div>
              <div className="ab-card-info">
                <h3 className="ab-title">{name}</h3>
                <div className="ab-subline">
                  Desde <span className="ab-rating">$ {(20 + i * 5).toFixed(0)} USD</span>
                </div>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );

  // Servicios (placeholder)
  const services = (
    <section className="ab-section">
      <div className="ab-head">
        <h2>Servicios para tu estadía</h2>
      </div>
      <div className="ab-strip">
        {[
          { name: "Limpieza", icon: "🧽" },
          { name: "Transporte", icon: "🚘" },
          { name: "Guarda equipaje", icon: "🧳" },
          { name: "Chef a domicilio", icon: "👨‍🍳" },
          { name: "Tours privados", icon: "🗺️" },
        ].map((s, i) => (
          <article key={i} className="ab-card">
            <div className="ab-card-media">
              <img
                src={`https://picsum.photos/seed/svc-${i}/800/600`}
                alt={s.name}
                loading="lazy"
              />
              <div className="ab-badge">{s.icon}</div>
            </div>
            <div className="ab-card-info">
              <h3 className="ab-title">{s.name}</h3>
              <div className="ab-subline">Consulta disponibilidad</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <main className="ab-container">
      {error && <div className="ab-alert ab-alert-danger">Error: {error}</div>}

      {/* Tabs funcionales */}
      <div className="ab-tabs">
        <button
          className={`ab-tab ${activeTab === "stays" ? "ab-tab-active" : ""}`}
          onClick={() => setActiveTab("stays")}
        >
          Alojamientos
        </button>
        <button
          className={`ab-tab ${activeTab === "exp" ? "ab-tab-active" : ""}`}
          onClick={() => setActiveTab("exp")}
        >
          Experiencias
        </button>
        <button
          className={`ab-tab ${activeTab === "services" ? "ab-tab-active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          Servicios
        </button>
      </div>

      {activeTab === "stays" ? stays : activeTab === "exp" ? experiences : services}
    </main>
  );
}
