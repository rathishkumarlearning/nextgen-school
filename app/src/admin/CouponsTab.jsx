import React, { useState, useEffect, useCallback } from 'react';
import DataGrid, { StatusBadge, ActionButton } from '../components/DataGrid';

let couponService = null;
import('../services/coupon.service.js')
  .then(mod => { couponService = mod.default || mod; })
  .catch(() => { couponService = null; });

function generateCode(prefix = '') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return prefix ? `${prefix}-${code}` : code;
}

export default function CouponsTab() {
  const [stats, setStats] = useState({ active: 0, redeemed: 0, revenueImpact: 0 });
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Generate form
  const [mode, setMode] = useState('single'); // single | bulk
  const [genForm, setGenForm] = useState({ code: '', course: '', type: 'percentage', value: 10, maxUses: 100, expiry: '', prefix: '', count: 10 });
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!couponService) throw new Error('not ready');
      const [s, c] = await Promise.all([
        couponService.getCouponStats?.() || { data: null },
        couponService.getCoupons?.({ page, pageSize, search, status: statusFilter }) || { data: null, count: 0 },
      ]);
      if (s.data) setStats(s.data);
      if (c.data) setCoupons(c.data);
      setTotal(c.count || 0);
    } catch {}
    setLoading(false);
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      if (mode === 'single') {
        const code = genForm.code || generateCode();
        if (couponService?.createCoupon) {
          await couponService.createCoupon({ ...genForm, code });
        }
        setGeneratedCodes([code]);
      } else {
        const codes = Array.from({ length: genForm.count }, () => generateCode(genForm.prefix));
        if (couponService?.createBulkCoupons) {
          await couponService.createBulkCoupons(codes.map(code => ({ ...genForm, code })));
        }
        setGeneratedCodes(codes);
      }
      load();
    } catch {}
    setGenerating(false);
  }

  function copyAll() {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
  }

  async function handleDeactivate(id) {
    try { await couponService?.deactivateCoupon?.(id); load(); } catch {}
  }

  const statCards = [
    { label: 'Active Coupons', value: stats.active, icon: '🎫', color: '#10b981' },
    { label: 'Total Redeemed', value: stats.redeemed, icon: '✅', color: '#8b5cf6' },
    { label: 'Revenue Impact', value: `$${stats.revenueImpact || 0}`, icon: '💸', color: '#ec4899' },
  ];

  const columns = [
    {
      key: 'code', label: 'Code',
      render: v => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <code className="admin-coupon-code">{v}</code>
          <button className="dg-action-btn" title="Copy" onClick={() => navigator.clipboard.writeText(v)} style={{ fontSize: 12 }}>📋</button>
        </span>
      ),
    },
    { key: 'course_id', label: 'Course', render: v => v ? <span className="dg-role-badge">{v}</span> : <span style={{ opacity: 0.5 }}>All</span> },
    { key: 'type', label: 'Type' },
    { key: 'value', label: 'Value', render: (v, r) => r.type === 'percentage' ? `${v}%` : `$${v}` },
    {
      key: 'uses', label: 'Uses',
      render: (_, r) => {
        const used = r.used_count || 0;
        const max = r.max_uses || 0;
        const pct = max > 0 ? (used / max) * 100 : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{used}/{max}</span>
            <div className="admin-course-progress-bar" style={{ flex: 1, height: 6 }}>
              <div className="admin-course-progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#ef4444' : '#8b5cf6' }} />
            </div>
          </div>
        );
      },
    },
    { key: 'expires_at', label: 'Expires', render: v => v ? new Date(v).toLocaleDateString() : 'Never' },
    {
      key: 'status', label: 'Status',
      render: (_, r) => {
        const s = r.active === false ? 'Depleted' : (r.expires_at && new Date(r.expires_at) < new Date()) ? 'Expired' : 'Active';
        return <StatusBadge status={s} />;
      },
    },
  ];

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Coupon Management</h2>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card glass-card">
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Generate Section */}
      <div className="glass-card" style={{ padding: 24, marginTop: 24 }}>
        <h3 className="admin-chart-title">Generate Coupons</h3>
        <div className="admin-mode-toggle">
          <button className={`dg-filter-pill ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>Single</button>
          <button className={`dg-filter-pill ${mode === 'bulk' ? 'active' : ''}`} onClick={() => setMode('bulk')}>Bulk Generate</button>
        </div>
        <div className="admin-grant-form" style={{ marginTop: 16 }}>
          {mode === 'single' ? (
            <div className="admin-grant-field">
              <label>Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={genForm.code} onChange={e => setGenForm(p => ({ ...p, code: e.target.value }))} placeholder="Auto-generate if empty" className="admin-input" style={{ flex: 1 }} />
                <button className="admin-btn" onClick={() => setGenForm(p => ({ ...p, code: generateCode() }))}>🎲</button>
              </div>
            </div>
          ) : (
            <>
              <div className="admin-grant-field">
                <label>Prefix</label>
                <input type="text" value={genForm.prefix} onChange={e => setGenForm(p => ({ ...p, prefix: e.target.value }))} placeholder="e.g. LAUNCH" className="admin-input" />
              </div>
              <div className="admin-grant-field">
                <label>Count</label>
                <input type="number" value={genForm.count} onChange={e => setGenForm(p => ({ ...p, count: Number(e.target.value) }))} className="admin-input" min={1} max={500} />
              </div>
            </>
          )}
          <div className="admin-grant-field">
            <label>Type</label>
            <select value={genForm.type} onChange={e => setGenForm(p => ({ ...p, type: e.target.value }))} className="admin-input">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div className="admin-grant-field">
            <label>Value</label>
            <input type="number" value={genForm.value} onChange={e => setGenForm(p => ({ ...p, value: Number(e.target.value) }))} className="admin-input" />
          </div>
          <div className="admin-grant-field">
            <label>Max Uses</label>
            <input type="number" value={genForm.maxUses} onChange={e => setGenForm(p => ({ ...p, maxUses: Number(e.target.value) }))} className="admin-input" />
          </div>
          <div className="admin-grant-field">
            <label>Expiry Date</label>
            <input type="date" value={genForm.expiry} onChange={e => setGenForm(p => ({ ...p, expiry: e.target.value }))} className="admin-input" />
          </div>
          <button className="admin-btn primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : mode === 'single' ? 'Create Coupon' : `Generate ${genForm.count} Coupons`}
          </button>
        </div>

        {generatedCodes.length > 0 && (
          <div className="admin-generated-codes" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Generated {generatedCodes.length} code{generatedCodes.length > 1 ? 's' : ''}</span>
              <button className="admin-btn" onClick={copyAll}>📋 Copy All</button>
            </div>
            <div className="admin-codes-list">
              {generatedCodes.map(c => <code key={c} className="admin-coupon-code">{c}</code>)}
            </div>
          </div>
        )}
      </div>

      {/* Coupon List */}
      <div style={{ marginTop: 24 }}>
        <DataGrid
          columns={columns}
          data={coupons}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          searchValue={search}
          onSearch={v => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search by code..."
          loading={loading}
          emptyMessage="No coupons yet"
          filters={[{
            key: 'status',
            label: 'Status',
            options: [
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'expired', label: 'Expired' },
              { value: 'depleted', label: 'Depleted' },
            ],
            value: statusFilter,
            onChange: v => { setStatusFilter(v); setPage(1); },
          }]}
          actions={row => (
            <>
              <ActionButton icon="🚫" title="Deactivate" onClick={() => handleDeactivate(row.id)} variant="danger" />
              <ActionButton icon="📋" title="Copy code" onClick={() => navigator.clipboard.writeText(row.code)} />
            </>
          )}
        />
      </div>
    </div>
  );
}
