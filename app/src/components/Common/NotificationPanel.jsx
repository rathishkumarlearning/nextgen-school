import { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const { state } = useGame();

  const notifications = state.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifTime.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-glass transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl shadow-2xl z-[9998] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-glass-border">
            <h3 className="text-lg font-bold text-text">Notifications</h3>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-text2">
                No notifications yet!
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className="p-4 border-b border-glass-border hover:bg-white/5 transition flex gap-3"
                >
                  <span className="text-2xl flex-shrink-0">{notif.icon}</span>
                  <div className="flex-1">
                    <p className="text-text text-sm">{notif.text}</p>
                    <p className="text-text2 text-xs mt-1">
                      {formatTimeAgo(notif.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
