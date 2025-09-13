import React from "react";

const CLIENT_ID = "d7acc5bbad3a4016b92b5237d91f239f"; // <-- Incolla qui il tuo Client ID
const REDIRECT_URI = "http://localhost:5173"; // Cambia se deploy in produzione
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state"
];

function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: RESPONSE_TYPE,
    scope: SCOPES.join(" "),
    show_dialog: "true"
  });
  return `${AUTH_ENDPOINT}?${params}`;
}

export default function ConnectSpotifyButton({ onAuth }) {
  const handleConnect = () => {
    window.location = getAuthUrl();
  };

  return (
    <button
      onClick={handleConnect}
      style={{
        background: "#1DB954",
        color: "white",
        fontWeight: 600,
        padding: "12px 18px",
        border: "none",
        borderRadius: 8,
        cursor: "pointer"
      }}
    >
      🎵 Collega Spotify
    </button>
  );
}
