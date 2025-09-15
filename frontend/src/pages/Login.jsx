// (Natalie) Inicio de sesión (email/social)

import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", { email, contrasena });
      setMsg(`Bienvenido ${res.data.user.nombre}`);
    } catch (err) {
      setMsg(err.response?.data?.error || "Error en el login");
    }
  };

  return (
    <div>
      <h2>INICIO DE SESIÓN</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
        <button type="submit">Iniciar sesión</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}

export default Login;
