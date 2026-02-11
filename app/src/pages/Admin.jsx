import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

// DB and Session imports — these modules are created by another agent.
// We import defensively and fall back to localStorage direct access.
let DB, Session;
try {
  DB = await import('../utils/db.js').then(m => m.default || m.DB || m);
} catch {
  DB = null;
}
try {
  Session = await import('../utils/session.js').then(m => m.default || m.Session || m);
} catch {
  Session = null;
}

// Fallback DB if import failed
if (!DB || typeof DB.getUsers !== 'function') {
  DB = {
    _get(key) { try { return JSON.parse(localStorage.getItem('ngs_db_' + key) || 'null'); } catch { return null; } },
    _set(key, val) { localStorage.setItem('ngs_db_' + key, JSON.stringify(val)); },
    getUsers() { return this._get('users') || []; },
    saveUsers(u) { this._set('users', u); },
    getChildren() { return this._get('children') || []; },
    saveChildren(c) { this._set('children', c); },
    getPurchases() { return this._get('purchases') || []; },
    savePurchases(p) { this._set('purchases', p); },
    getProgress() { return this._get('progress') || {}; },
    saveProgress(p) { this._set('progress', p); },
    getEvents() { return this._get('events') || []; },
    getSettings() { return this._get('settings') || { demoMode: true, pricing: { singleCourse: 19, fullAccess: 39, familyPlan: 59 }, stripeKey: 'YOUR_STRIPE_KEY', razorpayKey: 'YOUR_RAZORPAY_KEY' }; },
    saveSettings(s) { this._set('settings', s); },
    seed() {
      if (this._get('seeded')) return;
      const families = [
        { name: 'Sarah Johnson', email: 'sarah@demo.com', password: 'demo123', children: [{ name: 'Emma', age: 10, pin: '1234' }, { name: 'Liam', age: 12, pin: '5678' }] },
        { name: 'Priya Sharma', email: 'priya@demo.com', password: 'demo123', children: [{ name: 'Arjun', age: 11, pin: '1111' }, { name: 'Ananya', age: 9, pin: '2222' }] },
        { name: 'Mike Chen', email: 'mike@demo.com', password: 'demo123', children: [{ name: 'Lucas', age: 13, pin: '3333' }, { name: 'Mia', age: 10, pin: '4444' }] }
      ];
      const addUser = (user) => { const u = this.getUsers(); user.id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); user.createdAt = new Date().toISOString(); u.push(user); this.saveUsers(u); return user; };
      const addChild = (child) => { const c = this.getChildren(); child.id = 'ch_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); child.createdAt = new Date().toISOString(); c.push(child); this.saveChildren(c); return child; };
      const addPurchase = (purchase) => { const p = this.getPurchases(); purchase.id = 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); purchase.date = new Date().toISOString(); p.push(purchase); this.savePurchases(p); return purchase; };
      const setChapterComplete = (childId, courseId, chapterIdx) => { const p = this.getProgress(); if (!p[childId]) p[childId] = {}; p[childId][`${courseId}_${chapterIdx}`] = { completedAt: new Date().toISOString() }; this.saveProgress(p); };

      families.forEach(f => {
        const parent = addUser({ name: f.name, email: f.email, password: f.password, role: 'parent' });
        f.children.forEach(ch => {
          const child = addChild({ name: ch.name, age: ch.age, pin: ch.pin, parentId: parent.id });
          const courses = ['ai', 'space', 'robotics'];
          const rc = courses[Math.floor(Math.random() * 3)];
          const chapters = Math.floor(Math.random() * 4) + 1;
          for (let i = 0; i < chapters; i++) setChapterComplete(child.id, rc, i);
        });
        if (f.email === 'sarah@demo.com') addPurchase({ userId: parent.id, plan: 'fullAccess', amount: 39, currency: 'USD', status: 'success', method: 'stripe' });
        if (f.email === 'priya@demo.com') {
          addPurchase({ userId: parent.id, plan: 'singleCourse', courseId: 'ai', amount: 19, currency: 'USD', status: 'success', method: 'razorpay' });
          addPurchase({ userId: parent.id, plan: 'singleCourse', courseId: 'space', amount: 19, currency: 'USD', status: 'failed', method: 'razorpay' });
        }
      });
      this._set('seeded', true);
    }
  };
  DB.seed();
}

const COURSES = {
  ai: { title: '🤖 AI Adventures', color: 'var(--cyan)', chapters: [{ title: 'What is AI?', emoji: '🤔' },{ title: 'How AI Learns', emoji: '📚' },{ title: 'Smart vs Wise', emoji: '🧠' },{ title: 'AI in Your World', emoji: '🌍' },{ title: 'Asking Better Questions', emoji: '❓' },{ title: 'When AI Gets It Wrong', emoji: '❌' },{ title: 'AI Ethics & Fairness', emoji: '⚖️' },{ title: 'Be the AI Boss', emoji: '👑' }] },
  space: { title: '🚀 Space Explorers', color: 'var(--purple)', chapters: [{ title: 'Our Solar System', emoji: '🪐' },{ title: 'Life of a Star', emoji: '⭐' },{ title: 'Rockets & Launch Science', emoji: '🚀' },{ title: 'Mission to Mars', emoji: '🔴' },{ title: 'Gravity & Orbits', emoji: '🌀' },{ title: 'Space AI', emoji: '🛸' },{ title: 'Astronaut Training', emoji: '👨‍🚀' },{ title: 'Design Your Space Mission', emoji: '📋' }] },
  robotics: { title: '🔧 Robotics Lab', color: 'var(--green)', chapters: [{ title: 'What is a Robot?', emoji: '🤖' },{ title: 'Robot Senses', emoji: '👁️' },{ title: 'Robot Brain', emoji: '🧠' },{ title: 'Robot Movement', emoji: '🕹️' },{ title: 'Types of Robots', emoji: '🦾' },{ title: 'Robots & AI Together', emoji: '🤝' },{ title: 'Robot Ethics', emoji: '⚖️' },{ title: 'Design Your Robot', emoji: '🏗️' }] }
};

const chartDarkOptions = {
  responsive: true,
  plugins: { legend: { display: false }, title: { color: '#e2e8f0' } },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

/* ============================================================
   CSV Export
   ============================================================ */
function adminExportCSV() {
  const users = DB.getUsers();
  const children = DB.getChildren();
  const purchases = DB.getPurchases();
  let csv = 'Type,Name,Email,Children,Plan,Amount,Status,Date\n';
  users.forEach(u => {
    const kids = children.filter(c => c.parentId === u.id).map(k => k.name).join('; ');
    const userPurchases = purchases.filter(p => p.userId === u.id);
    if (userPurchases.length) {
      userPurchases.forEach(p => {
        csv += `Parent,"${u.name}","${u.email}","${kids}",${p.plan},$${p.amount},${p.status},${p.date?.split('T')[0] || ''}\n`;
      });
    } else {
      csv += `Parent,"${u.name}","${u.email}","${kids}",—,—,—,${u.createdAt?.split('T')[0] || ''}\n`;
    }
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `nextgen-school-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

/* ============================================================
   Sub-tabs
   ============================================================ */

function DashboardTab() {
  const users = DB.getUsers();
  const children = DB.getChildren();
  const purchases = DB.getPurchases();
  const progress = DB.getProgress();

  const revenue = purchases.filter(p => p.status === 'success').reduce((s, p) => s + (p.amount || 0), 0);
  const failed = purchases.filter(p => p.status === 'failed').length;
  let totalChaptersDone = 0;
  try { totalChaptersDone = Object.values(progress).reduce((s, p) => s + Object.keys(p).length, 0); } catch { totalChaptersDone = 0; }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const revenueByDay = last7.map(day => purchases.filter(p => p.status === 'success' && p.date?.startsWith(day)).reduce((s, p) => s + (p.amount || 0), 0));
  const enrollByDay = last7.map(day => users.filter(u => u.createdAt?.startsWith(day)).length);

  const courseIds = ['ai', 'space', 'robotics'];
  const courseNames = ['AI Adventures', 'Space Explorers', 'Robotics Lab'];
  const completionRates = courseIds.map(cid => {
    let total = 0, done = 0;
    Object.values(progress).forEach(p => { for (let i = 0; i < 8; i++) { total++; if (p[`${cid}_${i}`]) done++; } });
    return total > 0 ? Math.round(done / total * 100) : 0;
  });

  return (
    <div>
      <div className="admin-grid">
        <div className="admin-stat"><div className="as-value" style={{ color: 'var(--cyan)' }}>{users.length}</div><div className="as-label">Families</div></div>
        <div className="admin-stat"><div className="as-value" style={{ color: 'var(--purple)' }}>{children.length}</div><div className="as-label">Children</div></div>
        <div className="admin-stat"><div className="as-value" style={{ color: 'var(--green)' }}>${revenue}</div><div className="as-label">Revenue</div></div>
        <div className="admin-stat"><div className="as-value" style={{ color: 'var(--gold)' }}>{purchases.length}</div><div className="as-label">Transactions</div></div>
        <div className="admin-stat"><div className="as-value" style={{ color: 'var(--pink)' }}>{totalChaptersDone}</div><div className="as-label">Chapters Done</div></div>
        <div className="admin-stat"><div className="as-value" style={{ color: 'var(--red)' }}>{failed}</div><div className="as-label">Failed Payments</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="admin-chart-wrap">
          <Bar data={{
            labels: last7.map(d => d.slice(5)),
            datasets: [{ label: 'Revenue ($)', data: revenueByDay, backgroundColor: 'rgba(6,182,212,0.5)', borderColor: '#06b6d4', borderWidth: 1 }]
          }} options={{ ...chartDarkOptions, plugins: { ...chartDarkOptions.plugins, title: { display: true, text: 'Revenue (Last 7 Days)', color: '#e2e8f0' } } }} />
        </div>
        <div className="admin-chart-wrap">
          <Line data={{
            labels: last7.map(d => d.slice(5)),
            datasets: [{ label: 'New Families', data: enrollByDay, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.3 }]
          }} options={{ ...chartDarkOptions, plugins: { ...chartDarkOptions.plugins, title: { display: true, text: 'Enrollments (Last 7 Days)', color: '#e2e8f0' } } }} />
        </div>
      </div>
      <div className="admin-chart-wrap">
        <Doughnut data={{
          labels: courseNames,
          datasets: [{ data: completionRates, backgroundColor: ['#06b6d4', '#8b5cf6', '#ec4899'] }]
        }} options={{ responsive: true, plugins: { title: { display: true, text: 'Course Completion %', color: '#e2e8f0' } } }} />
      </div>
    </div>
  );
}

function EnrollmentsTab() {
  const [search, setSearch] = useState('');
  const users = DB.getUsers();
  const children = DB.getChildren();
  const q = search.toLowerCase();
  const filtered = q ? users.filter(u => {
    const kids = children.filter(c => c.parentId === u.id);
    const text = `${u.name} ${u.email} ${kids.map(k => k.name).join(' ')}`.toLowerCase();
    return text.includes(q);
  }) : users;

  return (
    <div>
      <input className="admin-search" placeholder="Search families..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr><th>Parent</th><th>Email</th><th>Children</th><th>Joined</th></tr></thead>
          <tbody>
            {filtered.map(u => {
              const kids = children.filter(c => c.parentId === u.id);
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{kids.map(k => `${k.name} (${k.age})`).join(', ') || '—'}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const [filter, setFilter] = useState('all');
  const purchases = DB.getPurchases();
  const failed = purchases.filter(p => p.status === 'failed');

  const filtered = filter === 'all' ? purchases
    : filter === 'demo' ? purchases.filter(p => p.method === 'demo')
    : purchases.filter(p => p.status === filter);

  return (
    <div>
      {failed.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 16, marginBottom: 16, color: 'var(--red)' }}>
          ⚠️ {failed.length} failed payment(s) require attention
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all', `All (${purchases.length})`], ['success', `✅ Success (${purchases.filter(p => p.status === 'success').length})`], ['failed', `❌ Failed (${failed.length})`], ['demo', `🎮 Demo (${purchases.filter(p => p.method === 'demo').length})`]].map(([key, label]) => (
          <button key={key} className={`admin-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{p.id?.slice(0, 12) || '—'}</td>
                <td>{p.plan}</td>
                <td>${p.amount || 0}</td>
                <td>{p.method || '—'}</td>
                <td><span className={`status-badge ${p.status === 'success' ? 'status-success' : p.status === 'failed' ? 'status-failed' : 'status-demo'}`}>{p.status}</span></td>
                <td>{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const progress = DB.getProgress();
  const courseIds = ['ai', 'space', 'robotics'];
  const courseNames = { ai: '🤖 AI Adventures', space: '🚀 Space Explorers', robotics: '🔧 Robotics Lab' };

  const courseData = courseIds.map(cid => {
    const chapterCounts = Array(8).fill(0);
    let totalStudents = 0;
    Object.values(progress).forEach(p => {
      let touched = false;
      for (let i = 0; i < 8; i++) { if (p[`${cid}_${i}`]) { chapterCounts[i]++; touched = true; } }
      if (touched) totalStudents++;
    });
    return { cid, chapterCounts, totalStudents };
  });

  const colors = { ai: '#06b6d4', space: '#8b5cf6', robotics: '#ec4899' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
      {courseData.map(({ cid, chapterCounts, totalStudents }) => (
        <div className="admin-chart-wrap" key={cid}>
          <h4 style={{ marginBottom: 12 }}>{courseNames[cid]}</h4>
          <p style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{totalStudents} students enrolled</p>
          <Bar data={{
            labels: Array.from({ length: 8 }, (_, i) => `Ch ${i + 1}`),
            datasets: [{ label: 'Completions', data: chapterCounts, backgroundColor: colors[cid] }]
          }} options={{ ...chartDarkOptions, plugins: { legend: { display: false } } }} />
        </div>
      ))}
    </div>
  );
}

function StudentsTab() {
  const children = DB.getChildren();
  const progress = DB.getProgress();
  const users = DB.getUsers();

  if (!children.length) {
    return <p style={{ textAlign: 'center', color: 'var(--text2)', padding: 40 }}>No students yet</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {children.map(child => {
        const cp = progress[child.id] || {};
        const totalDone = Object.keys(cp).length;
        const parent = users.find(u => u.id === child.parentId);

        return (
          <div className="glass" style={{ padding: 20, borderRadius: 16 }} key={child.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h4>{child.name}</h4>
                <span style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Age {child.age} • Parent: {parent?.name || 'Unknown'}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cyan)' }}>{totalDone}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>chapters done</div>
              </div>
            </div>
            {['ai', 'space', 'robotics'].map(cid => {
              let done = 0;
              for (let i = 0; i < 8; i++) { if (cp[`${cid}_${i}`]) done++; }
              if (done === 0) return null;
              const pct = Math.round(done / 8 * 100);
              return (
                <div style={{ margin: '4px 0' }} key={cid}>
                  <span style={{ fontSize: '.85rem' }}>{COURSES[cid].title}</span>{' '}
                  <span style={{ color: 'var(--text3)', fontSize: '.8rem' }}>{done}/8 ({pct}%)</span>
                  <div className="progress-bar" style={{ maxWidth: '100%', height: 6, marginTop: 2 }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(cp).length === 0 && <p style={{ color: 'var(--text3)', fontSize: '.85rem' }}>No progress yet</p>}
          </div>
        );
      })}
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState(() => DB.getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    DB.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetSeed = () => {
    if (confirm('Reset all demo data?')) {
      localStorage.removeItem('ngs_db_seeded');
      DB.seed();
      alert('Seed data reset!');
    }
  };

  return (
    <div className="admin-settings" style={{ maxWidth: 500 }}>
      <h3 style={{ marginBottom: 20 }}>⚙️ Platform Settings</h3>

      <div className="glass" style={{ padding: 20, borderRadius: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h4>🎮 Demo Mode</h4>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Bypass payment — grant instant access</p>
          </div>
          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.demoMode} onChange={e => setSettings(s => ({ ...s, demoMode: e.target.checked }))} style={{ width: 20, height: 20 }} />
          </label>
        </div>
      </div>

      <h4 style={{ margin: '16px 0 8px' }}>💰 Pricing</h4>
      <label>Single Course ($)</label>
      <input className="auth-input" type="number" value={settings.pricing.singleCourse} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, singleCourse: parseInt(e.target.value) || 19 } }))} />
      <label>Full Access ($)</label>
      <input className="auth-input" type="number" value={settings.pricing.fullAccess} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, fullAccess: parseInt(e.target.value) || 39 } }))} />
      <label>Family Plan ($)</label>
      <input className="auth-input" type="number" value={settings.pricing.familyPlan} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, familyPlan: parseInt(e.target.value) || 59 } }))} />

      <h4 style={{ margin: '16px 0 8px' }}>🔑 Payment Keys</h4>
      <label>Stripe Public Key</label>
      <input className="auth-input" value={settings.stripeKey} onChange={e => setSettings(s => ({ ...s, stripeKey: e.target.value }))} />
      <label>Razorpay Key ID</label>
      <input className="auth-input" value={settings.razorpayKey} onChange={e => setSettings(s => ({ ...s, razorpayKey: e.target.value }))} />

      <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%', marginTop: 8 }}>
        {saved ? '✅ Saved!' : 'Save Settings'}
      </button>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
        <h4 style={{ color: 'var(--red)', marginBottom: 8 }}>⚠️ Danger Zone</h4>
        <button className="btn btn-back" onClick={handleResetSeed} style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          Reset Seed Data
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Main Admin Component
   ============================================================ */
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'enrollments', label: '👨‍👩‍👧 Enrollments' },
  { id: 'payments', label: '💳 Payments' },
  { id: 'analytics', label: '📈 Analytics' },
  { id: 'students', label: '🧒 Students' },
  { id: 'settings', label: '⚙️ Settings' },
];

export default function Admin({ onBack }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pwError, setPwError] = useState(false);

  const handlePasswordCheck = () => {
    if (password === 'admin123') {
      setAuthenticated(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePasswordCheck();
  };

  const handleBack = () => {
    if (onBack) onBack();
    else window.location.hash = '#home';
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'enrollments': return <EnrollmentsTab />;
      case 'payments': return <PaymentsTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'students': return <StudentsTab />;
      case 'settings': return <SettingsTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div id="admin-panel" style={{ display: 'block' }}>
      <div className="container">
        <div className="admin-header">
          <button className="btn btn-back" onClick={handleBack}>← Back</button>
          <h2>🛡️ Admin Dashboard</h2>
          <button className="btn btn-back" onClick={adminExportCSV}>📥 Export CSV</button>
        </div>

        {!authenticated ? (
          <div className="admin-password" id="admin-password-gate">
            <span style={{ fontSize: '4rem' }}>🔐</span>
            <h3>Admin Access Required</h3>
            <input
              className="auth-input"
              placeholder="Enter admin password"
              type="password"
              style={{ maxWidth: 300 }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {pwError && <p style={{ color: 'var(--red)', fontSize: '.85rem' }}>Invalid password</p>}
            <button className="btn btn-primary" onClick={handlePasswordCheck}>Access →</button>
          </div>
        ) : (
          <div id="admin-content">
            <div className="admin-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div id="admin-tab-content">
              {renderTab()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
