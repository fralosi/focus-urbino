import React from 'react';

function MapMessages({ messages, onMessageClick }) {
  const messageTypes = {
    general: { icon: '💬', color: '#3b82f6' },
    break_invite: { icon: '☕', color: '#f59e0b' },
    study_buddy: { icon: '👥', color: '#10b981' },
    motivation: { icon: '💪', color: '#ef4444' }
  };

  const formatTimeLeft = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const minutes = Math.floor((expires - now) / 60000);
    
    if (minutes <= 0) return 'Scaduto';
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  return (
    <div style={{
      position: 'fixed',
      left: '32px',
      bottom: '32px',
      maxHeight: '300px',
      overflowY: 'auto',
      zIndex: 999
    }}>
      {messages.map((msg) => {
        const type = messageTypes[msg.message_type] || messageTypes.general;
        const username = msg.users?.username || `Utente#${msg.user_id.slice(0, 4)}`;
        
        return (
          <div
            key={msg.id}
            onClick={() => onMessageClick && onMessageClick(msg)}
            style={{
              background: 'rgba(17, 24, 39, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${type.color}33`,
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '8px',
              minWidth: '250px',
              maxWidth: '350px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '6px'
            }}>
              <span style={{
                fontSize: '16px',
                color: type.color,
                flexShrink: 0
              }}>
                {type.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    color: type.color,
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {username}
                  </span>
                  <span style={{
                    color: '#6b7280',
                    fontSize: '11px'
                  }}>
                    {formatTimeLeft(msg.expires_at)}
                  </span>
                </div>
                <p style={{
                  color: '#e5e7eb',
                  fontSize: '13px',
                  margin: 0,
                  lineHeight: '1.4',
                  wordBreak: 'break-word'
                }}>
                  {msg.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MapMessages;
