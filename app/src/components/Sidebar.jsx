import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'Home', hash: 'home' },
  { id: 'courses', icon: '📚', label: 'Courses', hash: 'courses', children: [
    { id: 'ai', icon: '🤖', label: 'AI Adventures' },
    { id: 'space', icon: '🚀', label: 'Space Explorers' },
    { id: 'robotics', icon: '🔧', label: 'Robotics Lab' },
  ]},
  { id: 'badges', icon: '🏆', label: 'My Badges', hash: 'badges' },
  { id: 'parent', icon: '👨‍👩‍👧', label: 'Parent Portal', hash: 'parent' },
  { id: 'admin', icon: '🔐', label: 'Admin Panel', hash: 'admin' },
];

export default function Sidebar() {
  const { state, navigate, openCourse } = useApp();
  const { isLoggedIn, isDemoMode, currentUser, isChild, childSession, openAuthModal, logout } = useAuth();
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentView = state.currentView;

  const handleNav = (item) => {
    if (item.children) {
      setCoursesOpen(prev => !prev);
      return;
    }
    navigate(item.hash || item.id);
    setMobileOpen(false);
  };

  const handleCourseClick = (courseId) => {
    openCourse(courseId);
    setMobileOpen(false);
  };

  // Determine role badge
  const getRoleBadge = () => {
    if (isChild) return { label: 'Child', color: 'var(--cyan)' };
    if (currentUser?.role === 'admin') return { label: 'Admin', color: 'var(--pink)' };
    if (currentUser?.role === 'parent') return { label: 'Parent', color: 'var(--purple)' };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      <button className="sidebar-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">🎓</div>
          <div>
            <div className="sidebar-title">NextGen School</div>
            <div className="sidebar-tagline">Mind Over Machines</div>
          </div>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <div key={item.id}>
              <button
                className={`sidebar-nav-item${currentView === item.id || (item.id === 'home' && currentView === 'home') ? ' active' : ''}`}
                onClick={() => handleNav(item)}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
                {item.children && (
                  <span className={`sidebar-nav-arrow${coursesOpen ? ' open' : ''}`}>›</span>
                )}
              </button>
              {item.children && coursesOpen && (
                <div className="sidebar-submenu">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className={`sidebar-nav-item sidebar-sub-item${state.currentCourse === child.id && currentView === 'courses' ? ' active' : ''}`}
                      onClick={() => handleCourseClick(child.id)}
                    >
                      <span className="sidebar-nav-icon">{child.icon}</span>
                      <span className="sidebar-nav-label">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          {isLoggedIn && !isDemoMode ? (
            <div className="sidebar-user">
              <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, var(--purple), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 36, height: 36, fontSize: '1rem' }}>
                {(currentUser?.name || 'U')[0].toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">
                  {currentUser?.name || 'User'}
                  {roleBadge && (
                    <span style={{ fontSize: '.65rem', background: roleBadge.color, color: '#fff', padding: '2px 6px', borderRadius: 8, marginLeft: 6, verticalAlign: 'middle' }}>
                      {roleBadge.label}
                    </span>
                  )}
                </div>
                {isChild && childSession && (
                  <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '.75rem', padding: 0 }}>
                    Switch to Parent
                  </button>
                )}
                {!isChild && (
                  <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '.75rem', padding: 0 }}>
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          ) : isDemoMode ? (
            <div className="sidebar-user">
              <div className="sidebar-avatar">👤</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">Explorer</div>
                <div className="sidebar-demo-badge">DEMO MODE</div>
                <button onClick={() => openAuthModal('signup')} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '.75rem', padding: 0, marginTop: '4px' }}>
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="sidebar-user" style={{ gap: '8px' }}>
              <button className="btn btn-primary" onClick={() => openAuthModal('signup')} style={{ fontSize: '.8rem', padding: '8px 16px', flex: 1 }}>Sign Up</button>
              <button className="btn btn-back" onClick={() => openAuthModal('login')} style={{ fontSize: '.8rem', padding: '8px 16px', flex: 1 }}>Log In</button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
