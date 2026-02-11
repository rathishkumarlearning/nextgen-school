// ===== DATABASE LAYER (localStorage) =====
const DB = {
  _get(key) { try { return JSON.parse(localStorage.getItem('ngs_db_' + key) || 'null'); } catch { return null; } },
  _set(key, val) { localStorage.setItem('ngs_db_' + key, JSON.stringify(val)); },
  
  // Users (parents)
  getUsers() { return this._get('users') || []; },
  saveUsers(u) { this._set('users', u); },
  addUser(user) { const u = this.getUsers(); user.id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); user.createdAt = new Date().toISOString(); u.push(user); this.saveUsers(u); return user; },
  getUserByEmail(email) { return this.getUsers().find(u => u.email === email); },
  
  // Children
  getChildren() { return this._get('children') || []; },
  saveChildren(c) { this._set('children', c); },
  addChild(child) { const c = this.getChildren(); child.id = 'ch_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); child.createdAt = new Date().toISOString(); c.push(child); this.saveChildren(c); return child; },
  getChildrenByParent(parentId) { return this.getChildren().filter(c => c.parentId === parentId); },
  getChildByPin(pin) { return this.getChildren().find(c => c.pin === pin); },
  
  // Purchases
  getPurchases() { return this._get('purchases') || []; },
  savePurchases(p) { this._set('purchases', p); },
  addPurchase(purchase) { const p = this.getPurchases(); purchase.id = 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); purchase.date = new Date().toISOString(); p.push(purchase); this.savePurchases(p); this.logEvent('purchase', purchase); return purchase; },
  getPurchasesByUser(userId) { return this.getPurchases().filter(p => p.userId === userId); },
  hasCourseAccess(userId, courseId) {
    const purchases = this.getPurchasesByUser(userId);
    return purchases.some(p => p.status === 'success' && (p.plan === 'fullAccess' || p.plan === 'familyPlan' || (p.plan === 'singleCourse' && p.courseId === courseId)));
  },
  
  // Progress (per-child)
  getProgress() { return this._get('progress') || {}; },
  saveProgress(p) { this._set('progress', p); },
  setChapterComplete(childId, courseId, chapterIdx) {
    const p = this.getProgress();
    if (!p[childId]) p[childId] = {};
    p[childId][`${courseId}_${chapterIdx}`] = { completedAt: new Date().toISOString() };
    this.saveProgress(p);
  },
  getChildProgress(childId) { return this.getProgress()[childId] || {}; },
  
  // Admin events log
  getEvents() { return this._get('events') || []; },
  logEvent(type, data) { const e = this.getEvents(); e.push({ type, data, ts: new Date().toISOString() }); if (e.length > 500) e.splice(0, e.length - 500); this._set('events', e); },
  
  // Settings
  getSettings() { return this._get('settings') || { demoMode: true, pricing: { singleCourse: 19, fullAccess: 39, familyPlan: 59 }, stripeKey: 'YOUR_STRIPE_KEY', razorpayKey: 'YOUR_RAZORPAY_KEY' }; },
  saveSettings(s) { this._set('settings', s); },
  
  // Seed data
  seed() {
    if (this._get('seeded')) return;
    const families = [
      { name: 'Sarah Johnson', email: 'sarah@demo.com', password: 'demo123', children: [{ name: 'Emma', age: 10, pin: '1234' }, { name: 'Liam', age: 12, pin: '5678' }] },
      { name: 'Priya Sharma', email: 'priya@demo.com', password: 'demo123', children: [{ name: 'Arjun', age: 11, pin: '1111' }, { name: 'Ananya', age: 9, pin: '2222' }] },
      { name: 'Mike Chen', email: 'mike@demo.com', password: 'demo123', children: [{ name: 'Lucas', age: 13, pin: '3333' }, { name: 'Mia', age: 10, pin: '4444' }] }
    ];
    families.forEach(f => {
      const parent = this.addUser({ name: f.name, email: f.email, password: f.password, role: 'parent' });
      f.children.forEach(ch => {
        const child = this.addChild({ name: ch.name, age: ch.age, pin: ch.pin, parentId: parent.id });
        // Add sample progress
        const courses = ['ai', 'space', 'robotics'];
        const rc = courses[Math.floor(Math.random() * 3)];
        const chapters = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < chapters; i++) this.setChapterComplete(child.id, rc, i);
      });
      // Add sample purchase for first family
      if (f.email === 'sarah@demo.com') {
        this.addPurchase({ userId: parent.id, plan: 'fullAccess', amount: 39, currency: 'USD', status: 'success', method: 'stripe' });
      }
      if (f.email === 'priya@demo.com') {
        this.addPurchase({ userId: parent.id, plan: 'singleCourse', courseId: 'ai', amount: 19, currency: 'USD', status: 'success', method: 'razorpay' });
        this.addPurchase({ userId: parent.id, plan: 'singleCourse', courseId: 'space', amount: 19, currency: 'USD', status: 'failed', method: 'razorpay' });
      }
    });
    this._set('seeded', true);
  }
};

// Seed on first load
DB.seed();

export default DB;
