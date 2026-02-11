import React from 'react';
import { useApp } from '../context/AppContext';
import { COURSES } from '../utils/constants';

function getBadgeData() {
  const badges = [];
  for (const [courseId, course] of Object.entries(COURSES || {})) {
    (course.chapters || []).forEach((ch, i) => {
      badges.push({
        id: `${courseId}_${i}`,
        emoji: ch.emoji,
        name: ch.title,
        course: courseId
      });
    });
  }
  return badges;
}

export default function BadgeGallery() {
  const { state, navigate } = useApp();
  const badges = getBadgeData();

  return (
    <div id="badge-gallery" style={{ display: 'block', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
      <div className="container">
        <button className="btn btn-back" onClick={() => navigate('landing')}>← Back Home</button>
        <h2 style={{ textAlign: 'center', margin: '20px 0', fontSize: '2rem' }}>🏆 Badge Gallery</h2>
        <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '8px' }}>
          Complete chapters to earn badges!
        </p>
        <div className="badges-grid">
          {badges.map(b => {
            const earned = state.completed?.[b.id];
            return (
              <div className={`badge ${earned ? 'earned' : 'locked'}`} key={b.id}>
                <span className="emoji">{b.emoji}</span>
                <div className="name">{b.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
