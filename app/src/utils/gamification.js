import gsap from 'gsap';
import { BADGE_DATA } from './constants.js';

// ===== POINTS =====
export function addPoints(n, state, setState) {
  setState(prev => {
    const newPoints = prev.points + n;
    localStorage.setItem('ngs_points', newPoints);
    return { ...prev, points: newPoints };
  });
  // Popup animation
  const p = document.createElement('div');
  p.className = 'points-popup';
  p.textContent = `+${n} ⭐`;
  p.style.left = (Math.random() * 200 + 100) + 'px';
  p.style.top = '80px';
  document.body.appendChild(p);
  gsap.to(p, {y: -80, opacity: 0, duration: 1.2, onComplete: () => p.remove()});
}

export function getLevel(points) {
  if (points >= 500) return {icon: '👑', name: 'Creator', next: '∞'};
  if (points >= 250) return {icon: '🔨', name: 'Builder', next: 500};
  return {icon: '🔍', name: 'Explorer', next: 250};
}

// ===== STREAK TRACKING =====
export function trackActiveDay(activeDays) {
  const today = new Date().toISOString().split('T')[0];
  if (!activeDays.includes(today)) {
    const newDays = [...activeDays, today];
    localStorage.setItem('ngs_active_days', JSON.stringify(newDays));
    return newDays;
  }
  return activeDays;
}

export function getStreak(activeDays) {
  const sorted = [...activeDays].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (sorted.includes(ds)) streak++;
    else break;
  }
  return streak;
}

// ===== BADGES =====
export function renderBadges(completed) {
  return BADGE_DATA.map(b => ({
    ...b,
    earned: !!completed[b.id]
  }));
}
