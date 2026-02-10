// localStorage database module for NextGen School
// All data stored with ngs_ prefix for namespacing

const DB = {
  _get(key) {
    try {
      const data = localStorage.getItem(`ngs_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return null;
    }
  },

  _set(key, val) {
    try {
      localStorage.setItem(`ngs_${key}`, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
      return false;
    }
  },

  // Users (parents)
  getUsers() {
    return this._get('users') || [];
  },

  saveUsers(users) {
    return this._set('users', users);
  },

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    return this.saveUsers(users);
  },

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email === email);
  },

  // Children
  getChildren() {
    return this._get('children') || [];
  },

  saveChildren(children) {
    return this._set('children', children);
  },

  addChild(child) {
    const children = this.getChildren();
    children.push(child);
    return this.saveChildren(children);
  },

  getChildrenByParent(parentId) {
    const children = this.getChildren();
    return children.filter(c => c.parentId === parentId);
  },

  getChildByPin(pin) {
    const children = this.getChildren();
    return children.find(c => c.pin === pin);
  },

  // Purchases
  getPurchases() {
    return this._get('purchases') || [];
  },

  savePurchases(purchases) {
    return this._set('purchases', purchases);
  },

  addPurchase(purchase) {
    const purchases = this.getPurchases();
    purchases.push(purchase);
    return this.savePurchases(purchases);
  },

  getPurchasesByUser(userId) {
    const purchases = this.getPurchases();
    return purchases.filter(p => p.userId === userId);
  },

  hasCourseAccess(userId, courseId) {
    // Chapter 1 is always free
    if (courseId === 'ai' || courseId === 'space' || courseId === 'robotics') {
      const purchases = this.getPurchasesByUser(userId);
      // Demo mode or has paid purchase
      const hasPaid = purchases.some(p => p.courseId === courseId || p.type === 'bundle' || p.type === 'family');
      return hasPaid || localStorage.getItem('ngs_demo') === 'true';
    }
    return true;
  },

  // Progress
  getProgress() {
    return this._get('progress') || [];
  },

  saveProgress(progress) {
    return this._set('progress', progress);
  },

  setChapterComplete(childId, courseId, chapterIdx) {
    const progress = this.getProgress();
    const existing = progress.find(p => p.childId === childId && p.courseId === courseId);

    if (existing) {
      if (!existing.completedChapters) existing.completedChapters = [];
      if (!existing.completedChapters.includes(chapterIdx)) {
        existing.completedChapters.push(chapterIdx);
      }
    } else {
      progress.push({
        childId,
        courseId,
        completedChapters: [chapterIdx],
        startedAt: new Date().toISOString(),
      });
    }

    return this.saveProgress(progress);
  },

  getChildProgress(childId) {
    const progress = this.getProgress();
    return progress.filter(p => p.childId === childId);
  },

  // Events (for analytics)
  getEvents() {
    return this._get('events') || [];
  },

  logEvent(type, data) {
    const events = this.getEvents();
    events.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    // Keep last 1000 events
    if (events.length > 1000) {
      events.shift();
    }
    return this._set('events', events);
  },

  // Settings
  getSettings() {
    return this._get('settings') || {
      demoMode: false,
      emailKey: '',
      stripeKey: '',
      razorpayKey: '',
    };
  },

  saveSettings(settings) {
    return this._set('settings', settings);
  },

  // Seed demo data
  seed() {
    // Check if already seeded
    if (this.getUsers().length > 0) {
      return;
    }

    const demoParent = {
      id: 'parent_demo_1',
      email: 'demo@nextgenschool.com',
      password: 'demo123', // In real app, this would be hashed
      name: 'Demo Parent',
      createdAt: new Date().toISOString(),
    };

    const demoChildren = [
      {
        id: 'child_demo_1',
        parentId: 'parent_demo_1',
        name: 'Alex',
        pin: '1234',
        avatar: '🧑‍🚀',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'child_demo_2',
        parentId: 'parent_demo_1',
        name: 'Jordan',
        pin: '5678',
        avatar: '👨‍🚀',
        createdAt: new Date().toISOString(),
      },
    ];

    const demoPurchases = [
      {
        id: 'purchase_demo_1',
        userId: 'parent_demo_1',
        type: 'bundle', // all 3 courses
        amount: 39,
        currency: 'USD',
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
    ];

    const demoProgress = [
      {
        childId: 'child_demo_1',
        courseId: 'ai',
        completedChapters: [0, 1],
        startedAt: new Date().toISOString(),
      },
    ];

    this.saveUsers([demoParent]);
    this.saveChildren(demoChildren);
    this.savePurchases(demoPurchases);
    this.saveProgress(demoProgress);
  },
};

export default DB;
