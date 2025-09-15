import React, { useState, useEffect } from 'react';

function PomodoroTimer({ onBreakStatusChange }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isManualBreak, setIsManualBreak] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && !isManualBreak) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finito - switch tra lavoro e pausa
          if (isBreak) {
            // Fine pausa, torna al lavoro
            setMinutes(25);
            setSeconds(0);
            setIsBreak(false);
            setIsActive(false);
            onBreakStatusChange && onBreakStatusChange(false);
          } else {
            // Fine lavoro, inizia pausa
            setMinutes(5);
            setSeconds(0);
            setIsBreak(true);
            onBreakStatusChange && onBreakStatusChange(true);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, isManualBreak, onBreakStatusChange]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
    setIsManualBreak(false);
    onBreakStatusChange && onBreakStatusChange(false);
  };

  const toggleManualBreak = () => {
    const newBreakStatus = !isManualBreak;
    setIsManualBreak(newBreakStatus);
    if (newBreakStatus) {
      setIsActive(false);
    }
    onBreakStatusChange && onBreakStatusChange(newBreakStatus || isBreak);
  };

  const currentBreakStatus = isManualBreak || (isActive && isBreak);

  return (
    <div style={{
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      minWidth: '280px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: currentBreakStatus ? '#f59e0b' : '#10b981',
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          {currentBreakStatus ? '☕ Pausa' : isActive ? '📚 Focus' : '⏰ Pomodoro'}
        </h3>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#fff',
          fontFamily: 'monospace'
        }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <button
          onClick={toggleTimer}
          disabled={isManualBreak}
          style={{
            background: isActive ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isManualBreak ? 'not-allowed' : 'pointer',
            opacity: isManualBreak ? 0.5 : 1
          }}
        >
          {isActive ? 'Pausa' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <button
        onClick={toggleManualBreak}
        style={{
          width: '100%',
          background: isManualBreak ? '#ef4444' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {isManualBreak ? '🔴 Termina Pausa' : '☕ Pausa Manuale'}
      </button>

      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        {currentBreakStatus ? 'In pausa - Rilassati!' : 'Concentrati sul tuo obiettivo'}
      </div>
    </div>
  );
}

export default PomodoroTimer;
