import "dotenv/config.js";
import express from "express";
import cors from "cors";
import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// 👇 Permite cualquier origen en dev (reflejado)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.send("API de Airbnb Clone funcionando 🚀"));
app.get("/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use("/api/properties", propertyRoutes);

app.use((req, res) => res.status(404).json({ message: "Ruta no encontrada", path: req.originalUrl }));
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ message: "Error interno del servidor", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
