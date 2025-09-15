import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", background: "#0077b6", color: "#fff" }}>
      <h2 style={{ margin: 0 }}>Airbnb Cloneee</h2>
      <ul style={{ display: "flex", gap: "15px", listStyle: "none" }}>
        <li><Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link></li>
        <li><Link to="/booking" style={{ color: "#fff", textDecoration: "none" }}>Booking</Link></li>
        <li><Link to="/payment" style={{ color: "#fff", textDecoration: "none" }}>Payment</Link></li>
        <li><Link to="/notifications" style={{ color: "#fff", textDecoration: "none" }}>Notifications</Link></li>
        <li><Link to="/property" style={{ color: "#fff", textDecoration: "none" }}>Property</Link></li>
        <li><Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>Register</Link></li>
        <li><Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
