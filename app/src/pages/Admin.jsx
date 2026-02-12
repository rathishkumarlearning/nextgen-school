import { useState } from 'react';
import DashboardTab from '../admin/DashboardTab.jsx';
import EnrollmentsTab from '../admin/EnrollmentsTab.jsx';
import PaymentsTab from '../admin/PaymentsTab.jsx';
import AnalyticsTab from '../admin/AnalyticsTab.jsx';
import CoursesTab from '../admin/CoursesTab.jsx';
import UsersTab from '../admin/UsersTab.jsx';
import StudentsTab from '../admin/StudentsTab.jsx';
import CouponsTab from '../admin/CouponsTab.jsx';
import SettingsTab from '../admin/SettingsTab.jsx';

/* ── CSV Export ─────────────────────────────────────────── */
function adminExportCSV() {
  let DB;
  try {
    const raw = (key) => {
      try { return JSON.parse(localStorage.getItem('ngs_db_' + key) || 'null'); } catch { return null; }
    };
    const users = raw('users') || [];
    const children = raw('children') || [];
    const purchases = raw('purchases') || [];
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
  } catch (err) {
    console.error('CSV export failed:', err);
    alert('Export failed. Check console for details.');
  }
}

/* ── Tabs ───────────────────────────────────────────────── */
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard', component: DashboardTab },
  { id: 'enrollments', label: '👨‍👩‍👧 Enrollments', component: EnrollmentsTab },
  { id: 'payments', label: '💳 Payments', component: PaymentsTab },
  { id: 'analytics', label: '📈 Analytics', component: AnalyticsTab },
  { id: 'courses', label: '📚 Courses', component: CoursesTab },
  { id: 'users', label: '👥 Users', component: UsersTab },
  { id: 'students', label: '🧒 Students', component: StudentsTab },
  { id: 'coupons', label: '🎟️ Coupons', component: CouponsTab },
  { id: 'settings', label: '⚙️ Settings', component: SettingsTab },
];

/* ── Admin Page ─────────────────────────────────────────── */
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

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || DashboardTab;

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
            <div id="admin-tab-content" className="admin-content">
              <ActiveComponent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
