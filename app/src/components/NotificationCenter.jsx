import React, { useState, useEffect, useRef } from 'react';

function formatTimeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ngs_notifications') || '[]'); } catch { return []; }
  });
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Sync from localStorage periodically (other code may add notifications)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('ngs_notifications') || '[]');
        setNotifications(stored);
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        open &&
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const unread = notifications.filter(n => Date.now() - n.time < 86400000).length;

  const handleMarkAllRead = () => {
    // Mark all as "old" by setting time to >24h ago
    const updated = notifications.map(n => ({ ...n, time: Date.now() - 86400001 }));
    localStorage.setItem('ngs_notifications', JSON.stringify(updated));
    setNotifications(updated);
  };

  return (
    <>
      <div className="notif-bell" ref={bellRef} onClick={() => setOpen(o => !o)}>
        🔔
        {unread > 0 && <span className="notif-count" style={{ display: 'flex' }}>{unread}</span>}
      </div>
      <div className={`notif-panel ${open ? 'show' : ''}`} ref={panelRef}>
        <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Notifications
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none', border: 'none', color: 'var(--cyan)',
                fontSize: '.75rem', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Mark all read
            </button>
          )}
        </h4>
        <div id="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications yet!</div>
          ) : (
            notifications.slice(0, 20).map((n, i) => (
              <div className="notif-item" key={i}>
                <span className="notif-icon">{n.icon}</span>
                <span className="notif-text">{n.text}</span>
                <span className="notif-time">{formatTimeAgo(n.time)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
