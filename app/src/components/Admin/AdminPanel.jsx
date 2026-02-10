import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminEnrollments from './AdminEnrollments';
import AdminPayments from './AdminPayments';
import AdminAnalytics from './AdminAnalytics';
import AdminStudents from './AdminStudents';
import AdminSettings from './AdminSettings';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handlePasswordSubmit = () => {
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      alert('Incorrect password');
      setPasswordInput('');
    }
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    alert('CSV export functionality to be implemented');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-sm mx-4 bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-text mb-6">Admin Access</h2>
          <div className="flex gap-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Enter admin password"
              className="flex-1 px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handlePasswordSubmit}
              className="btn btn-primary px-6"
            >
              Access →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'enrollments', label: 'Enrollments', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'students', label: 'Students', icon: '🧒' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-glass transition"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold text-text">🛡️ Admin Dashboard</h1>
        </div>
        <button onClick={handleExportCSV} className="btn btn-secondary">
          📥 Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === tab.id
                ? 'bg-glass border border-cyan-400 text-cyan-400'
                : 'bg-glass border border-glass-border text-text2 hover:text-text'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'enrollments' && <AdminEnrollments />}
        {activeTab === 'payments' && <AdminPayments />}
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'students' && <AdminStudents />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}
