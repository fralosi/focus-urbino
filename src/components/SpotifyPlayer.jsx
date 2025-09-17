import React, { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase";

const CURATED_PLAYLISTS = [
  {
    id: "14KtkIpsvzDSCXR24EqHCL",
    name: "Deep focus music",
    url: "https://open.spotify.com/playlist/14KtkIpsvzDSCXR24EqHCL"
  },
  {
    id: "37i9dQZF1EIgKXhXqo61vc",
    name: "Chill Study Mix", 
    url: "https://open.spotify.com/playlist/37i9dQZF1EIgKXhXqo61vc"
  },
  {
    id: "6zCID88oNjNv9zx6puDHKj",
    name: "LoFi Study 2025",
    url: "https://open.spotify.com/playlist/6zCID88oNjNv9zx6puDHKj"
  }
];

function SpotifyPlayer({ spotifyToken, user, onConnect, currentTrack }) {
  console.log('SpotifyPlayer RENDER - user:', user ? 'EXISTS' : 'NULL', 'token:', spotifyToken ? 'EXISTS' : 'NULL');
  
  const [favorites, setFavorites] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(true);

  useEffect(() => {
    console.log('SpotifyPlayer useEffect triggered');
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_favorite_playlists')
        .select('*')
        .eq('user_id', user.id);
      
      if (!error) {
        setFavorites(data || []);
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const toggleFavorite = async (playlist) => {
    if (!user) return;
    
    const isCurrentlyFavorite = favorites.some(fav => fav.playlist_id === playlist.id);
    
    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from('user_favorite_playlists')
          .delete()
          .eq('user_id', user.id)
          .eq('playlist_id', playlist.id);
        
        if (!error) {
          setFavorites(favorites.filter(fav => fav.playlist_id !== playlist.id));
        }
      } else {
        const { error } = await supabase
          .from('user_favorite_playlists')
          .insert([{
            user_id: user.id,
            playlist_id: playlist.id,
            playlist_name: playlist.name,
            playlist_url: playlist.url
          }]);
        
        if (!error) {
          loadFavorites();
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const playPlaylist = (playlistUrl) => {
    window.open(playlistUrl, '_blank');
  };

  // SEMPRE VISIBILE (per test)
  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '32px',
      width: '350px',
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '2px solid #1DB954', // BORDER VERDE PER VEDERE CHIARAMENTE
      borderRadius: '16px',
      padding: '20px',
      zIndex: 1001, // Z-INDEX ALTO
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      {/* TEST HEADER */}
      <div style={{
        color: '#1DB954',
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        🎵 SPOTIFY PLAYER TEST
      </div>

      {/* DEBUG INFO */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#fff',
        marginBottom: '12px'
      }}>
        User: {user ? '✅ Presente' : '❌ Assente'}<br/>
        Token: {spotifyToken ? '✅ Presente' : '❌ Assente'}<br/>
        Track: {currentTrack?.item?.name || 'Nessuno'}
      </div>

      {/* CONNECT BUTTON */}
      {!spotifyToken ? (
        <button
          onClick={onConnect}
          style={{
            width: '100%',
            background: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          🔗 Connetti Spotify
        </button>
      ) : (
        <div style={{
          background: 'rgba(29, 185, 84, 0.1)',
          border: '1px solid rgba(29, 185, 84, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#1DB954'
        }}>
          ✅ Spotify Connected!
        </div>
      )}

      {/* CURRENT TRACK */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        minHeight: '50px',
        background: 'rgba(255,255,255,0.05)',
        padding: '8px',
        borderRadius: '8px'
      }}>
        <img
          src={currentTrack?.item?.album?.images?.[0]?.url || 'https://via.placeholder.com/50x50?text=🎵'}
          alt="Album cover"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '6px',
            border: '1px solid rgba(29, 185, 84, 0.3)'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack?.item?.name || 'Nessun brano'}
          </div>
          <div style={{
            color: '#9ca3af',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack?.item?.artists?.map(a => a.name).join(', ') || 'Artista'}
          </div>
        </div>
      </div>

      {/* PLAYLIST SECTION */}
      <div>
        <h4 style={{
          color: '#1DB954',
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          📚 Playlist per Studio
        </h4>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {CURATED_PLAYLISTS.map((playlist) => {
            const isFavorite = favorites.some(fav => fav.playlist_id === playlist.id);
            return (
              <div
                key={playlist.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  background: isFavorite ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(29, 185, 84, 0.2)'
                }}
              >
                <button
                  onClick={() => playPlaylist(playlist.url)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {isFavorite && '⭐ '}
                  {playlist.name}
                </button>
                <button
                  onClick={() => toggleFavorite(playlist)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isFavorite ? '#f59e0b' : '#6b7280',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {isFavorite ? '⭐' : '☆'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SpotifyPlayer;
