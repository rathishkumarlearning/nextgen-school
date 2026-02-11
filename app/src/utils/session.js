// ===== SESSION MANAGEMENT (sessionStorage) =====
const Session = {
  get() { try { return JSON.parse(sessionStorage.getItem('ngs_session') || 'null'); } catch { return null; } },
  set(data) { sessionStorage.setItem('ngs_session', JSON.stringify(data)); },
  clear() { sessionStorage.removeItem('ngs_session'); },
  isLoggedIn() { return !!this.get(); },
  isParent() { const s = this.get(); return s && s.role === 'parent'; },
  isChild() { const s = this.get(); return s && s.role === 'child'; },
  userId() { const s = this.get(); return s ? s.id : null; },
  parentId() { const s = this.get(); if (!s) return null; return s.role === 'parent' ? s.id : s.parentId; }
};

export default Session;
