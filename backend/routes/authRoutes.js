// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { nombre, apellido, email, contrasena, rol, telefono } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const { data, error } = await supabase
      .from("perfiles")
      .insert([{ nombre, apellido, email, contrasena: hashedPassword, rol, telefono }]);

    if (error) throw error;

    res.json({ message: "Usuario registrado con éxito", user: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
