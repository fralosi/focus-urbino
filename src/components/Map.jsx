import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const URBINO_CENTER = [43.7272, 12.6366];
const URBINO_RADIUS = 3000;

// -- Funzione per marker custom mock (lascia come già ce l'hai)
function createCustomMarker(cover, username) {
  return L.divIcon({
    html: `
      <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid #10B981;box-shadow:0 0 8px #10B98144;">
        <img src="${cover}" alt="${username}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
    `,
    iconSize: [44, 44],
    className: ""
  });
}

export default function Map({ userLocation }) {
  const mockUsers = [
    {
      id: '1',
      username: 'Marco',
      latitude: 43.7270,
      longitude: 12.6360,
      current_track: { 
        track_name: 'Lo-fi Study Beats', 
        artist_name: 'Chillhop Music',
        album_cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
      }
    },
    {
      id: '2', 
      username: 'Giulia',
      latitude: 43.7275,
      longitude: 12.6370,
      current_track: { 
        track_name: 'Focus Music', 
        artist_name: 'Brain.fm',
        album_cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop'
      }
    }
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : URBINO_CENTER}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        <Circle
          center={URBINO_CENTER}
          radius={URBINO_RADIUS}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.08,
            weight: 2,
            opacity: 0.6,
            dashArray: '8, 12'
          }}
        />

        {/* Markers utenti finti */}
        {mockUsers.map((user) => (
          <Marker 
            key={user.id} 
            position={[user.latitude, user.longitude]}
            icon={createCustomMarker(user.current_track.album_cover, user.username)}
          >
            <Popup closeButton={false}>
              <div style={{
                background: '#1f2937',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #374151'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                  🎵 {user.username}
                </h3>
                <p style={{ margin: '0', fontSize: '12px', color: '#10B981' }}>
                  {user.current_track.track_name}
                </p>
                <p style={{ margin: '0', fontSize: '11px', color: '#9CA3AF' }}>
                  {user.current_track.artist_name}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marker della TUA posizione reale */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup closeButton={false}>
              <b style={{ color: "#10B981" }}>Sei qui</b>
            </Popup>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}
