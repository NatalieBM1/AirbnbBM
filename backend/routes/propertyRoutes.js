// backend/routes/propertyRoutes.js (ESM)
import express from "express";
import { getProperties, getPropertyDetail, getCities } from "../controllers/propertyController.js";

const router = express.Router();

router.get("/cities", getCities);   // lista ciudades
router.get("/", getProperties);     // listado
router.get("/:id", getPropertyDetail); // detalle

export default router;
