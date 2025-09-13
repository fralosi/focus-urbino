import React, { useState } from 'react';
import Map from './components/Map';
import PomodoroTimer from './components/PomodoroTimer';
import AuthModal from './components/AuthModal';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      background: "#111827",
      width: "100vw",
      minWidth: "100vw",
      minHeight: "100vh",
      overflow: "hidden"
    }}>
      {/* Mappa Fullscreen */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
      }}>
        <Map />
      </div>

      {/* Header sopra la mappa */}
      <header style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #222",
        padding: "18px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <span style={{
            fontSize: "26px",
            fontWeight: 600,
            letterSpacing: "1px"
          }}>Focus Urbino</span>
          <span style={{
            fontSize: "13px",
            color: "#9ca3af",
            marginLeft: 14
          }}>Study Community Platform</span>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            background: "#10b981",
            color: "white",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          Accedi / Registrati
        </button>
      </header>

      {/* Timer pomodoro sopra la mappa */}
      <div style={{
        position: "absolute",
        left: "32px",
        top: "110px",
        zIndex: 10
      }}>
        <PomodoroTimer />
      </div>

      {/* MODALE */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default App;
