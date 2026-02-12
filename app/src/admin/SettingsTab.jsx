import React, { useState, useEffect } from 'react';

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    demoMode: true,
    pricing: { singleCourse: 19, fullAccess: 39, familyPlan: 59 },
    stripeKey: '',
    razorpayKey: '',
  });
  const [adminPass, setAdminPass] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('checking');

  useEffect(() => {
    // Load settings from localStorage fallback
    try {
      const s = JSON.parse(localStorage.getItem('ngs_db_settings') || 'null');
      if (s) setSettings(prev => ({ ...prev, ...s }));
    } catch {}
    // Check supabase
    import('../utils/supabase').then(m => {
      const sb = m.default;
      if (sb) {
        sb.from('profiles').select('id', { count: 'exact', head: true })
          .then(({ error }) => setSupabaseStatus(error ? 'error' : 'connected'))
          .catch(() => setSupabaseStatus('error'));
      } else setSupabaseStatus('error');
    }).catch(() => setSupabaseStatus('error'));
  }, []);

  function updateField(path, value) {
    setSettings(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem('ngs_db_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  const statusColors = { connected: '#10b981', error: '#ef4444', checking: '#f59e0b' };

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Settings</h2>

      <div className="admin-settings-grid">
        {/* Demo Mode */}
        <div className="glass-card admin-settings-section">
          <h3 className="admin-chart-title">General</h3>
          <div className="admin-setting-row">
            <div>
              <strong>Demo Mode</strong>
              <p style={{ opacity: 0.5, fontSize: 13, margin: '4px 0 0' }}>Use mock data instead of real database</p>
            </div>
            <label className="admin-toggle">
              <input type="checkbox" checked={settings.demoMode} onChange={e => updateField('demoMode', e.target.checked)} />
              <span className="admin-toggle-slider" />
            </label>
          </div>
          <div className="admin-setting-row">
            <div>
              <strong>Supabase Connection</strong>
              <p style={{ opacity: 0.5, fontSize: 13, margin: '4px 0 0' }}>Database status</p>
            </div>
            <span className="admin-status-dot" style={{ '--dot-color': statusColors[supabaseStatus] }}>
              {supabaseStatus}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="glass-card admin-settings-section">
          <h3 className="admin-chart-title">Pricing</h3>
          {[
            { key: 'pricing.singleCourse', label: 'Single Course ($)' },
            { key: 'pricing.fullAccess', label: 'Full Access ($)' },
            { key: 'pricing.familyPlan', label: 'Family Plan ($)' },
          ].map(p => (
            <div key={p.key} className="admin-grant-field">
              <label>{p.label}</label>
              <input
                type="number"
                value={p.key.split('.').reduce((o, k) => o?.[k], settings) || 0}
                onChange={e => updateField(p.key, Number(e.target.value))}
                className="admin-input"
              />
            </div>
          ))}
        </div>

        {/* Payment Keys */}
        <div className="glass-card admin-settings-section">
          <h3 className="admin-chart-title">Payment Gateways</h3>
          <div className="admin-grant-field">
            <label>Stripe Key</label>
            <input type="password" value={settings.stripeKey} onChange={e => updateField('stripeKey', e.target.value)} className="admin-input" placeholder="sk_..." />
          </div>
          <div className="admin-grant-field">
            <label>Razorpay Key</label>
            <input type="password" value={settings.razorpayKey} onChange={e => updateField('razorpayKey', e.target.value)} className="admin-input" placeholder="rzp_..." />
          </div>
        </div>

        {/* Admin Password */}
        <div className="glass-card admin-settings-section">
          <h3 className="admin-chart-title">Admin Password</h3>
          {['current', 'new', 'confirm'].map(f => (
            <div key={f} className="admin-grant-field">
              <label style={{ textTransform: 'capitalize' }}>{f} Password</label>
              <input type="password" value={adminPass[f]} onChange={e => setAdminPass(p => ({ ...p, [f]: e.target.value }))} className="admin-input" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="admin-btn primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Saved!</span>}
      </div>
    </div>
  );
}
