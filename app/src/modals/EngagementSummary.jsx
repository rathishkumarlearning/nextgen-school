import React from 'react';
import { useApp } from '../context/AppContext';

export default function EngagementSummary({ show, onClose }) {
  const { state } = useApp();

  if (!show) return null;

  const timeSpent = state.timeSpent || 0;
  const minutes = Math.round(timeSpent / 60000);
  const completedCount = Object.keys(state.completed || {}).length;
  const points = state.points || 0;
  const activeDays = (state.activeDays || []).length;

  return (
    <div className="engagement-popup show">
      <div className="engagement-card glass">
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>📊</span>
        <h3>Your Weekly Summary</h3>
        <div className="engagement-stats">
          <div className="engagement-stat">
            <div className="es-value">{minutes}</div>
            <div className="es-label">Minutes Spent</div>
          </div>
          <div className="engagement-stat">
            <div className="es-value">{completedCount}</div>
            <div className="es-label">Chapters Done</div>
          </div>
          <div className="engagement-stat">
            <div className="es-value">{points}</div>
            <div className="es-label">XP Earned</div>
          </div>
          <div className="engagement-stat">
            <div className="es-value">{activeDays}</div>
            <div className="es-label">Active Days</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
}
