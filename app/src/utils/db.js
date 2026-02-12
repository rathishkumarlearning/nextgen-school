// ===== DATABASE LAYER (Supabase + localStorage fallback) =====
import supabase from './supabase.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const USE_SUPABASE = supabase && !supabaseUrl.includes('YOUR_');

// ---- localStorage implementation (original) ----
const LocalDB = {
  _get(key) { try { return JSON.parse(localStorage.getItem('ngs_db_' + key) || 'null'); } catch { return null; } },
  _set(key, val) { localStorage.setItem('ngs_db_' + key, JSON.stringify(val)); },

  getUsers() { return this._get('users') || []; },
  saveUsers(u) { this._set('users', u); },
  addUser(user) { const u = this.getUsers(); user.id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); user.createdAt = new Date().toISOString(); u.push(user); this.saveUsers(u); return user; },
  getUserByEmail(email) { return this.getUsers().find(u => u.email === email); },

  getChildren() { return this._get('children') || []; },
  saveChildren(c) { this._set('children', c); },
  addChild(child) { const c = this.getChildren(); child.id = 'ch_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); child.createdAt = new Date().toISOString(); c.push(child); this.saveChildren(c); return child; },
  getChildrenByParent(parentId) { return this.getChildren().filter(c => c.parentId === parentId); },
  getChildByPin(pin) { return this.getChildren().find(c => c.pin === pin); },

  getPurchases() { return this._get('purchases') || []; },
  savePurchases(p) { this._set('purchases', p); },
  addPurchase(purchase) { const p = this.getPurchases(); purchase.id = 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); purchase.date = new Date().toISOString(); p.push(purchase); this.savePurchases(p); this.logEvent('purchase', purchase); return purchase; },
  getPurchasesByUser(userId) { return this.getPurchases().filter(p => p.userId === userId); },
  hasCourseAccess(userId, courseId) {
    const purchases = this.getPurchasesByUser(userId);
    const hasPurchase = purchases.some(p => p.status === 'success' && (p.plan === 'fullAccess' || p.plan === 'familyPlan' || (p.plan === 'singleCourse' && p.courseId === courseId)));
    if (hasPurchase) return true;
    const grants = this.getUserCourseAccess(userId);
    return grants.some(g => g.courseId === courseId || g.courseId === 'all');
  },

  getCourseAccess() { return this._get('course_access') || []; },
  saveCourseAccess(a) { this._set('course_access', a); },
  grantCourseAccess(userId, courseId, grantedBy, reason) {
    const a = this.getCourseAccess();
    a.push({ id: 'ca_' + Date.now(), userId, courseId, grantedBy, reason, grantedAt: new Date().toISOString(), active: true });
    this.saveCourseAccess(a);
    this.logEvent('course_access_granted', { userId, courseId, reason });
  },
  revokeCourseAccess(accessId) {
    const a = this.getCourseAccess();
    const item = a.find(x => x.id === accessId);
    if (item) { item.active = false; item.revokedAt = new Date().toISOString(); }
    this.saveCourseAccess(a);
  },
  getUserCourseAccess(userId) { return this.getCourseAccess().filter(a => a.userId === userId && a.active); },

  updateUser(userId, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) { Object.assign(users[idx], updates); this.saveUsers(users); }
  },
  deactivateUser(userId) { this.updateUser(userId, { active: false, deactivatedAt: new Date().toISOString() }); this.logEvent('user_deactivated', { userId }); },
  reactivateUser(userId) { this.updateUser(userId, { active: true }); this.logEvent('user_reactivated', { userId }); },
  deleteUser(userId) {
    const users = this.getUsers().filter(u => u.id !== userId); this.saveUsers(users);
    const children = this.getChildren().filter(c => c.parentId !== userId); this.saveChildren(children);
    this.logEvent('user_deleted', { userId });
  },

  getProgress() { return this._get('progress') || {}; },
  saveProgress(p) { this._set('progress', p); },
  setChapterComplete(childId, courseId, chapterIdx) {
    const p = this.getProgress();
    if (!p[childId]) p[childId] = {};
    p[childId][`${courseId}_${chapterIdx}`] = { completedAt: new Date().toISOString() };
    this.saveProgress(p);
  },
  getChildProgress(childId) { return this.getProgress()[childId] || {}; },

  getEvents() { return this._get('events') || []; },
  logEvent(type, data) { const e = this.getEvents(); e.push({ type, data, ts: new Date().toISOString() }); if (e.length > 500) e.splice(0, e.length - 500); this._set('events', e); },

  getSettings() { return this._get('settings') || { demoMode: true, pricing: { singleCourse: 19, fullAccess: 39, familyPlan: 59 }, stripeKey: 'YOUR_STRIPE_KEY', razorpayKey: 'YOUR_RAZORPAY_KEY' }; },
  saveSettings(s) { this._set('settings', s); },

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
        const courses = ['ai', 'space', 'robotics'];
        const rc = courses[Math.floor(Math.random() * 3)];
        const chapters = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < chapters; i++) this.setChapterComplete(child.id, rc, i);
      });
      if (f.email === 'sarah@demo.com') this.addPurchase({ userId: parent.id, plan: 'fullAccess', amount: 39, currency: 'USD', status: 'success', method: 'stripe' });
      if (f.email === 'priya@demo.com') {
        this.addPurchase({ userId: parent.id, plan: 'singleCourse', courseId: 'ai', amount: 19, currency: 'USD', status: 'success', method: 'razorpay' });
        this.addPurchase({ userId: parent.id, plan: 'singleCourse', courseId: 'space', amount: 19, currency: 'USD', status: 'failed', method: 'razorpay' });
      }
    });
    this._set('seeded', true);
  }
};

// ---- Supabase implementation ----
const SupabaseDB = {
  // Users (profiles)
  async getUsers() { const { data } = await supabase.from('profiles').select('*'); return data || []; },
  async saveUsers() { /* no-op: Supabase is source of truth */ },
  async addUser(user) {
    const { data, error } = await supabase.from('profiles').insert({
      name: user.name, email: user.email, role: user.role || 'parent', active: true
    }).select().single();
    if (error) { console.error('addUser error:', error); return null; }
    return data;
  },
  async getUserByEmail(email) {
    const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
    return data || null;
  },

  // Children
  async getChildren() { const { data } = await supabase.from('children').select('*'); return data || []; },
  async addChild(child) {
    const { data, error } = await supabase.from('children').insert({
      name: child.name, age: child.age, pin: child.pin, parent_id: child.parentId || child.parent_id
    }).select().single();
    if (error) { console.error('addChild error:', error); return null; }
    return data;
  },
  async getChildrenByParent(parentId) {
    const { data } = await supabase.from('children').select('*').eq('parent_id', parentId);
    return data || [];
  },
  async getChildByPin(pin) {
    const { data } = await supabase.from('children').select('*').eq('pin', pin).single();
    return data || null;
  },

  // Purchases
  async getPurchases() { const { data } = await supabase.from('purchases').select('*'); return data || []; },
  async addPurchase(purchase) {
    const { data, error } = await supabase.from('purchases').insert({
      user_id: purchase.userId, plan: purchase.plan, course_id: purchase.courseId || null,
      amount: purchase.amount, currency: purchase.currency, status: purchase.status, method: purchase.method
    }).select().single();
    if (error) { console.error('addPurchase error:', error); return null; }
    await this.logEvent('purchase', purchase);
    return data;
  },
  async getPurchasesByUser(userId) {
    const { data } = await supabase.from('purchases').select('*').eq('user_id', userId);
    return data || [];
  },
  async hasCourseAccess(userId, courseId) {
    const purchases = await this.getPurchasesByUser(userId);
    const hasPurchase = purchases.some(p => p.status === 'success' && (p.plan === 'fullAccess' || p.plan === 'familyPlan' || (p.plan === 'singleCourse' && p.course_id === courseId)));
    if (hasPurchase) return true;
    const grants = await this.getUserCourseAccess(userId);
    return grants.some(g => g.course_id === courseId || g.course_id === 'all');
  },

  // Course Access
  async getCourseAccess() { const { data } = await supabase.from('course_access').select('*'); return data || []; },
  async grantCourseAccess(userId, courseId, grantedBy, reason) {
    await supabase.from('course_access').insert({
      user_id: userId, course_id: courseId, granted_by: grantedBy, reason, active: true
    });
    await this.logEvent('course_access_granted', { userId, courseId, reason });
  },
  async revokeCourseAccess(accessId) {
    await supabase.from('course_access').update({ active: false, revoked_at: new Date().toISOString() }).eq('id', accessId);
  },
  async getUserCourseAccess(userId) {
    const { data } = await supabase.from('course_access').select('*').eq('user_id', userId).eq('active', true);
    return data || [];
  },

  // User Management
  async updateUser(userId, updates) {
    await supabase.from('profiles').update(updates).eq('id', userId);
  },
  async deactivateUser(userId) {
    await this.updateUser(userId, { active: false, deactivated_at: new Date().toISOString() });
    await this.logEvent('user_deactivated', { userId });
  },
  async reactivateUser(userId) {
    await this.updateUser(userId, { active: true });
    await this.logEvent('user_reactivated', { userId });
  },
  async deleteUser(userId) {
    await supabase.from('children').delete().eq('parent_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    await this.logEvent('user_deleted', { userId });
  },

  // Progress
  async getProgress() {
    const { data } = await supabase.from('progress').select('*');
    // Convert array to nested object: { childId: { "courseId_chapterIdx": { completedAt } } }
    const result = {};
    (data || []).forEach(row => {
      if (!result[row.child_id]) result[row.child_id] = {};
      result[row.child_id][`${row.course_id}_${row.chapter_idx}`] = { completedAt: row.completed_at };
    });
    return result;
  },
  async setChapterComplete(childId, courseId, chapterIdx) {
    await supabase.from('progress').upsert({
      child_id: childId, course_id: courseId, chapter_idx: chapterIdx, completed_at: new Date().toISOString()
    }, { onConflict: 'child_id,course_id,chapter_idx' });
  },
  async getChildProgress(childId) {
    const { data } = await supabase.from('progress').select('*').eq('child_id', childId);
    const result = {};
    (data || []).forEach(row => {
      result[`${row.course_id}_${row.chapter_idx}`] = { completedAt: row.completed_at };
    });
    return result;
  },

  // Events
  async getEvents() {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(500);
    return (data || []).map(e => ({ type: e.type, data: e.data, ts: e.created_at }));
  },
  async logEvent(type, eventData) {
    await supabase.from('events').insert({ type, data: eventData });
  },

  // Settings
  async getSettings() {
    const { data } = await supabase.from('settings').select('*').eq('key', 'app_settings').single();
    return data?.value || { demoMode: true, pricing: { singleCourse: 19, fullAccess: 39, familyPlan: 59 }, stripeKey: 'YOUR_STRIPE_KEY', razorpayKey: 'YOUR_RAZORPAY_KEY' };
  },
  async saveSettings(s) {
    await supabase.from('settings').upsert({ key: 'app_settings', value: s }, { onConflict: 'key' });
  },

  // Seed — no-op for Supabase (seeding done via SQL)
  async seed() { /* no-op */ },

  // Keep these for compat
  async savePurchases() {},
  async saveChildren() {},
  async saveProgress() {},
  async saveCourseAccess() {},
};

const DB = USE_SUPABASE ? SupabaseDB : LocalDB;

// Seed on first load (only runs for localStorage mode)
if (!USE_SUPABASE) {
  LocalDB.seed();
}

export default DB;
