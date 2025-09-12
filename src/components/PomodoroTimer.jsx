import React, { useState, useEffect } from 'react';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setSessions(prev => prev + 1);
      setTimeLeft(25 * 60);
      if (Notification.permission === 'granted') {
        new Notification('🍅 Pomodoro completato!');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="modern-focus-timer">
      {/* Header Minimal */}
      <div className="timer-header">
        <div className="timer-title">
          <span className="timer-emoji">🍅</span>
          <div>
            <h3>Timer del Pomodoro</h3>
            <p>{sessions} sessioni completate</p>
          </div>
        </div>
        <div className="status-indicator">
          <div className={`status-dot ${isActive ? 'active' : ''}`}></div>
        </div>
      </div>

      {/* Timer Central */}
      <div className="timer-display">
        <div className="time-text">{formatTime(timeLeft)}</div>
        <div className="status-text">{isActive ? 'Focus Mode' : 'pronto'}</div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Controls Modern */}
      <div className="timer-controls">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`primary-button ${isActive ? 'pause' : 'start'}`}
        >
          <span className="button-icon">{isActive ? '⏸' : '▶'}</span>
          <span className="button-text">{isActive ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}
          className="secondary-button"
        >
          <span className="reset-icon">↻</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{Math.floor((25 * 60 - timeLeft) / 60)}</div>
          <div className="stat-label">Minuti</div>
        </div>
        <div className="stat-item">
          <div className="stat-value text-emerald">{sessions}</div>
          <div className="stat-label">Sessioni</div>
        </div>
        <div className="stat-item">
          <div className="stat-value text-blue">{sessions * 25}</div>
          <div className="stat-label">Totale</div>
        </div>
      </div>
    </div>
  );
}
