import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { COURSES } from '../utils/constants';
import { LESSONS } from '../utils/lessons';
import ProgressBar from '../components/ProgressBar';

export default function CourseView() {
  const {
    state, navigate, completeChapter, addPoints,
    notifications, toggleNotifPanel, showNotifPanel
  } = useApp();
  const { isLoggedIn, isDemoMode } = useAuth();

  const courseId = state.currentCourse;
  const course = COURSES?.[courseId];
  const [chapterIdx, setChapterIdx] = useState(state.currentChapter || 0);
  const lessonRef = useRef(null);

  const chapters = course?.chapters || [];
  const totalChapters = chapters.length;
  const completedCount = chapters.filter((_, i) => state.completed?.[`${courseId}_${i}`]).length;
  const progressPct = totalChapters ? Math.round((completedCount / totalChapters) * 100) : 0;

  const getLevel = useCallback(() => {
    const pts = state.points || 0;
    if (pts >= 500) return { icon: '👑', name: 'Creator', next: '∞' };
    if (pts >= 250) return { icon: '🔨', name: 'Builder', next: 500 };
    return { icon: '🔍', name: 'Explorer', next: 250 };
  }, [state.points]);

  const isChapterLocked = useCallback((idx) => {
    if (idx === 0) return false; // Ch1 always free
    if (isDemoMode) return false;
    if (state.purchases?.fullAccess || state.purchases?.familyPlan) return false;
    if (state.purchases?.[courseId]) return false;
    return true;
  }, [isDemoMode, state.purchases, courseId]);

  const loadChapter = useCallback((idx) => {
    if (isChapterLocked(idx)) return;
    setChapterIdx(idx);
    if (state.currentChapter !== idx) {
      state.currentChapter = idx;
    }
    window.scrollTo(0, 0);
  }, [isChapterLocked, state]);

  // Load lesson content imperatively via LESSONS generators
  useEffect(() => {
    if (!lessonRef.current || !courseId || isChapterLocked(chapterIdx)) return;
    const gen = LESSONS[courseId]?.[chapterIdx];
    if (gen) {
      // Create a mutable STATE bridge for lesson generators
      window.STATE = {
        currentCourse: courseId,
        currentChapter: chapterIdx,
        name: state.name || '',
        points: state.points || 0,
        completed: state.completed || {},
        parentEmail: state.parentEmail || ''
      };

      // Set up globals that lesson generators reference
      window.addPoints = (n) => addPoints(n);
      window.gsap = window.gsap || { to: () => {}, fromTo: () => {} };

      // React bridge for loadChapter calls from lesson content
      window._reactLoadChapter = (idx) => {
        setChapterIdx(idx);
      };

      // completeChapter: update React state AND append celebration DOM
      window.completeChapter = () => {
        completeChapter(courseId, chapterIdx);
        const area = lessonRef.current;
        if (area && !area.querySelector('.chapter-complete')) {
          const div = document.createElement('div');
          div.className = 'chapter-complete show';
          div.innerHTML = `
            <span class="emoji">🎉</span>
            <h3>Chapter Complete!</h3>
            <p>+25 XP earned! Great job${state.name ? ', ' + state.name : ''}!</p>
            ${chapterIdx < 7 ? `<button class="btn btn-primary" onclick="window._reactLoadChapter(${chapterIdx + 1})">Next Chapter →</button>` : `<button class="btn btn-gold" onclick="window.location.hash='#badges'">🏆 View Badges</button>`}
          `;
          area.appendChild(div);
          div.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
      };

      lessonRef.current.innerHTML = '';
      gen(lessonRef.current);

      // Add "Complete & Continue" button if not already completed
      if (!state.completed?.[`${courseId}_${chapterIdx}`]) {
        const btnDiv = document.createElement('div');
        btnDiv.style.cssText = 'text-align:center;margin:24px 0;';
        btnDiv.innerHTML = `<button class="btn-next" style="display:inline-flex" onclick="window.completeChapter()">Complete & Continue →</button>`;
        lessonRef.current.appendChild(btnDiv);
      }
    }
  }, [chapterIdx, courseId, addPoints, completeChapter, state, isChapterLocked]);

  const handleComplete = () => {
    if (completeChapter) {
      completeChapter(courseId, chapterIdx);
    }
  };

  if (!course) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('landing')}>← Back Home</button>
      </div>
    );
  }

  const level = getLevel();
  const currentChapter = chapters[chapterIdx];
  const isCompleted = state.completed?.[`${courseId}_${chapterIdx}`];
  const isLocked = isChapterLocked(chapterIdx);
  const unreadCount = (notifications || []).filter(n => !n.read).length;

  return (
    <div id="course-view" style={{ display: 'block', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Course Header */}
      <div className="course-header">
        <button className="btn btn-back" onClick={() => navigate('landing')}>← Courses</button>
        <h2 style={{ flex: 1 }}>{course.title}</h2>
        <div className="progress-bar" style={{ flex: 1, maxWidth: '200px' }}>
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="progress-text">{progressPct}%</span>
        <span className="points-display">⭐ {state.points || 0}</span>
        <div className="notif-bell" onClick={toggleNotifPanel} style={{ position: 'relative' }}>
          🔔
          {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
        </div>
      </div>

      {/* Notification panel */}
      {showNotifPanel && (
        <div className="notif-panel show">
          <h4>🔔 Notifications</h4>
          {(!notifications || notifications.length === 0) ? (
            <div className="notif-empty">No notifications yet!</div>
          ) : (
            notifications.slice(0, 10).map((n, i) => (
              <div className="notif-item" key={i}>
                <span className="notif-icon">{n.icon || '📢'}</span>
                <span className="notif-text">{n.text}</span>
                <span className="notif-time">{n.time || ''}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Course Body */}
      <div className="course-body">
        {/* Sidebar */}
        <div className="chapter-sidebar">
          <div className="level-display">
            <span className="level-icon">{level.icon}</span>
            <span className="level-name">{level.name}</span>
            <span className="level-xp">{state.points || 0} / {level.next} XP</span>
          </div>
          {chapters.map((ch, i) => {
            const key = `${courseId}_${i}`;
            const completed = state.completed?.[key];
            const active = i === chapterIdx;
            const locked = isChapterLocked(i);
            return (
              <div
                className={`chapter-item${active ? ' active' : ''}${completed ? ' completed' : ''}${locked ? ' locked' : ''}`}
                key={i}
                onClick={() => loadChapter(i)}
              >
                <div className="ch-num">
                  {completed ? '✓' : locked ? '🔒' : i + 1}
                </div>
                <div className="ch-title">
                  {ch.emoji} {ch.title}
                  {locked && <div className="chapter-lock">🔒 Locked</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lesson Area */}
        <div className="lesson-area" ref={lessonRef}>
          {isLocked ? (
            <div className="unlock-banner">
              <h3>🔒 Chapter Locked</h3>
              <p>This chapter requires a subscription. Unlock it to continue your adventure!</p>
              <button className="btn btn-primary" onClick={() => navigate('landing', '#pricing')}>
                View Plans →
              </button>
            </div>
          ) : (
            <>
              {/* LESSONS generator fills this div imperatively */}
              {!LESSONS[courseId]?.[chapterIdx] && (
                <>
                  <h2>{currentChapter?.emoji} {currentChapter?.title}</h2>
                  <p className="lesson-desc">Coming soon! This chapter is being built.</p>
                </>
              )}
              {isCompleted && (
                <div className="chapter-complete show">
                  <span className="emoji">🎉</span>
                  <h3>Chapter Complete!</h3>
                  <p>+25 XP earned! Great job{state.name ? `, ${state.name}` : ''}!</p>
                  {chapterIdx < totalChapters - 1 ? (
                    <button className="btn btn-primary" onClick={() => loadChapter(chapterIdx + 1)}>
                      Next Chapter →
                    </button>
                  ) : (
                    <button className="btn btn-gold" onClick={() => navigate('badges')}>
                      🏆 View Badges
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
