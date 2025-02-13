import React, { useState } from "react";
import { auth, firebase } from "../firebase/config";
import { navigate } from "gatsby";
import "../styles/global.css";

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("No hay usuario autenticado.");
      return;
    }
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      setMessage("Contraseña actualizada con éxito.");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("La contraseña actual es incorrecta.");
      } else if (err.code === "auth/weak-password") {
        setError("La nueva contraseña es muy débil.");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Por seguridad, debe reautenticarse antes de cambiar la contraseña.");
      } else {
        setError("Error al actualizar la contraseña: " + err.message);
      }
      setMessage("");
    }
  };

  return (
    <div className="change-password-container">
      <h2>Cambiar Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Contraseña Actual:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Actualizar Contraseña</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <button onClick={() => navigate("/")}>Volver</button>
    </div>
  );
};

export default ChangePassword;
