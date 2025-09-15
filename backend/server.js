// server.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"; 
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// Habilitar CORS (para React en localhost:3000)
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Rutas
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API de Airbnb Clone funcionando 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
