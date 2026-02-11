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

/* ============================================================
   Course Management Tab
   ============================================================ */
function CoursesTab() {
  const [users, setUsers] = useState(() => DB.getUsers());
  const [refresh, setRefresh] = useState(0);
  const [grantUser, setGrantUser] = useState('');
  const [grantCourse, setGrantCourse] = useState('ai');
  const [grantReason, setGrantReason] = useState('');
  const [grantMsg, setGrantMsg] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const reload = () => { setUsers(DB.getUsers()); setRefresh(r => r + 1); };

  const children = DB.getChildren();
  const purchases = DB.getPurchases();
  const progress = DB.getProgress();
  const accessLog = (typeof DB.getCourseAccess === 'function') ? DB.getCourseAccess() : [];

  const courseIds = ['ai', 'space', 'robotics'];
  const courseLabels = { ai: '🤖 AI Adventures', space: '🚀 Space Explorers', robotics: '🔧 Robotics Lab', all: '🎓 All Courses' };
  const courseColors = { ai: '#06b6d4', space: '#8b5cf6', robotics: '#ec4899' };

  const courseStats = courseIds.map(cid => {
    let enrolled = 0, totalDone = 0;
    Object.values(progress).forEach(p => {
      let touched = false;
      for (let i = 0; i < 8; i++) { if (p[`${cid}_${i}`]) { touched = true; totalDone++; } }
      if (touched) enrolled++;
    });
    const totalPossible = enrolled * 8 || 1;
    const completionRate = Math.round(totalDone / totalPossible * 100);
    const revenue = purchases.filter(p => p.status === 'success' && ((p.plan === 'singleCourse' && p.courseId === cid) || p.plan === 'fullAccess' || p.plan === 'familyPlan'))
      .reduce((s, p) => s + (p.amount || 0), 0);
    return { cid, enrolled, completionRate, revenue, totalDone };
  });

  const filteredUsers = userSearch
    ? users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase()))
    : users;

  const handleGrant = () => {
    if (!grantUser || !grantReason.trim()) { setGrantMsg('❌ Select a user and provide a reason'); return; }
    if (typeof DB.grantCourseAccess === 'function') {
      DB.grantCourseAccess(grantUser, grantCourse, 'admin', grantReason.trim());
    }
    const u = users.find(x => x.id === grantUser);
    setGrantMsg(`✅ Access granted to ${u?.name || 'user'} for ${courseLabels[grantCourse]}`);
    setGrantUser(''); setGrantReason('');
    reload();
    setTimeout(() => setGrantMsg(''), 3000);
  };

  const handleRevoke = (accessId) => {
    if (typeof DB.revokeCourseAccess === 'function') DB.revokeCourseAccess(accessId);
    reload();
  };

  return (
    <div>
      {/* Course Overview Cards */}
      <h3 style={{ marginBottom: 16 }}>📊 Course Overview</h3>
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {courseStats.map(cs => (
          <div className="glass" key={cs.cid} style={{ padding: 20, borderRadius: 16, borderLeft: `4px solid ${courseColors[cs.cid]}` }}>
            <h4 style={{ marginBottom: 12 }}>{courseLabels[cs.cid]}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: courseColors[cs.cid] }}>{cs.enrolled}</div><div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Students</div></div>
              <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>{cs.completionRate}%</div><div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Completion</div></div>
              <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>${cs.revenue}</div><div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Revenue</div></div>
              <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cyan)' }}>{cs.totalDone}</div><div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Chapters Done</div></div>
            </div>
          </div>
        ))}
      </div>

      {/* Grant Course Access */}
      <h3 style={{ marginBottom: 16 }}>🎁 Grant Course Access</h3>
      <div className="glass" style={{ padding: 20, borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Select User</label>
            <input className="auth-input" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ marginBottom: 4 }} />
            <select className="auth-input" value={grantUser} onChange={e => setGrantUser(e.target.value)} style={{ width: '100%' }}>
              <option value="">-- Select User --</option>
              {filteredUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Select Course</label>
            <select className="auth-input" value={grantCourse} onChange={e => setGrantCourse(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
              {Object.entries(courseLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <label style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Reason</label>
        <input className="auth-input" placeholder='e.g. "Scholarship", "Beta tester", "Demo"' value={grantReason} onChange={e => setGrantReason(e.target.value)} style={{ marginBottom: 12 }} />
        <button className="btn btn-primary" onClick={handleGrant} style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>🎁 Grant Access</button>
        {grantMsg && <p style={{ marginTop: 8, fontSize: '.9rem', color: grantMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{grantMsg}</p>}
      </div>

      {/* Access Log */}
      <h3 style={{ marginBottom: 16 }}>📋 Access Log</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr><th>User</th><th>Course</th><th>Reason</th><th>Granted</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {accessLog.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)' }}>No access grants yet</td></tr>}
            {accessLog.slice().reverse().map(a => {
              const u = users.find(x => x.id === a.userId);
              return (
                <tr key={a.id}>
                  <td>{u?.name || a.userId}</td>
                  <td>{courseLabels[a.courseId] || a.courseId}</td>
                  <td>{a.reason}</td>
                  <td>{a.grantedAt ? new Date(a.grantedAt).toLocaleDateString() : '—'}</td>
                  <td><span className={`status-badge ${a.active ? 'status-success' : 'status-failed'}`}>{a.active ? 'Active' : 'Revoked'}</span></td>
                  <td>{a.active && <button className="btn btn-back" style={{ fontSize: '.8rem', padding: '4px 10px', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleRevoke(a.id)}>Revoke</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   User Management Tab
   ============================================================ */
function UsersTab() {
  const [users, setUsers] = useState(() => DB.getUsers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [detailUser, setDetailUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkCourse, setBulkCourse] = useState('ai');
  const [bulkReason, setBulkReason] = useState('');
  const [adminNotes, setAdminNotes] = useState({});

  // Create user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newChildren, setNewChildren] = useState([{ name: '', age: '', pin: '' }]);
  const [createCourses, setCreateCourses] = useState([]);
  const [createMsg, setCreateMsg] = useState('');

  const reload = () => setUsers(DB.getUsers());

  const children = DB.getChildren();
  const purchases = DB.getPurchases();
  const progress = DB.getProgress();

  const courseLabels = { ai: '🤖 AI', space: '🚀 Space', robotics: '🔧 Robotics', all: '🎓 All' };

  const q = search.toLowerCase();
  const filtered = users.filter(u => {
    if (statusFilter === 'active' && u.active === false) return false;
    if (statusFilter === 'deactivated' && u.active !== false) return false;
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedUsers(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selectedUsers.size === filtered.length) setSelectedUsers(new Set());
    else setSelectedUsers(new Set(filtered.map(u => u.id)));
  };

  const handleDeactivate = (userId) => {
    if (typeof DB.deactivateUser === 'function') DB.deactivateUser(userId);
    else DB.updateUser?.(userId, { active: false });
    reload();
  };
  const handleReactivate = (userId) => {
    if (typeof DB.reactivateUser === 'function') DB.reactivateUser(userId);
    else DB.updateUser?.(userId, { active: true });
    reload();
  };
  const handleDelete = (userId) => {
    if (typeof DB.deleteUser === 'function') DB.deleteUser(userId);
    setConfirmDelete(null);
    reload();
  };

  const handleBulk = () => {
    if (selectedUsers.size === 0) return;
    if (bulkAction === 'deactivate') {
      selectedUsers.forEach(id => handleDeactivate(id));
    } else if (bulkAction === 'grant') {
      selectedUsers.forEach(id => {
        if (typeof DB.grantCourseAccess === 'function') DB.grantCourseAccess(id, bulkCourse, 'admin', bulkReason || 'Bulk grant');
      });
    } else if (bulkAction === 'export') {
      let csv = 'Name,Email,Role,Status,Children,Joined\n';
      selectedUsers.forEach(id => {
        const u = users.find(x => x.id === id);
        if (u) {
          const kids = children.filter(c => c.parentId === u.id).map(k => k.name).join('; ');
          csv += `"${u.name}","${u.email}",${u.role || 'parent'},${u.active === false ? 'deactivated' : 'active'},"${kids}",${u.createdAt?.split('T')[0] || ''}\n`;
        }
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
    setSelectedUsers(new Set());
    setBulkAction('');
    reload();
  };

  const handleCreateUser = () => {
    if (!newName.trim() || !newEmail.trim()) { setCreateMsg('❌ Name and email required'); return; }
    if (DB.getUserByEmail(newEmail.trim())) { setCreateMsg('❌ Email already exists'); return; }
    const parent = DB.addUser({ name: newName.trim(), email: newEmail.trim(), password: newPassword || 'demo123', role: 'parent', active: true });
    newChildren.filter(c => c.name.trim()).forEach(c => {
      const pin = c.pin || String(Math.floor(1000 + Math.random() * 9000));
      DB.addChild({ name: c.name.trim(), age: parseInt(c.age) || 10, pin, parentId: parent.id });
    });
    createCourses.forEach(cid => {
      if (typeof DB.grantCourseAccess === 'function') DB.grantCourseAccess(parent.id, cid, 'admin', 'Granted on creation');
    });
    setCreateMsg(`✅ Created ${parent.name}`);
    setNewName(''); setNewEmail(''); setNewPassword(''); setNewChildren([{ name: '', age: '', pin: '' }]); setCreateCourses([]);
    reload();
    setTimeout(() => { setCreateMsg(''); setShowCreateModal(false); }, 1500);
  };

  const generatePin = () => String(Math.floor(1000 + Math.random() * 9000));

  const getUserCourses = (userId) => {
    const paid = purchases.filter(p => p.userId === userId && p.status === 'success');
    const granted = (typeof DB.getUserCourseAccess === 'function') ? DB.getUserCourseAccess(userId) : [];
    return { paid, granted };
  };

  const saveNote = (userId, note) => {
    if (typeof DB.updateUser === 'function') DB.updateUser(userId, { adminNotes: note });
    setAdminNotes(prev => ({ ...prev, [userId]: note }));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h3>👥 User Management</h3>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>+ Create User</button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="admin-search" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        {['all', 'active', 'deactivated'].map(s => (
          <button key={s} className={`admin-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)} style={{ textTransform: 'capitalize' }}>{s} ({s === 'all' ? users.length : s === 'active' ? users.filter(u => u.active !== false).length : users.filter(u => u.active === false).length})</button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="glass" style={{ padding: 12, borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600 }}>{selectedUsers.size} selected</span>
          <select className="auth-input" value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ width: 'auto' }}>
            <option value="">-- Bulk Action --</option>
            <option value="grant">Grant Course Access</option>
            <option value="deactivate">Deactivate</option>
            <option value="export">Export CSV</option>
          </select>
          {bulkAction === 'grant' && (
            <>
              <select className="auth-input" value={bulkCourse} onChange={e => setBulkCourse(e.target.value)} style={{ width: 'auto' }}>
                {Object.entries(courseLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input className="auth-input" placeholder="Reason" value={bulkReason} onChange={e => setBulkReason(e.target.value)} style={{ width: 150 }} />
            </>
          )}
          <button className="btn btn-primary" onClick={handleBulk} style={{ fontSize: '.85rem', padding: '6px 16px' }}>Apply</button>
        </div>
      )}

      {/* User Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectedUsers.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th>Name</th><th>Email</th><th>Role</th><th>Children</th><th>Courses</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const kids = children.filter(c => c.parentId === u.id);
              const { paid, granted } = getUserCourses(u.id);
              const isActive = u.active !== false;
              return (
                <tr key={u.id}>
                  <td><input type="checkbox" checked={selectedUsers.has(u.id)} onChange={() => toggleSelect(u.id)} /></td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{u.email}</td>
                  <td><span style={{ fontSize: '.8rem', background: u.role === 'admin' ? 'rgba(139,92,246,0.2)' : 'rgba(6,182,212,0.2)', padding: '2px 8px', borderRadius: 8, color: u.role === 'admin' ? 'var(--purple)' : 'var(--cyan)' }}>{u.role || 'parent'}</span></td>
                  <td>{kids.length}</td>
                  <td>{paid.length + granted.length}</td>
                  <td><span className={`status-badge ${isActive ? 'status-success' : 'status-failed'}`}>{isActive ? 'Active' : 'Deactivated'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button className="btn btn-back" style={{ fontSize: '.75rem', padding: '3px 8px' }} onClick={() => { setDetailUser(u); setAdminNotes(prev => ({ ...prev, [u.id]: u.adminNotes || '' })); }}>👁️</button>
                      {isActive
                        ? <button className="btn btn-back" style={{ fontSize: '.75rem', padding: '3px 8px', borderColor: 'orange', color: 'orange' }} onClick={() => handleDeactivate(u.id)}>⏸️</button>
                        : <button className="btn btn-back" style={{ fontSize: '.75rem', padding: '3px 8px', borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => handleReactivate(u.id)}>▶️</button>
                      }
                      <button className="btn btn-back" style={{ fontSize: '.75rem', padding: '3px 8px', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => setConfirmDelete(u.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => setConfirmDelete(null)}>
          <div className="glass" style={{ padding: 32, borderRadius: 20, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--red)', marginBottom: 12 }}>⚠️ Delete User?</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>This will permanently delete the user and all their children. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-back" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: 'var(--red)' }} onClick={() => handleDelete(confirmDelete)}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, overflow: 'auto', padding: 20 }} onClick={() => setDetailUser(null)}>
          <div className="glass" style={{ padding: 32, borderRadius: 20, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>👤 {detailUser.name}</h3>
              <button className="btn btn-back" onClick={() => setDetailUser(null)} style={{ fontSize: '1.2rem', padding: '4px 12px' }}>×</button>
            </div>

            {/* Parent Info */}
            <div className="glass" style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>📧 Info</h4>
              <p style={{ fontSize: '.9rem', color: 'var(--text2)' }}>Email: {detailUser.email}</p>
              <p style={{ fontSize: '.9rem', color: 'var(--text2)' }}>Role: {detailUser.role || 'parent'}</p>
              <p style={{ fontSize: '.9rem', color: 'var(--text2)' }}>Joined: {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString() : '—'}</p>
              <p style={{ fontSize: '.9rem', color: 'var(--text2)' }}>Status: <span className={`status-badge ${detailUser.active !== false ? 'status-success' : 'status-failed'}`}>{detailUser.active !== false ? 'Active' : 'Deactivated'}</span></p>
            </div>

            {/* Children */}
            <div className="glass" style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>👧 Children</h4>
              {children.filter(c => c.parentId === detailUser.id).map(child => {
                const cp = progress[child.id] || {};
                const totalDone = Object.keys(cp).length;
                return (
                  <div key={child.id} style={{ padding: 8, borderBottom: '1px solid var(--glass-border)' }}>
                    <strong>{child.name}</strong> <span style={{ fontSize: '.8rem', color: 'var(--text3)' }}>Age {child.age} • PIN: {child.pin}</span>
                    <div style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{totalDone} chapters completed</div>
                    {['ai', 'space', 'robotics'].map(cid => {
                      let done = 0;
                      for (let i = 0; i < 8; i++) { if (cp[`${cid}_${i}`]) done++; }
                      if (done === 0) return null;
                      return <div key={cid} style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{courseLabels[cid] || cid}: {done}/8</div>;
                    })}
                  </div>
                );
              })}
              {children.filter(c => c.parentId === detailUser.id).length === 0 && <p style={{ fontSize: '.85rem', color: 'var(--text3)' }}>No children</p>}
            </div>

            {/* Purchases */}
            <div className="glass" style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>💳 Purchases</h4>
              {purchases.filter(p => p.userId === detailUser.id).map(p => (
                <div key={p.id} style={{ padding: 4, fontSize: '.85rem', color: 'var(--text2)' }}>
                  {p.plan} — ${p.amount} — <span className={`status-badge ${p.status === 'success' ? 'status-success' : 'status-failed'}`}>{p.status}</span> — {p.date?.split('T')[0] || ''}
                </div>
              ))}
              {purchases.filter(p => p.userId === detailUser.id).length === 0 && <p style={{ fontSize: '.85rem', color: 'var(--text3)' }}>No purchases</p>}
            </div>

            {/* Granted Access */}
            <div className="glass" style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>🎁 Granted Access</h4>
              {accessLog.filter(a => a.userId === detailUser.id).map(a => (
                <div key={a.id} style={{ padding: 4, fontSize: '.85rem', color: 'var(--text2)' }}>
                  {courseLabels[a.courseId] || a.courseId} — {a.reason} — <span className={`status-badge ${a.active ? 'status-success' : 'status-failed'}`}>{a.active ? 'Active' : 'Revoked'}</span>
                </div>
              ))}
              {accessLog.filter(a => a.userId === detailUser.id).length === 0 && <p style={{ fontSize: '.85rem', color: 'var(--text3)' }}>No grants</p>}
            </div>

            {/* Admin Notes */}
            <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
              <h4 style={{ marginBottom: 8 }}>📝 Admin Notes</h4>
              <textarea className="auth-input" rows={3} value={adminNotes[detailUser.id] || ''} onChange={e => setAdminNotes(prev => ({ ...prev, [detailUser.id]: e.target.value }))} placeholder="Add notes about this user..." style={{ resize: 'vertical' }} />
              <button className="btn btn-primary" style={{ marginTop: 8, fontSize: '.85rem', padding: '6px 16px' }} onClick={() => saveNote(detailUser.id, adminNotes[detailUser.id] || '')}>Save Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, overflow: 'auto', padding: 20 }} onClick={() => setShowCreateModal(false)}>
          <div className="glass" style={{ padding: 32, borderRadius: 20, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>➕ Create User</h3>

            <label style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Name *</label>
            <input className="auth-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Parent name" />

            <label style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Email *</label>
            <input className="auth-input" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" type="email" />

            <label style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Password</label>
            <input className="auth-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Default: demo123" />

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>👧 Children</h4>
            {newChildren.map((ch, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                <input className="auth-input" placeholder="Name" value={ch.name} onChange={e => { const c = [...newChildren]; c[i].name = e.target.value; setNewChildren(c); }} />
                <input className="auth-input" placeholder="Age" type="number" value={ch.age} onChange={e => { const c = [...newChildren]; c[i].age = e.target.value; setNewChildren(c); }} />
                <input className="auth-input" placeholder="PIN" value={ch.pin} onChange={e => { const c = [...newChildren]; c[i].pin = e.target.value; setNewChildren(c); }} />
                <button className="btn btn-back" style={{ fontSize: '.75rem', padding: '4px 8px' }} onClick={() => { const c = [...newChildren]; c[i].pin = generatePin(); setNewChildren(c); }}>🎲</button>
              </div>
            ))}
            <button className="btn btn-back" style={{ fontSize: '.85rem', marginBottom: 16 }} onClick={() => setNewChildren([...newChildren, { name: '', age: '', pin: '' }])}>+ Add Child</button>

            <h4 style={{ marginBottom: 8 }}>🎓 Grant Courses</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {['ai', 'space', 'robotics', 'all'].map(cid => (
                <label key={cid} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={createCourses.includes(cid)} onChange={e => {
                    if (e.target.checked) setCreateCourses([...createCourses, cid]);
                    else setCreateCourses(createCourses.filter(x => x !== cid));
                  }} />
                  {courseLabels[cid]}
                </label>
              ))}
            </div>

            <button className="btn btn-primary" onClick={handleCreateUser} style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>Create User</button>
            {createMsg && <p style={{ marginTop: 8, fontSize: '.9rem', color: createMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{createMsg}</p>}
          </div>
        </div>
      )}
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
  { id: 'courses', label: '📚 Courses' },
  { id: 'users', label: '👥 Users' },
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
      case 'courses': return <CoursesTab />;
      case 'users': return <UsersTab />;
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
