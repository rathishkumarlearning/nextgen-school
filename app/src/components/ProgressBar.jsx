import React from 'react';

export default function ProgressBar({ value = 0, max = 100, className = '' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
