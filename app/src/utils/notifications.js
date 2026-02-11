// ===== NOTIFICATION SYSTEM =====

export function addNotification(icon, text, state, setState) {
  const notif = { icon, text, time: Date.now() };
  setState(prev => {
    const newNotifs = [notif, ...prev.notifications];
    if (newNotifs.length > 50) newNotifs.pop();
    localStorage.setItem('ngs_notifications', JSON.stringify(newNotifs));
    return { ...prev, notifications: newNotifs };
  });
  // Browser push
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try { new Notification('NextGen School', { body: text, icon: '🎓' }); } catch(e) {}
  }
}

export function formatTimeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s/60) + 'm';
  if (s < 86400) return Math.floor(s/3600) + 'h';
  return Math.floor(s/86400) + 'd';
}

export function requestNotifPermission() {
  if (typeof Notification !== 'undefined' && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
