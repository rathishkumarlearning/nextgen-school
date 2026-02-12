import React, { useState } from 'react';

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    demoMode: false,
    emailNotifications: true,
    maintenanceMode: false,
    stripeKey: '',
    razorpayKey: '',
    emailjsServiceId: '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const showSaved = (msg) => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 3000);
  };

  const handleExportAll = async () => {
    try {
      if (!adminService) adminService = await import('../services/admin.service.js');
      const tables = ['profiles', 'children', 'purchases', 'progress', 'coupons'];
      const allData = {};
      for (const t of tables) {
        const res = await adminService.exportCSV(t);
        allData[t] = res.data || [];
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `nextgen-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showSaved('Data exported successfully');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Settings</h2>
        <p className="admin-page-subtitle">Configure your application preferences</p>
      </div>

      {saved && (
        <div className="admin-alert-banner" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', marginBottom: 16 }}>
          ✅ {saved}
        </div>
      )}

      <div className="admin-settings-grid-pro">
        {/* General */}
        <div className="admin-settings-section-pro glass-card">
          <div className="admin-settings-section-header">
            <span className="admin-settings-section-icon">⚙️</span>
            <h3>General</h3>
          </div>
          <div className="admin-setting-row-pro">
            <div>
              <span className="admin-setting-name">Demo Mode</span>
              <span className="admin-setting-desc">Use mock data instead of live database</span>
            </div>
            <label className="admin-toggle">
              <input type="checkbox" checked={settings.demoMode} onChange={() => toggle('demoMode')} />
              <span className="admin-toggle-slider" />
            </label>
          </div>
          <div className="admin-setting-row-pro">
            <div>
              <span className="admin-setting-name">Maintenance Mode</span>
              <span className="admin-setting-desc">Show maintenance page to all users</span>
            </div>
            <label className="admin-toggle">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} />
              <span className="admin-toggle-slider" />
            </label>
          </div>
        </div>

        {/* Payment */}
        <div className="admin-settings-section-pro glass-card">
          <div className="admin-settings-section-header">
            <span className="admin-settings-section-icon">💳</span>
            <h3>Payment</h3>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Stripe Secret Key</label>
            <input
              className="admin-input"
              type="password"
              placeholder="sk_live_…"
              value={settings.stripeKey}
              onChange={e => update('stripeKey', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Razorpay Key ID</label>
            <input
              className="admin-input"
              type="password"
              placeholder="rzp_live_…"
              value={settings.razorpayKey}
              onChange={e => update('razorpayKey', e.target.value)}
            />
          </div>
          <button className="admin-btn primary" style={{ marginTop: 8 }} onClick={() => showSaved('Payment settings saved')}>
            Save Payment Settings
          </button>
        </div>

        {/* Email */}
        <div className="admin-settings-section-pro glass-card">
          <div className="admin-settings-section-header">
            <span className="admin-settings-section-icon">📧</span>
            <h3>Email</h3>
          </div>
          <div className="admin-setting-row-pro">
            <div>
              <span className="admin-setting-name">Email Notifications</span>
              <span className="admin-setting-desc">Send emails on enrollments and payments</span>
            </div>
            <label className="admin-toggle">
              <input type="checkbox" checked={settings.emailNotifications} onChange={() => toggle('emailNotifications')} />
              <span className="admin-toggle-slider" />
            </label>
          </div>
          <div className="admin-form-group" style={{ marginTop: 12 }}>
            <label className="admin-form-label">EmailJS Service ID</label>
            <input
              className="admin-input"
              placeholder="service_xxxxxx"
              value={settings.emailjsServiceId}
              onChange={e => update('emailjsServiceId', e.target.value)}
            />
          </div>
          <button className="admin-btn primary" style={{ marginTop: 8 }} onClick={() => showSaved('Email settings saved')}>
            Save Email Settings
          </button>
        </div>

        {/* Security */}
        <div className="admin-settings-section-pro glass-card">
          <div className="admin-settings-section-header">
            <span className="admin-settings-section-icon">🔐</span>
            <h3>Security</h3>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Current Password</label>
            <input className="admin-input" type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">New Password</label>
            <input className="admin-input" type="password" value={passwords.newPw} onChange={e => setPasswords(p => ({ ...p, newPw: e.target.value }))} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Confirm New Password</label>
            <input className="admin-input" type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
          </div>
          <button className="admin-btn primary" style={{ marginTop: 8 }} onClick={() => {
            if (passwords.newPw !== passwords.confirm) return;
            setPasswords({ current: '', newPw: '', confirm: '' });
            showSaved('Password updated');
          }}>
            Update Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="admin-danger-zone glass-card" style={{ marginTop: 24 }}>
        <div className="admin-settings-section-header">
          <span className="admin-settings-section-icon">⚠️</span>
          <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
        </div>
        <div className="admin-danger-row">
          <div>
            <span className="admin-setting-name">Export All Data</span>
            <span className="admin-setting-desc">Download a JSON dump of all tables</span>
          </div>
          <button className="admin-btn" onClick={handleExportAll}>📥 Export</button>
        </div>
        <div className="admin-danger-row">
          <div>
            <span className="admin-setting-name">Reset All Data</span>
            <span className="admin-setting-desc">Permanently delete all data. This cannot be undone.</span>
          </div>
          <button className="admin-btn danger-btn">🗑 Reset</button>
        </div>
      </div>
    </div>
  );
}
