import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../lib/supabase";

const CURATED_PLAYLISTS = [
  {
    id: "14KtkIpsvzDSCXR24EqHCL",
    name: "Deep focus music",
    url: "https://open.spotify.com/playlist/14KtkIpsvzDSCXR24EqHCL",
    category: "focus"
  },
  {
    id: "37i9dQZF1EIgKXhXqo61vc",
    name: "Chill Study Mix",
    url: "https://open.spotify.com/playlist/37i9dQZF1EIgKXhXqo61vc",
    category: "chill"
  },
  {
    id: "6zCID88oNjNv9zx6puDHKj",
    name: "LoFi Study 2025",
    url: "https://open.spotify.com/playlist/6zCID88oNjNv9zx6puDHKj",
    category: "lofi"
  },
  {
    id: "1kGtBpJnR0bPWX4JXi5wUo",
    name: "Musica Classica Relax Study",
    url: "https://open.spotify.com/playlist/1kGtBpJnR0bPWX4JXi5wUo",
    category: "classical"
  },
  {
    id: "0Hn2uAdwsZ2GfHF4yXU99z",
    name: "40hz Binaural Beats",
    url: "https://open.spotify.com/playlist/0Hn2uAdwsZ2GfHF4yXU99z",
    category: "binaural"
  },
  {
    id: "4WgwqSvYkl5DEvcGimROZV",
    name: "Curata Dallo Sviluppatore",
    url: "https://open.spotify.com/playlist/4WgwqSvYkl5DEvcGimROZV",
    category: "dev"
  }
];

function SpotifyPlayer({ spotifyToken, user, onConnect, currentTrack }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [isPremium, setIsPremium] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(50);
  const [favorites, setFavorites] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const playerRef = useRef(null);

  // Carica Web Playback SDK
  useEffect(() => {
    if (spotifyToken && !window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [spotifyToken]);

  // Inizializza Player
  useEffect(() => {
    if (!spotifyToken || !window.Spotify) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Focus Urbino Player',
        getOAuthToken: cb => cb(spotifyToken),
        volume: volume / 100
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player Ready:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline:', device_id);
        setIsReady(false);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setPlayerState(state);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
      playerRef.current = spotifyPlayer;
    };

    // Verifica se è Premium
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    })
    .then(res => res.json())
    .then(data => {
      setIsPremium(data.product === 'premium');
    })
    .catch(console.error);
  }, [spotifyToken, volume]);

  // Carica playlist preferite
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_favorite_playlists')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error) {
      setFavorites(data || []);
    }
  };

  const toggleFavorite = async (playlist) => {
    if (!user) return;
    
    const isCurrentlyFavorite = favorites.some(fav => fav.playlist_id === playlist.id);
    
    if (isCurrentlyFavorite) {
      // Rimuovi dai preferiti
      const { error } = await supabase
        .from('user_favorite_playlists')
        .delete()
        .eq('user_id', user.id)
        .eq('playlist_id', playlist.id);
      
      if (!error) {
        setFavorites(favorites.filter(fav => fav.playlist_id !== playlist.id));
      }
    } else {
      // Aggiungi ai preferiti
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
  };

  const playPlaylist = async (playlistId) => {
    if (!isPremium || !deviceId || !isReady) {
      // Fallback: apri in Spotify
      const playlist = CURATED_PLAYLISTS.find(p => p.id === playlistId);
      if (playlist) {
        window.open(playlist.url, '_blank');
      }
      return;
    }

    try {
      // Trasferisci playback al nostro device e riproduci playlist
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`,
          position_ms: 0
        })
      });
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!player) return;
    player.togglePlay();
  };

  const previousTrack = async () => {
    if (!player) return;
    player.previousTrack();
  };

  const nextTrack = async () => {
    if (!player) return;
    player.nextTrack();
  };

  const seekTo = async (position) => {
    if (!player) return;
    player.seek(position);
  };

  const setPlayerVolume = async (newVolume) => {
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
  };

  // Ordina playlist: preferite prima
  const sortedPlaylists = [...CURATED_PLAYLISTS].sort((a, b) => {
    const aIsFav = favorites.some(fav => fav.playlist_id === a.id);
    const bIsFav = favorites.some(fav => fav.playlist_id === b.id);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return 0;
  });

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '32px',
      width: '400px',
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(29, 185, 84, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          color: '#1DB954',
          margin: 0,
          fontSize: '16px',
          fontWeight: '600'
        }}>
          🎵 Spotify Player
        </h3>
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          📋
        </button>
      </div>

      {/* Connect Button o Player */}
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
        <>
          {/* Premium Status */}
          {isPremium === false && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#f59e0b'
            }}>
              ⚠️ Spotify Premium richiesto per riproduzione. Playlist apriranno in Spotify.
            </div>
          )}

          {/* Current Track Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            minHeight: '64px'
          }}>
            <img
              src={
                playerState?.track_window?.current_track?.album?.images?.[0]?.url || 
                currentTrack?.item?.album?.images?.[0]?.url ||
                'https://via.placeholder.com/64x64?text=🎵'
              }
              alt="Album cover"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                border: '1px solid rgba(29, 185, 84, 0.3)'
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {playerState?.track_window?.current_track?.name || 
                 currentTrack?.item?.name || 
                 'Nessun brano in riproduzione'}
              </div>
              <div style={{
                color: '#9ca3af',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {playerState?.track_window?.current_track?.artists?.map(a => a.name).join(', ') ||
                 currentTrack?.item?.artists?.map(a => a.name).join(', ') ||
                 'Artista sconosciuto'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {playerState && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#9ca3af',
                marginBottom: '4px'
              }}>
                <span>{formatTime(playerState.position)}</span>
                <span>{formatTime(playerState.duration)}</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(75, 85, 99, 0.5)',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  const rect = e.target.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seekTo(percent * playerState.duration);
                }}
              >
                <div style={{
                  width: `${(playerState.position / playerState.duration) * 100}%`,
                  height: '100%',
                  background: '#1DB954',
                  borderRadius: '2px'
                }} />
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <button
              onClick={previousTrack}
              disabled={!isReady}
              style={{
                background: 'transparent',
                border: 'none',
                color: isReady ? '#fff' : '#6b7280',
                fontSize: '20px',
                cursor: isReady ? 'pointer' : 'not-allowed'
              }}
            >
              ⏮️
            </button>
            <button
              onClick={togglePlayPause}
              disabled={!isReady}
              style={{
                background: '#1DB954',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                color: 'white',
                fontSize: '20px',
                cursor: isReady ? 'pointer' : 'not-allowed',
                opacity: isReady ? 1 : 0.5
              }}
            >
              {playerState?.paused ? '▶️' : '⏸️'}
            </button>
            <button
              onClick={nextTrack}
              disabled={!isReady}
              style={{
                background: 'transparent',
                border: 'none',
                color: isReady ? '#fff' : '#6b7280',
                fontSize: '20px',
                cursor: isReady ? 'pointer' : 'not-allowed'
              }}
            >
              ⏭️
            </button>
          </div>

          {/* Volume */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setPlayerVolume(parseInt(e.target.value))}
              style={{
                flex: 1,
                background: 'rgba(75, 85, 99, 0.5)',
                height: '4px',
                borderRadius: '2px',
                outline: 'none'
              }}
            />
            <span style={{ color: '#9ca3af', fontSize: '12px', minWidth: '30px' }}>
              {volume}%
            </span>
          </div>
        </>
      )}

      {/* Playlist Section */}
      {showPlaylist && spotifyToken && (
        <div>
          <div style={{
            borderTop: '1px solid rgba(75, 85, 99, 0.3)',
            paddingTop: '16px'
          }}>
            <h4 style={{
              color: '#1DB954',
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              📚 Playlist per Studio
            </h4>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {sortedPlaylists.map((playlist) => {
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
                      background: isFavorite ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
                      border: isFavorite ? '1px solid rgba(29, 185, 84, 0.2)' : '1px solid transparent'
                    }}
                  >
                    <button
                      onClick={() => playPlaylist(playlist.id)}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(29, 185, 84, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
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
                        fontSize: '16px',
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
      )}
    </div>
  );
}

export default SpotifyPlayer;
