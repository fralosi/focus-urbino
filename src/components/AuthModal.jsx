import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authType, setAuthType] = useState("login"); // oppure "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  if (authType === "register" && password.length < 8) {
    setError("La password deve contenere almeno 8 caratteri.");
    setLoading(false);
    return;
  }

  if (authType === "login") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      if (onClose) onClose();
      if (onLoginSuccess) onLoginSuccess((await supabase.auth.getUser()).data.user);
      window.alert("Login eseguito!");
    }
  } else {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      if (onClose) onClose();
      if (onLoginSuccess) onLoginSuccess((await supabase.auth.getUser()).data.user);
      window.alert("Registrazione completata!");
    }
  }

  setLoading(false);
};

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1f2937",
          color: "#fff",
          padding: "36px 24px",
          borderRadius: 18,
          minWidth: 320,
          maxWidth: 380,
          boxShadow: "0 0 32px #1118",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>
          {authType === "login"
            ? "Login Focus Urbino"
            : "Registrazione Focus Urbino"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: 0,
                marginBottom: 8,
              }}
              placeholder="tuo@email.it"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              autoComplete={authType === "login" ? "current-password" : "new-password"}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: 0,
              }}
              placeholder="password sicura"
            />
          </div>
          {error && (
            <div
              style={{
                background: "#ef4444",
                color: "#fff",
                padding: "8px",
                borderRadius: 5,
                marginBottom: 10,
                textAlign: "left",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: 0,
              background: "#10b981",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: 16,
              fontSize: 16,
            }}
          >
            {loading
              ? "Caricamento..."
              : authType === "login"
                ? "Accedi"
                : "Registrati"}
          </button>
        </form>
        <button
          onClick={() => setAuthType(authType === "login" ? "register" : "login")}
          style={{
            background: "none",
            border: "none",
            color: "#38bdf8",
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 16,
            textDecoration: "underline"
          }}
        >
          {authType === "login"
            ? "Non hai un account? Registrati"
            : "Hai già un account? Login"}
        </button>
        <button
          style={{
            color: "#aaa",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            marginTop: 8,
          }}
          onClick={onClose}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}
