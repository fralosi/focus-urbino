import React, { useState } from 'react';
import { supabase } from "../lib/supabase";


function MapMessageCreator({ user, userLocation, onMessageSent, isVisible }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [duration, setDuration] = useState(30); // minuti
  const [isLoading, setIsLoading] = useState(false);

  const messageTypes = {
    general: { icon: '💬', label: 'Messaggio generale', color: '#3b82f6' },
    break_invite: { icon: '☕', label: 'Invito alla pausa', color: '#f59e0b' },
    study_buddy: { icon: '👥', label: 'Cerca compagni di studio', color: '#10b981' },
    motivation: { icon: '💪', label: 'Motivazione', color: '#ef4444' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !userLocation || isLoading) return;

    setIsLoading(true);
    try {
      const expiresAt = new Date(Date.now() + duration * 60 * 1000);
      
      const { data, error } = await supabase.from('map_messages').insert([{
        user_id: user.id,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        message: message.trim(),
        message_type: messageType,
        expires_at: expiresAt.toISOString()
      }]);

      if (error) throw error;

      setMessage('');
      setIsOpen(false);
      onMessageSent && onMessageSent();
      
    } catch (error) {
      console.error('Errore invio messaggio:', error);
      alert('Errore nell\'invio del messaggio');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      zIndex: 1000
    }}>
      {/* Bottone per aprire */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          💬
        </button>
      )}

      {/* Pannello per creare messaggio */}
      {isOpen && (
        <div style={{
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          minWidth: '300px',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              color: '#3b82f6',
              margin: 0,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              📍 Lascia un messaggio
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tipo messaggio */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                color: '#e5e7eb',
                fontSize: '12px',
                fontWeight: '500',
                display: 'block',
                marginBottom: '6px'
              }}>
                Tipo di messaggio
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                {Object.entries(messageTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Messaggio */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                color: '#e5e7eb',
                fontSize: '12px',
                fontWeight: '500',
                display: 'block',
                marginBottom: '6px'
              }}>
                Messaggio ({message.length}/200)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrivi il tuo messaggio..."
                maxLength={200}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '60px'
                }}
              />
            </div>

            {/* Durata */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                color: '#e5e7eb',
                fontSize: '12px',
                fontWeight: '500',
                display: 'block',
                marginBottom: '6px'
              }}>
                Durata visibilità
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value={15}>15 minuti</option>
                <option value={30}>30 minuti</option>
                <option value={60}>1 ora</option>
                <option value={120}>2 ore</option>
              </select>
            </div>

            {/* Bottoni */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#9ca3af',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                style={{
                  background: messageTypes[messageType].color,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: message.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  opacity: message.trim() && !isLoading ? 1 : 0.5
                }}
              >
                {isLoading ? 'Invio...' : `${messageTypes[messageType].icon} Invia`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MapMessageCreator;
