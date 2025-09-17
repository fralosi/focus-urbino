import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Map from "./components/Map";
import PomodoroTimer from "./components/PomodoroTimer";
import BreakBuddies from "./components/BreakBuddies";
import MapMessageCreator from "./components/MapMessageCreator";
import MapMessages from "./components/MapMessages";
import SpotifyPlayer from "./components/SpotifyPlayer";
import AuthModal from "./components/AuthModal";

const SPOTIFY_CLIENT_ID = "d7acc5bbad3a4016b92b5237d91f239f";
const SPOTIFY_REDIRECT_URI = "https://focus-urbino.vercel.app/";
const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-modify-playback-state",
  "streaming",
  "user-read-email",
  "user-read-private"
];

// Genera code verifier e challenge per PKCE
function generateCodeVerifier() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(128));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function getSpotifyAuthUrl() {
  const codeVerifier = generateCodeVerifier();
  localStorage.setItem('code_verifier', codeVerifier);
  
  return generateCodeChallenge(codeVerifier).then(codeChallenge => {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      response_type: "code",
      scope: SPOTIFY_SCOPES.join(" "),
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      show_dialog: "true"
    });
    return `https://accounts.spotify.com/authorize?${params}`;
  });
}

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [otherLocations, setOtherLocations] = useState([]);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyTrack, setSpotifyTrack] = useState(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [usersOnBreak, setUsersOnBreak] = useState([]);
  const [mapMessages, setMapMessages] = useState([]);

  // DEBUG LOG - per vedere cosa succede
  useEffect(() => {
    console.log('=== SPOTIFY DEBUG ===');
    console.log('spotifyToken:', spotifyToken ? 'PRESENTE' : 'NULL');
    console.log('user:', user ? 'PRESENTE' : 'NULL');
    console.log('SpotifyPlayer dovrebbe essere visibile:', !!(user));
  }, [user, spotifyToken]);

  // Funzione per assicurare che il profilo utente esista
  async function ensureUserProfile(user) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!data) {
      await supabase.from('users').insert([
        { 
          id: user.id, 
          email: user.email, 
          username: user.email.split('@')[0]
        }
      ]);
      console.log('Profilo utente creato automaticamente');
    }
  }

  // Gestisce il cambio di stato pausa dal timer
  const handleBreakStatusChange = (isBreak) => {
    setIsOnBreak(isBreak);
  };

  // Scambia authorization code per access token
  async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem('code_verifier');
    console.log('Exchanging code for token...', code);
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();
    console.log('Token exchange response:', data);
    
    if (data.access_token) {
      setSpotifyToken(data.access_token);
      console.log('SPOTIFY TOKEN SET SUCCESS');
      localStorage.removeItem('code_verifier');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.error('Errore nello scambio del token:', data);
    }
  }

  // Recupera authorization code dalla URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    console.log('URL Check - Code:', code, 'Error:', error);
    
    if (error) {
      console.error('Spotify auth error:', error);
    } else if (code) {
      console.log('Got authorization code, exchanging...');
      exchangeCodeForToken(code);
    }
  }, []);

  // Auth listener
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data?.user ?? null;
      setUser(currentUser);
      console.log('User set:', currentUser ? 'LOGGED IN' : 'NOT LOGGED');
      if (currentUser) {
        await ensureUserProfile(currentUser);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await ensureUserProfile(currentUser);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // Richiesta posizione e salvataggio su Supabase + traccia
  useEffect(() => {
    if (user) {
      askGeoLocation();
    }
    // eslint-disable-next-line
  }, [user]);

  async function askGeoLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const locationObj = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(locationObj);
        if (user && user.id) {
          await updateLocationAndTrack(spotifyTrack);
        }
      },
      (err) => {
        console.log("Geo error", err);
        setUserLocation(null);
      }
    );
  }

  function showWelcomeMsg(user) {
    if (!user) return;
    setWelcomeMsg(`Benvenuto su Focus Urbino, ${user.email}!`);
    setTimeout(() => setWelcomeMsg(""), 3000);
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSpotifyToken(null); // Reset Spotify token
  };

  // Fetch altri utenti in polling
  async function fetchOtherLocations() {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_locations")
      .select('*')
      .neq("user_id", user.id)
      .eq("is_active", true)
      .gte("updated_at", new Date(Date.now() - 1000 * 60 * 10).toISOString());
    if (!error) {
      setOtherLocations(data || []);
      // Filtra gli utenti in pausa
      const breakUsers = (data || []).filter(loc => loc.is_on_break);
      setUsersOnBreak(breakUsers);
    }
    if (error) {
      console.error('Supabase fetch error:', error);
    }
  }

  // Fetch messaggi mappa
  async function fetchMapMessages() {
    if (!user || !userLocation) return;
    
    // Calcola area di interesse (raggio ~5km dalla posizione utente)
    const latRange = 0.045; // circa 5km
    const lngRange = 0.045;
    
    const { data, error } = await supabase
      .from("map_messages")
      .select(`
        *,
        users:user_id (username)
      `)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .gte("latitude", userLocation.lat - latRange)
      .lte("latitude", userLocation.lat + latRange)
      .gte("longitude", userLocation.lng - lngRange)
      .lte("longitude", userLocation.lng + lngRange)
      .order("created_at", { ascending: false });
    
    if (!error) {
      setMapMessages(data || []);
    }
    if (error) {
      console.error('Errore fetch messaggi mappa:', error);
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchOtherLocations();
    const interval = setInterval(() => {
      fetchOtherLocations();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user]);

  // useEffect per fetch messaggi mappa
  useEffect(() => {
    if (!user || !userLocation) return;
    fetchMapMessages();
    const interval = setInterval(fetchMapMessages, 15000); // ogni 15 secondi
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user, userLocation]);

  // Funzione centrale per aggiornare posizione/traccia
  async function updateLocationAndTrack(spotifyTrackData) {
    if (!user || !userLocation) return;
    const payload = {
      user_id: user.id,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      is_active: true,
      is_on_break: isOnBreak,
      updated_at: new Date().toISOString(),
      current_track_name: spotifyTrackData?.item?.name ?? null,
      current_artist_name: spotifyTrackData?.item?.artists?.map(a => a.name).join(', ') ?? null,
      current_album_cover_url: spotifyTrackData?.item?.album?.images?.[0]?.url ?? null
    };
    console.log('SUPABASE UPSERT PAYLOAD:', payload);
    const { error } = await supabase
      .from('user_locations')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) {
      console.error('Supabase UPSERT ERROR:', error);
    }
  }

  // Aggiorna quando cambia lo stato pausa
  useEffect(() => {
    if (user && userLocation) {
      updateLocationAndTrack(spotifyTrack);
    }
    // eslint-disable-next-line
  }, [isOnBreak]);

  // Spotify: Bottone login
  async function handleSpotifyConnect() {
    console.log('handleSpotifyConnect called');
    const authUrl = await getSpotifyAuthUrl();
    window.location = authUrl;
  }

  // Recupera brano attuale Spotify e aggiorna anche la location
  useEffect(() => {
    async function fetchCurrentlyPlaying() {
      if (!spotifyToken) return;
      const resp = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      if (resp.status === 204) {
        setSpotifyTrack(null);
        updateLocationAndTrack(null);
        return;
      }
      const data = await resp.json();
      setSpotifyTrack(data);
      console.log('DEBUG SPOTIFY TRACK RAW:', data);
      updateLocationAndTrack(data);
    }
    if (spotifyToken) {
      fetchCurrentlyPlaying();
      const interval = setInterval(fetchCurrentlyPlaying, 20000);
      return () => clearInterval(interval);
    }
  }, [spotifyToken, userLocation, user]);

  // Callback per quando viene inviato un messaggio
  const handleMessageSent = () => {
    fetchMapMessages(); // Ricarica i messaggi
  };

  // Callback per click su messaggio
  const handleMessageClick = (message) => {
    // Puoi implementare azioni specifiche, es: zoom sulla posizione del messaggio
    console.log('Clicked message:', message);
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
      {/* DEBUG INFO - RIMUOVERE DOPO TEST */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        DEBUG: User={user ? '✅' : '❌'} | Spotify={spotifyToken ? '✅' : '❌'} | Player={user ? '✅ DOVREBBE ESSERE VISIBILE' : '❌'}
      </div>

      {/* TOAST benvenuto */}
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
            transition: "all .3s"
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
        <Map 
          user={user} 
          userLocation={userLocation} 
          otherLocations={otherLocations} 
          spotifyTrack={spotifyTrack}
          userIsOnBreak={isOnBreak}
        />
      </div>

      {/* Header sopra */}
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
              background: isOnBreak ? "#f59e0b" : "#10b981", 
              color: "white",
              borderRadius: 100, padding: "8px 14px",
              fontWeight: 600
            }}>
              {isOnBreak ? "☕ In pausa" : "📚 " + user.email}
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

      {/* SPOTIFY PLAYER - DOVREBBE APPARIRE SEMPRE SE USER È LOGGATO */}
      {console.log('Rendering SpotifyPlayer - user:', user ? 'YES' : 'NO')}
      <SpotifyPlayer
        spotifyToken={spotifyToken}
        user={user}
        onConnect={handleSpotifyConnect}
        currentTrack={spotifyTrack}
      />

      {/* TIMER */}
      <div style={{
        position: "absolute",
        left: "32px",
        top: "110px",
        zIndex: 10
      }}>
        <PomodoroTimer onBreakStatusChange={handleBreakStatusChange} />
      </div>

      {/* Lista utenti in pausa */}
      <BreakBuddies 
        usersOnBreak={usersOnBreak} 
        isVisible={isOnBreak} 
      />

      {/* Messaggi sulla mappa */}
      {user && userLocation && (
        <>
          <MapMessages 
            messages={mapMessages}
            onMessageClick={handleMessageClick}
          />
          <MapMessageCreator
            user={user}
            userLocation={userLocation}
            onMessageSent={handleMessageSent}
            isVisible={true}
          />
        </>
      )}

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
