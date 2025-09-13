export default function AuthModal({ isOpen, onClose }) {
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)"
      }}
    >
      <div style={{
        background: "#1f2937",
        color: "#fff",
        padding: "36px 24px",
        borderRadius: "18px",
        minWidth: "320px",
        boxShadow: "0 0 32px #1118"
      }}>
        <h2 style={{ marginBottom: "20px" }}>Login Focus Urbino</h2>
        <form>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>Email</label>
            <input
              id="email"
              type="email"
              style={{ width: "100%", padding: 8, borderRadius: 6, border: 0, marginBottom: 8 }}
              placeholder="tuo@email.it"
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>Password</label>
            <input
              id="password"
              type="password"
              style={{ width: "100%", padding: 8, borderRadius: 6, border: 0 }}
              placeholder="password"
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: 0,
              background: "#10b981",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Accedi
          </button>
        </form>
        <button
          style={{ marginTop: 20, color: "#aaa", background: "none", border: "none", cursor: "pointer" }}
          onClick={onClose}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}
