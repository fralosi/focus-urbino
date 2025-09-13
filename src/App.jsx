import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { updateUserLocation } from "./lib/supabase"; // <-- Assicurati sia esportata!
import Map from "./components/Map";
import PomodoroTimer from "./components/PomodoroTimer";
import AuthModal from "./components/AuthModal";

function App() {
  // Stato per login, user, posizione, messaggio benvenuto
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [welcomeMsg, setWelcomeMsg] = useState("");

  // Ogni volta che cambia la sessione utente su Supabase, aggiorniamo lo stato!
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Ogni volta che l'utente diventa loggato, chiedi il consenso GPS e salva su Supabase
  useEffect(() => {
    if (user) {
      askGeoLocation();
    }
    // eslint-disable-next-line
  }, [user]);

  // Funzione per richiedere posizione e salvare su Supabase
  function askGeoLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const locationObj = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(locationObj);
        if (user && user.id) {
          await updateUserLocation(user.id, locationObj.lat, locationObj.lng);
        }
      },
      (err) => {
        console.log("Geo error", err);
        setUserLocation(null);
      }
    );
  }

  // Messaggio di benvenuto
  function showWelcomeMsg(user) {
    if (!user) return;
    setWelcomeMsg(`Benvenuto su Focus Urbino, ${user.email}!`);
    setTimeout(() => setWelcomeMsg(""), 3000);
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

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
      {/* MESSAGGIO BENVENUTO */}
      {welcomeMsg && (
        <div
          style={{
            position: "fixed",
            top: "28px",
            right: "32px",
            background: "#10b981",
            color: "#fff",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "16px",
            padding: "18px 30px",
            boxShadow: "0 8px 32px #10b98177",
            zIndex: 99999,
            opacity: 0.94,
            transition: "all .3s",
          }}
        >
          {welcomeMsg}
        </div>
      )}

      {/* Mappa */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0, zIndex: 1
      }}>
        <Map user={user} userLocation={userLocation} />
      </div>

      {/* Header e auth UI */}
      <header style={{
        position: "absolute",
        top: 0, left: 0, right: 0, zIndex: 10,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #222",
        padding: "18px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <span style={{
            fontSize: "26px", fontWeight: 600, letterSpacing: "1px"
          }}>Focus Urbino</span>
          <span style={{
            fontSize: "13px", color: "#9ca3af", marginLeft: 14
          }}>Study Community Platform</span>
        </div>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              background: "#10b981", color: "white",
              borderRadius: 100, padding: "8px 14px",
              fontWeight: 600
            }}>
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "#e11d48", color: "white",
                border: "none", borderRadius: "8px",
                fontWeight: "bold", fontSize: 14,
                padding: "10px 18px", cursor: "pointer"
              }}
            >
              Esci
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              background: "#10b981", color: "white", padding: "10px 18px",
              borderRadius: "8px", border: "none", fontWeight: "bold",
              fontSize: 14, cursor: "pointer"
            }}
          >
            Accedi / Registrati
          </button>
        )}
      </header>

      {/* Timer */}
      <div style={{
        position: "absolute",
        left: "32px",
        top: "110px",
        zIndex: 10
      }}>
        <PomodoroTimer />
      </div>

      {/* Modale */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={showWelcomeMsg}
      />
    </div>
  );
}

export default App;
