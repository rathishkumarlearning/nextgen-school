import React, { useState, useEffect, useCallback } from 'react';
import DataGrid, { StatusBadge, ActionButton } from '../components/DataGrid.jsx';

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

export default function PaymentsTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ completed: 0, pending: 0, failed: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!adminService) adminService = await import('../services/admin.service.js');
      const res = await adminService.getPayments({ page, pageSize, status: statusFilter });
      const rows = (res.data || []).map(p => ({
        id: p.id,
        txId: p.id?.slice(0, 8) || '—',
        user: p.profiles?.name || p.profiles?.email || '—',
        course: p.course_id || 'N/A',
        amount: Number(p.amount) || 0,
        method: p.method || 'stripe',
        status: p.status || 'pending',
        coupon: p.coupon_code || '—',
        date: p.created_at?.slice(0, 10) || '—',
      }));
      setData(rows);
      setTotal(res.count || 0);

      // Calculate totals for visible data
      const comp = rows.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0);
      const pend = rows.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
      const fail = rows.filter(r => r.status === 'failed').reduce((s, r) => s + r.amount, 0);
      setTotals({ completed: comp, pending: pend, failed: fail });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'txId', label: 'ID', width: '100px', render: v => <span className="dg-mono-text" style={{ color: '#8b5cf6' }}>#{v}</span> },
    { key: 'user', label: 'User', sortable: true },
    { key: 'course', label: 'Course', width: '140px' },
    { key: 'amount', label: 'Amount', width: '120px', sortable: true, render: (v) => (
      <span className="dg-mono-text" style={{ color: '#10b981', fontWeight: 600 }}>${v.toFixed(2)}</span>
    )},
    { key: 'method', label: 'Method', width: '100px', render: v => (
      <span className="dg-method-pill">{v === 'stripe' ? '💳' : '🏦'} {v}</span>
    )},
    { key: 'status', label: 'Status', width: '120px', render: v => <StatusBadge status={v} /> },
    { key: 'coupon', label: 'Coupon', width: '120px', render: v => v !== '—' ? <span className="admin-coupon-code">{v}</span> : '—' },
    { key: 'date', label: 'Date', width: '110px', sortable: true, render: v => <span className="dg-mono-text">{v}</span> },
  ];

  const statusFilters = {
    key: 'status',
    value: statusFilter,
    onChange: (v) => { setStatusFilter(v); setPage(1); },
    options: [
      { value: '', label: 'All' },
      { value: 'completed', label: 'Completed' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' },
    ],
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Payments</h2>
        <p className="admin-page-subtitle">Track all payment transactions</p>
      </div>

      {/* Summary cards */}
      <div className="admin-mini-stats">
        <div className="admin-mini-stat glass-card" style={{ '--stat-color': '#10b981' }}>
          <span className="admin-mini-stat-label">Completed</span>
          <span className="admin-mini-stat-value dg-mono-text" style={{ color: '#10b981' }}>${totals.completed.toFixed(2)}</span>
        </div>
        <div className="admin-mini-stat glass-card" style={{ '--stat-color': '#f59e0b' }}>
          <span className="admin-mini-stat-label">Pending</span>
          <span className="admin-mini-stat-value dg-mono-text" style={{ color: '#f59e0b' }}>${totals.pending.toFixed(2)}</span>
        </div>
        <div className="admin-mini-stat glass-card" style={{ '--stat-color': '#ef4444' }}>
          <span className="admin-mini-stat-label">Failed</span>
          <span className="admin-mini-stat-value dg-mono-text" style={{ color: '#ef4444' }}>${totals.failed.toFixed(2)}</span>
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        loading={loading}
        emptyMessage="No payments found"
        emptyIcon="💳"
        filters={[statusFilters]}
        totalsRow={{
          txId: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>TOTAL</strong>,
          amount: <strong className="dg-mono-text" style={{ color: '#10b981' }}>${data.reduce((s, r) => s + r.amount, 0).toFixed(2)}</strong>,
        }}
      />
    </div>
  );
}
