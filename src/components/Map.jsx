import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const URBINO_CENTER = [43.7272, 12.6366];
const URBINO_RADIUS = 3000;

export default function Map() {
  // Utenti simulati per testing
  const mockUsers = [
    {
      id: '1',
      username: 'Marco',
      latitude: 43.7270,
      longitude: 12.6360,
      current_track: { 
        track_name: 'Lo-fi Study Beats', 
        artist_name: 'Chillhop Music' 
      }
    },
    {
      id: '2', 
      username: 'Giulia',
      latitude: 43.7275,
      longitude: 12.6370,
      current_track: { 
        track_name: 'Focus Music', 
        artist_name: 'Brain.fm' 
      }
    }
  ];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={URBINO_CENTER}
        zoom={15}
        className="h-full w-full"
        style={{ height: 'calc(100vh - 80px)', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Area Urbino */}
        <Circle
          center={URBINO_CENTER}
          radius={URBINO_RADIUS}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 10'
          }}
        />

        {/* Marker utenti */}
        {mockUsers.map((user) => (
          <Marker key={user.id} position={[user.latitude, user.longitude]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">🎵 {user.username}</h3>
                <div className="mt-2">
                  <p className="text-xs font-medium">{user.current_track.track_name}</p>
                  <p className="text-xs text-gray-600">{user.current_track.artist_name}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
