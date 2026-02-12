import React, { useState, useEffect, useCallback } from 'react';
import DataGrid, { StatusBadge, ActionButton } from '../components/DataGrid';

let adminService;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => { adminService = null; });

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'completed', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
];

const columns = [
  { key: 'id', label: 'ID', width: '80px', render: v => <span style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.6 }}>{String(v).slice(0, 8)}</span> },
  { key: 'parent', label: 'Parent', render: (_, row) => row.profiles?.name || '—' },
  { key: 'plan', label: 'Plan', render: (_, row) => row.plan || row.course_id || '—' },
  { key: 'amount', label: 'Amount', sortable: true, render: v => `$${Number(v || 0).toFixed(2)}` },
  {
    key: 'method', label: 'Method',
    render: (_, row) => {
      const m = row.payment_method || 'stripe';
      return <span className={`dg-method-badge ${m}`}>{m}</span>;
    },
  },
  { key: 'status', label: 'Status', render: v => <StatusBadge status={v || 'pending'} /> },
  { key: 'coupon_code', label: 'Coupon', render: v => v || '—' },
  { key: 'created_at', label: 'Date', sortable: true, render: v => v ? new Date(v).toLocaleDateString() : '—' },
];

export default function PaymentsTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [failedCount, setFailedCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!adminService) throw new Error('not ready');
      const { data: d, count } = await adminService.getPayments({ page, pageSize, status });
      setData(d || []);
      setTotal(count || 0);
      // Get failed count
      if (!status) {
        const fc = (d || []).filter(p => p.status === 'failed').length;
        setFailedCount(fc);
      }
    } catch { setData([]); setTotal(0); }
    setLoading(false);
  }, [page, pageSize, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Payments</h2>
      {failedCount > 0 && (
        <div className="admin-alert-banner danger">
          ⚠️ {failedCount} failed payment{failedCount > 1 ? 's' : ''} require attention
        </div>
      )}
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
        filters={[{
          key: 'status',
          label: 'Status',
          options: STATUS_OPTIONS,
          value: status,
          onChange: v => { setStatus(v); setPage(1); },
        }]}
        actions={row => (
          <>
            <ActionButton icon="👁️" title="View details" onClick={() => alert(JSON.stringify(row, null, 2))} />
            {row.status === 'completed' && <ActionButton icon="↩️" title="Refund" onClick={() => {}} variant="danger" />}
          </>
        )}
      />
    </div>
  );
}
