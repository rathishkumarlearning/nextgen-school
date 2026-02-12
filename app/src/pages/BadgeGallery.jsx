import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { COURSES } from '../utils/constants';

function getBadgeData() {
  const badges = [];
  for (const [courseId, course] of Object.entries(COURSES || {})) {
    (course.chapters || []).forEach((ch, i) => {
      badges.push({ id: `${courseId}_${i}`, emoji: ch.emoji, name: ch.title, course: courseId, courseTitle: course.title });
    });
  }
  return badges;
}

export default function BadgeGallery() {
  const { state, navigate } = useApp();
  const { isLoggedIn } = useAuth();
  const badges = getBadgeData();

  const earnedCount = badges.filter(b => state.completed?.[b.id]).length;

  if (state.dataLoading) {
    return (
      <div id="badge-gallery" style={{ display: 'block', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="auth-spinner" style={{ width: 40, height: 40 }} />
          <p style={{ color: 'var(--text2)', marginTop: 16 }}>Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="badge-gallery" style={{ display: 'block', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
      <div className="container">
        <button className="btn btn-back" onClick={() => navigate('landing')}>← Back Home</button>
        <h2 style={{ textAlign: 'center', margin: '20px 0', fontSize: '2rem' }}>🏆 Badge Gallery</h2>
        <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '8px' }}>
          {earnedCount > 0
            ? `You've earned ${earnedCount} of ${badges.length} badges! Keep going!`
            : 'Complete chapters to earn badges!'}
        </p>
        <div className="badges-grid">
          {badges.map(b => {
            const earned = state.completed?.[b.id];
            return (
              <div className={`badge ${earned ? 'earned' : 'locked'}`} key={b.id} title={earned ? `Earned: ${b.name}` : `Locked: Complete ${b.name}`}>
                <span className="emoji">{earned ? b.emoji : '🔒'}</span>
                <div className="name">{b.name}</div>
                {earned && <div style={{ fontSize: '.65rem', color: 'var(--green)', marginTop: 2 }}>✅ Earned</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
