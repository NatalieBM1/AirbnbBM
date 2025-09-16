// backend/routes/propertyRoutes.js (ESM)
import express from "express";
import {
  getProperties,
  getPropertyDetail,
  getCities,
  getPopular,
  getNextMonth,
} from "../controllers/propertyController.js";

const router = express.Router();

// Info de ciudades soportadas
router.get("/cities", getCities);

// Carruseles
router.get("/popular", getPopular);
router.get("/next-month", getNextMonth);

// Listado y detalle
router.get("/", getProperties);
router.get("/:id", getPropertyDetail);

export default router;
