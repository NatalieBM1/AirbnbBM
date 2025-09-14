import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contrasena: "",
    rol: "viajero",
    telefono: "",
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/auth/register", formData);
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.error || "Error en el registro");
    }
  };

  return (
    <div>
      <h2>REGISTRO</h2>
      <form onSubmit={handleSubmit}>
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Correo" onChange={handleChange} required />
        <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required />
        <select name="rol" onChange={handleChange}>
          <option value="Viajero">Viajero</option>
          <option value="Anfitrion">Anfitrion</option>
        </select>
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
        <button type="submit">Registrarse</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}

export default Register;
