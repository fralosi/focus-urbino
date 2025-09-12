import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const URBINO_CENTER = [43.7272, 12.6366];
const URBINO_RADIUS = 3000;

// Funzione per creare marker personalizzati con cover album
const createCustomMarker = (albumCover, username) => {
  const iconHtml = `
    <div class="custom-marker">
      <div class="marker-glow"></div>
      <img src="${albumCover}" alt="Album cover" class="album-cover" />
      <div class="music-pulse"></div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-container',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

export default function Map() {
  // Utenti con cover album simulate
  const mockUsers = [
    {
      id: '1',
      username: 'Marco',
      latitude: 43.7270,
      longitude: 12.6360,
      current_track: { 
        track_name: 'Lo-fi Study Beats', 
        artist_name: 'Chillhop Music',
        album_cover: 'https://via.placeholder.com/300x300/4f46e5/ffffff?text=🎵'
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
        album_cover: 'https://via.placeholder.com/300x300/10b981/ffffff?text=🧠'
      }
    },
    {
      id: '3', 
      username: 'Sofia',
      latitude: 43.7268,
      longitude: 12.6355,
      current_track: { 
        track_name: 'Deep Work', 
        artist_name: 'Ambient Sounds',
        album_cover: 'https://via.placeholder.com/300x300/f59e0b/ffffff?text=⚡'
      }
    }
  ];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={URBINO_CENTER}
        zoom={15}
        className="h-full w-full"
        style={{ 
          height: '100vh', 
          width: '100vw',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10
        }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
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

        {/* Marker Custom con Cover Album */}
        {mockUsers.map((user) => (
          <Marker 
            key={user.id} 
            position={[user.latitude, user.longitude]}
            icon={createCustomMarker(user.current_track.album_cover, user.username)}
          >
            <Popup closeButton={false}>
              <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-700 min-w-[250px]">
                {/* Header con Avatar e Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.username.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{user.username}</h3>
                    <p className="text-xs text-gray-400">Currently focusing</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Track Info con Cover */}
                <div className="flex items-center space-x-3 bg-gray-800 rounded-lg p-3">
                  <img 
                    src={user.current_track.album_cover} 
                    alt="Album cover"
                    className="w-12 h-12 rounded-lg shadow-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-mono text-emerald-300 tracking-wide">NOW PLAYING</span>
                    </div>
                    <p className="text-sm font-medium text-white leading-tight">{user.current_track.track_name}</p>
                    <p className="text-xs text-gray-400">{user.current_track.artist_name}</p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
