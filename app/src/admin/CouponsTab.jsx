import React, { useState, useEffect, useCallback } from 'react';
import DataGrid, { StatusBadge, ActionButton, AnimatedNumber } from '../components/DataGrid.jsx';

let couponService = null;
import('../services/coupon.service.js').then(m => { couponService = m; }).catch(() => {});

export default function CouponsTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, totalRedeemed: 0, revenueImpact: 0 });
  const [genMode, setGenMode] = useState('single');
  const [genLoading, setGenLoading] = useState(false);
  const [genSuccess, setGenSuccess] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Single form
  const [single, setSingle] = useState({ code: '', type: 'percentage', value: '', courseId: '', maxUses: 1, expiresAt: '' });
  // Bulk form
  const [bulk, setBulk] = useState({ prefix: '', count: 10, type: 'percentage', value: '', courseId: '', maxUses: 1, expiresAt: '' });
  const [bulkCodes, setBulkCodes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!couponService) couponService = await import('../services/coupon.service.js');
      const [cRes, sRes] = await Promise.all([
        couponService.getCoupons({ page, pageSize, search, status: statusFilter }),
        couponService.getCouponStats(),
      ]);
      const now = new Date();
      setData((cRes.data || []).map(c => {
        const expired = c.expires_at && new Date(c.expires_at) < now;
        const depleted = c.current_uses >= c.max_uses;
        const status = !c.active ? 'inactive' : expired ? 'expired' : depleted ? 'depleted' : 'active';
        return {
          id: c.id,
          code: c.code,
          course: c.course_id || 'Global',
          type: c.type,
          value: c.value,
          uses: `${c.current_uses || 0}/${c.max_uses}`,
          currentUses: c.current_uses || 0,
          maxUses: c.max_uses,
          expires: c.expires_at?.slice(0, 10) || 'Never',
          status,
          active: c.active,
          raw: c,
        };
      }));
      setTotal(cRes.count || 0);
      if (sRes.data) setStats(sRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => { setSearch(val); setPage(1); }, 400);
    setSearchTimeout(t);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setSingle(s => ({ ...s, code }));
  };

  const createSingle = async () => {
    if (!single.code || !single.value) return;
    setGenLoading(true);
    try {
      await couponService.createCoupon({
        code: single.code,
        type: single.type,
        value: Number(single.value),
        courseId: single.courseId || null,
        maxUses: Number(single.maxUses) || 1,
        expiresAt: single.expiresAt || null,
      });
      setSingle({ code: '', type: 'percentage', value: '', courseId: '', maxUses: 1, expiresAt: '' });
      setGenSuccess('Coupon created!');
      setTimeout(() => setGenSuccess(''), 3000);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setGenLoading(false);
    }
  };

  const createBulk = async () => {
    if (!bulk.prefix || !bulk.value) return;
    setGenLoading(true);
    try {
      const res = await couponService.generateBulkCoupons({
        prefix: bulk.prefix,
        count: Number(bulk.count) || 10,
        type: bulk.type,
        value: Number(bulk.value),
        courseId: bulk.courseId || null,
        maxUses: Number(bulk.maxUses) || 1,
        expiresAt: bulk.expiresAt || null,
      });
      setBulkCodes((res.data || []).map(c => c.code));
      setGenSuccess(`${res.data?.length || 0} coupons created!`);
      setTimeout(() => setGenSuccess(''), 5000);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setGenLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
  };

  const toggleActive = async (row) => {
    try {
      await couponService.deactivateCoupon(row.id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { key: 'code', label: 'Code', sortable: true, render: v => (
      <span className="admin-coupon-code" style={{ cursor: 'pointer' }} onClick={() => copyCode(v)} title="Click to copy">{v}</span>
    )},
    { key: 'course', label: 'Course', width: '120px', render: v => v === 'Global' ? <span style={{ color: '#8b5cf6' }}>🌐 Global</span> : v?.slice(0, 8) },
    { key: 'type', label: 'Type', width: '80px', render: v => v === 'percentage' ? '%' : '$' },
    { key: 'value', label: 'Value', width: '80px', render: (v, row) => (
      <span className="dg-mono-text" style={{ color: '#10b981', fontWeight: 600 }}>{row.type === 'percentage' ? `${v}%` : `$${v}`}</span>
    )},
    { key: 'uses', label: 'Uses', width: '100px', render: (v, row) => (
      <div>
        <span className="dg-mono-text">{v}</span>
        <div className="admin-progress-bar-mini" style={{ marginTop: 4 }}>
          <div className="admin-progress-fill-mini" style={{ width: `${row.maxUses > 0 ? (row.currentUses / row.maxUses) * 100 : 0}%` }} />
        </div>
      </div>
    )},
    { key: 'expires', label: 'Expires', width: '110px', render: v => <span className="dg-mono-text">{v}</span> },
    { key: 'status', label: 'Status', width: '110px', render: v => <StatusBadge status={v} /> },
  ];

  const statusFilterConfig = {
    key: 'status',
    value: statusFilter,
    onChange: (v) => { setStatusFilter(v); setPage(1); },
    options: [
      { value: '', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'expired', label: 'Expired' },
      { value: 'depleted', label: 'Depleted' },
    ],
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Coupons</h2>
        <p className="admin-page-subtitle">Generate, manage, and track discount codes</p>
      </div>

      {/* Stats */}
      <div className="admin-mini-stats" style={{ marginBottom: 24 }}>
        <div className="admin-mini-stat glass-card" style={{ '--stat-color': '#10b981' }}>
          <span className="admin-mini-stat-label">Active Coupons</span>
          <span className="admin-mini-stat-value dg-mono-text" style={{ color: '#10b981' }}><AnimatedNumber value={stats.active} /></span>
        </div>
        <div className="admin-mini-stat glass-card" style={{ '--stat-color': '#8b5cf6' }}>
          <span className="admin-mini-stat-label">Total Redeemed</span>
          <span className="admin-mini-stat-value dg-mono-text" style={{ color: '#8b5cf6' }}><AnimatedNumber value={stats.totalRedeemed} /></span>
        </div>
        <div className="admin-mini-stat glass-card" style={{ '--stat-color': '#ec4899' }}>
          <span className="admin-mini-stat-label">Revenue Impact</span>
          <span className="admin-mini-stat-value dg-mono-text" style={{ color: '#ec4899' }}><AnimatedNumber value={stats.revenueImpact} prefix="$" /></span>
        </div>
      </div>

      {/* Generate Section */}
      <div className="admin-generate-section glass-card" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Generate Coupons</h3>
          <div className="admin-range-selector">
            <button className={`admin-range-btn ${genMode === 'single' ? 'active' : ''}`} onClick={() => setGenMode('single')}>Single</button>
            <button className={`admin-range-btn ${genMode === 'bulk' ? 'active' : ''}`} onClick={() => setGenMode('bulk')}>Bulk</button>
          </div>
        </div>

        {genSuccess && <div className="admin-alert-banner" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', marginBottom: 16 }}>✅ {genSuccess}</div>}

        {genMode === 'single' ? (
          <div className="admin-form-row">
            <div className="admin-form-group" style={{ flex: 2 }}>
              <label className="admin-form-label">Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="admin-input" value={single.code} onChange={e => setSingle(s => ({ ...s, code: e.target.value.toUpperCase() }))} placeholder="SUMMER2026" />
                <button className="admin-btn" onClick={generateCode} title="Auto-generate">🎲</button>
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Type</label>
              <select className="admin-input" value={single.type} onChange={e => setSingle(s => ({ ...s, type: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Value</label>
              <input className="admin-input" type="number" value={single.value} onChange={e => setSingle(s => ({ ...s, value: e.target.value }))} placeholder={single.type === 'percentage' ? '20' : '5.00'} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Max Uses</label>
              <input className="admin-input" type="number" value={single.maxUses} onChange={e => setSingle(s => ({ ...s, maxUses: e.target.value }))} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Expires</label>
              <input className="admin-input" type="date" value={single.expiresAt} onChange={e => setSingle(s => ({ ...s, expiresAt: e.target.value }))} />
            </div>
            <div className="admin-form-group" style={{ alignSelf: 'flex-end' }}>
              <button className="admin-btn primary" onClick={createSingle} disabled={genLoading}>
                {genLoading ? '…' : 'Create'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Prefix</label>
                <input className="admin-input" value={bulk.prefix} onChange={e => setBulk(s => ({ ...s, prefix: e.target.value.toUpperCase() }))} placeholder="SUMMER" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Count</label>
                <input className="admin-input" type="number" value={bulk.count} onChange={e => setBulk(s => ({ ...s, count: e.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Type</label>
                <select className="admin-input" value={bulk.type} onChange={e => setBulk(s => ({ ...s, type: e.target.value }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Value</label>
                <input className="admin-input" type="number" value={bulk.value} onChange={e => setBulk(s => ({ ...s, value: e.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Expires</label>
                <input className="admin-input" type="date" value={bulk.expiresAt} onChange={e => setBulk(s => ({ ...s, expiresAt: e.target.value }))} />
              </div>
              <div className="admin-form-group" style={{ alignSelf: 'flex-end' }}>
                <button className="admin-btn primary" onClick={createBulk} disabled={genLoading}>
                  {genLoading ? '…' : 'Generate'}
                </button>
              </div>
            </div>
            {bulkCodes.length > 0 && (
              <div className="admin-codes-list" style={{ marginTop: 12 }}>
                {bulkCodes.map(c => (
                  <span key={c} className="admin-coupon-code" style={{ cursor: 'pointer' }} onClick={() => copyCode(c)}>{c}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DataGrid */}
      <DataGrid
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        onSearch={handleSearch}
        searchPlaceholder="Search coupons…"
        loading={loading}
        emptyMessage="No coupons found"
        emptyIcon="🎟️"
        filters={[statusFilterConfig]}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <ActionButton icon="📋" title="Copy code" onClick={() => copyCode(row.code)} />
            {row.active && <ActionButton icon="⏸" title="Deactivate" variant="warning" onClick={() => toggleActive(row)} />}
          </div>
        )}
      />
    </div>
  );
}
