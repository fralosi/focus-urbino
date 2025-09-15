import React from 'react';

function BreakBuddies({ usersOnBreak, isVisible }) {
  if (!isVisible || usersOnBreak.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      left: '32px',
      top: '320px',
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      minWidth: '250px',
      maxWidth: '300px',
      zIndex: 10,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <h4 style={{
        color: '#f59e0b',
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        ☕ In pausa come te ({usersOnBreak.length})
      </h4>
      
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {usersOnBreak.map((user, index) => (
          <div
            key={user.user_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 0',
              borderBottom: index < usersOnBreak.length - 1 ? '1px solid rgba(75, 85, 99, 0.3)' : 'none'
            }}
          >
            <img
              src={user.current_album_cover_url || 'https://ui-avatars.com/api/?name=User'}
              alt="avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid #f59e0b'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {user.username || `Utente#${user.user_id.slice(0, 4)}`}
              </div>
              {user.current_track_name && (
                <div style={{
                  color: '#9ca3af',
                  fontSize: '12px'
                }}>
                  🎵 {user.current_track_name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(245, 158, 11, 0.1)',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        Rilassatevi insieme! 😌
      </div>
    </div>
  );
}

export default BreakBuddies;
