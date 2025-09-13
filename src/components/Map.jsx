import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const URBINO_CENTER = [43.7272, 12.6366];
const URBINO_RADIUS = 3000;

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

export default function Map({ userLocation, otherLocations = [] }) {
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

        {/* UTENTI LIVE */}
        {otherLocations.map((loc) => (
          <Marker
            key={loc.user_id}
            position={[loc.latitude, loc.longitude]}
            icon={createCustomMarker(
              loc.current_album_cover_url ||
                'https://ui-avatars.com/api/?name=User',
              'User'
            )}
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
                  🎵 User
                </h3>
                {loc.current_track_name && (
                  <p style={{ margin: '0', fontSize: '12px', color: '#10B981' }}>
                    {loc.current_track_name}
                  </p>
                )}
                {loc.current_artist_name && (
                  <p style={{ margin: '0', fontSize: '11px', color: '#9CA3AF' }}>
                    {loc.current_artist_name}
                  </p>
                )}
                {loc.current_album_cover_url && (
                  <img
                    src={loc.current_album_cover_url}
                    alt="cover"
                    style={{
                      width: 54, height: 54, borderRadius: 7, margin: "8px 0 0 0",
                      boxShadow: "0 0 12px #1db95433"
                    }}
                  />
                )}
                <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>Online ora</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* TU: marker posizione reale */}
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
