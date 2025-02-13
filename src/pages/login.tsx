import React, { useState } from "react";
import { navigate } from "gatsby";
import { firebase, auth } from "../firebase/config";
import "../styles/global.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
    auth.signInWithEmailAndPassword(email, password)
      .then(() => navigate("/"))
      .catch((err) => {
        setError("Correo o contraseña incorrectos.");
        console.error(err);
      });
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Correo Electrónico:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} id="remember" />
          <label htmlFor="remember">Recuérdame</label>
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        ¿Desea cambiar su contraseña?{" "}
        <span onClick={() => navigate("/ChangePassword")} style={{ color: "#3498db", cursor: "pointer", textDecoration: "underline" }}>
          Haga clic aquí
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
