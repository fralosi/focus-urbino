import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Map from "./components/Map";
import PomodoroTimer from "./components/PomodoroTimer";
import AuthModal from "./components/AuthModal";

const SPOTIFY_CLIENT_ID = "d7acc5bbad3a4016b92b5237d91f239f";
const SPOTIFY_REDIRECT_URI = "https://focus-urbino.vercel.app/";
const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state"
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

  // Scambia authorization code per access token
  async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem('code_verifier');
    
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
    if (data.access_token) {
      setSpotifyToken(data.access_token);
      console.log('DEBUG SPOTIFY TOKEN SET:', data.access_token);
      localStorage.removeItem('code_verifier');
      // Pulisci URL
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
    
    console.log('CHECKING URL:', window.location.href);
    
    if (error) {
      console.error('Spotify auth error:', error);
    } else if (code) {
      console.log('Got authorization code:', code);
      exchangeCodeForToken(code);
    }
  }, []);

  // Auth listener
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data?.user ?? null;
      setUser(currentUser);
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
    }
    if (error) {
      console.error('Supabase fetch error:', error);
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

  // Funzione centrale per aggiornare posizione/traccia
  async function updateLocationAndTrack(spotifyTrackData) {
    if (!user || !userLocation) return;
    const payload = {
      user_id: user.id,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      is_active: true,
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

  // Spotify: Bottone login
  async function handleSpotifyConnect() {
    const authUrl = await getSpotifyAuthUrl();
    window.location = authUrl;
  }

  // Recupera brano attuale Spotify e aggiorna anche la location
  useEffect(() => {
    console.log('DEBUG USEEFFECT spotifyToken:', spotifyToken, 'userLocation:', userLocation, 'user:', user);
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
              background: "#10b981", color: "white",
              borderRadius: 100, padding: "8px 14px",
              fontWeight: 600
            }}>
              {user.email}
            </span>
            {/* SPOTIFY BUTTON / STATUS */}
            {!spotifyToken ? (
              <button
                onClick={handleSpotifyConnect}
                style={{
                  background: "#1DB954",
                  color: "white",
                  fontWeight: 600,
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                🎵 Collega Spotify
              </button>
            ) : (
              <span style={{ color: "#1DB954", fontWeight: 600 }}>
                Spotify collegato!
              </span>
            )}
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

      {/* TIMER */}
      <div style={{
        position: "absolute",
        left: "32px",
        top: "110px",
        zIndex: 10
      }}>
        <PomodoroTimer />
      </div>

      {/* BOX ORA IN ASCOLTO SPOTIFY */}
      {spotifyToken && spotifyTrack && spotifyTrack.item && (
        <div
          style={{
            position: "fixed",
            top: 90,
            right: 35,
            background: "#181c22",
            color: "#fff",
            border: "2px solid #1DB954",
            borderRadius: 12,
            padding: "13px 24px",
            minWidth: 180,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 22px #262 20%",
            zIndex: 99999
          }}
        >
          <img
            src={spotifyTrack.item.album.images[1]?.url || spotifyTrack.item.album.images[0].url}
            alt="cover"
            style={{
              width: 54, height: 54, borderRadius: 7, marginRight: 14,
              boxShadow: "0 0 12px #1db95433"
            }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {spotifyTrack.item.name}
            </div>
            <div style={{ fontSize: 13, color: "#40fa91" }}>
              {spotifyTrack.item.artists.map(a => a.name).join(", ")}
            </div>
            <div style={{ fontSize: 12, color: "#a3ffa3" }}>
              {spotifyTrack.item.album.name}
            </div>
          </div>
        </div>
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
