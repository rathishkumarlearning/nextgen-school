import React, { useState, useEffect, useRef } from 'react';

const LEVELS = [
  { name: 'Beginner', icon: '🌱', threshold: 0 },
  { name: 'Explorer', icon: '🔍', threshold: 50 },
  { name: 'Thinker', icon: '🧠', threshold: 150 },
  { name: 'Builder', icon: '🔨', threshold: 250 },
  { name: 'Creator', icon: '👑', threshold: 500 },
];

function getLevel(points) {
  if (points >= 500) return { icon: '👑', name: 'Creator', next: '∞' };
  if (points >= 250) return { icon: '🔨', name: 'Builder', next: 500 };
  if (points >= 150) return { icon: '🧠', name: 'Thinker', next: 250 };
  if (points >= 50) return { icon: '🔍', name: 'Explorer', next: 150 };
  return { icon: '🌱', name: 'Beginner', next: 50 };
}

export default function PointsDisplay({ points: propPoints, onPointsChange }) {
  const [points, setPoints] = useState(() => propPoints ?? parseInt(localStorage.getItem('ngs_points')) || 0);
  const [popups, setPopups] = useState([]);
  const prevPoints = useRef(points);

  // Sync with prop
  useEffect(() => {
    if (propPoints != null) setPoints(propPoints);
  }, [propPoints]);

  // Sync from localStorage
  useEffect(() => {
    if (propPoints != null) return;
    const interval = setInterval(() => {
      const stored = parseInt(localStorage.getItem('ngs_points')) || 0;
      setPoints(stored);
    }, 1000);
    return () => clearInterval(interval);
  }, [propPoints]);

  // Detect point increases → show popup
  useEffect(() => {
    if (points > prevPoints.current) {
      const diff = points - prevPoints.current;
      const id = Date.now() + Math.random();
      setPopups(p => [...p, { id, value: diff, left: Math.random() * 200 + 100 }]);
      setTimeout(() => {
        setPopups(p => p.filter(pp => pp.id !== id));
      }, 1500);
    }
    prevPoints.current = points;
  }, [points]);

  const level = getLevel(points);
  const nextNum = typeof level.next === 'number' ? level.next : points;
  const pct = typeof level.next === 'number' ? Math.min(100, Math.round(points / level.next * 100)) : 100;

  return (
    <div className="level-display" style={{ position: 'relative' }}>
      <span className="level-icon">{level.icon}</span>
      <span className="level-name">{level.name}</span>
      <span className="level-xp">{points} / {level.next} XP</span>
      <div className="progress-bar" style={{ maxWidth: '100%', height: 6, marginTop: 4 }}>
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            transition: 'width 0.5s ease'
          }}
        />
      </div>
      {/* Points popups */}
      {popups.map(p => (
        <div
          key={p.id}
          className="points-popup"
          style={{
            position: 'absolute',
            left: p.left,
            top: -20,
            animation: 'floatUp 1.2s ease-out forwards',
            pointerEvents: 'none',
            fontWeight: 700,
            color: 'var(--gold)',
            fontSize: '1.1rem'
          }}
        >
          +{p.value} ⭐
        </div>
      ))}
    </div>
  );
}
