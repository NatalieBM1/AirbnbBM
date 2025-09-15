// backend/server.js
import express from "express";
import cors from "cors";
import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/properties", propertyRoutes);

app.get("/", (_req, res) => res.send("API de Airbnb Clone funcionando 🚀"));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
