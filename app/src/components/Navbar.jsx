import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { state, navigate, notifications, toggleNotifPanel, showNotifPanel } = useApp();
  const { user, isLoggedIn, isDemoMode, logout, openAuthModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      background: 'rgba(5,5,16,0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('landing')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span style={{ fontSize: '1.4rem' }}>🚀</span>
        <span style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          NextGen School
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Nav links */}
      <button className="btn btn-back" onClick={() => navigate('landing')} style={{ padding: '6px 14px', fontSize: '.85rem' }}>
        🏠 Home
      </button>
      <button className="btn btn-back" onClick={() => navigate('badges')} style={{ padding: '6px 14px', fontSize: '.85rem' }}>
        🏆 Badges
      </button>

      {/* Notification bell */}
      <div className="notif-bell" onClick={toggleNotifPanel} style={{ position: 'relative' }}>
        🔔
        {unreadCount > 0 && (
          <span className="notif-count">{unreadCount}</span>
        )}
      </div>

      {/* Notification panel */}
      {showNotifPanel && (
        <div className="notif-panel show">
          <h4>🔔 Notifications</h4>
          {notifications.length === 0 ? (
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

      {/* User area */}
      {isLoggedIn || isDemoMode ? (
        <div className="user-menu" ref={menuRef} onClick={() => setShowUserMenu(!showUserMenu)}>
          <div className="user-avatar">
            {(user?.name || state.name || '?')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '.85rem', color: 'var(--text2)' }}>
            {user?.name || state.name || 'Explorer'}
            {isDemoMode && <span className="demo-badge">DEMO</span>}
          </span>
          {showUserMenu && (
            <div className="user-dropdown show">
              <a onClick={() => { navigate('parent-dashboard'); setShowUserMenu(false); }}>
                👨‍👩‍👧 Parent Dashboard
              </a>
              <a onClick={() => { navigate('badges'); setShowUserMenu(false); }}>
                🏆 Badges
              </a>
              <a onClick={() => { logout(); setShowUserMenu(false); }}>
                🚪 Log Out
              </a>
            </div>
          )}
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => openAuthModal('login')} style={{ padding: '8px 20px', fontSize: '.9rem' }}>
          Log In
        </button>
      )}
    </nav>
  );
}
