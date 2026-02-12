import React, { useState, useEffect, useCallback } from 'react';
import DataGrid, { StatusBadge, ActionButton, Modal } from '../components/DataGrid.jsx';

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

export default function EnrollmentsTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailRow, setDetailRow] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!adminService) adminService = await import('../services/admin.service.js');
      const res = await adminService.getEnrollments({ page, pageSize, search });
      setData((res.data || []).map(u => ({
        id: u.id,
        name: u.name || '—',
        email: u.email || '—',
        children: u.children?.length || 0,
        childrenList: u.children || [],
        plan: 'Standard',
        status: 'active',
        date: u.created_at?.slice(0, 10) || '—',
        raw: u,
      })));
      setTotal(res.count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => { setSearch(val); setPage(1); }, 400);
    setSearchTimeout(t);
  };

  const handleExport = () => {
    const rows = data.filter(r => selectedIds.has(r.id));
    if (!rows.length) return;
    const csv = 'Name,Email,Children,Status,Date\n' + rows.map(r =>
      `"${r.name}","${r.email}",${r.children},${r.status},${r.date}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `enrollments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v, row) => (
      <div className="dg-cell-primary">
        <span className="dg-avatar">{(row.name || '?')[0].toUpperCase()}</span>
        <span>{v}</span>
      </div>
    )},
    { key: 'email', label: 'Email', sortable: true, render: v => <span className="dg-mono-text">{v}</span> },
    { key: 'children', label: 'Children', width: '100px', sortable: true, render: v => <span className="dg-number">{v}</span> },
    { key: 'plan', label: 'Plan', width: '120px' },
    { key: 'status', label: 'Status', width: '120px', render: v => <StatusBadge status={v} /> },
    { key: 'date', label: 'Joined', width: '120px', sortable: true, render: v => <span className="dg-mono-text">{v}</span> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Enrollments</h2>
        <p className="admin-page-subtitle">Manage family enrollments and registrations</p>
      </div>

      <DataGrid
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        onSearch={handleSearch}
        searchPlaceholder="Search by name or email…"
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={setDetailRow}
        emptyMessage="No enrollments found"
        emptyIcon="👨‍👩‍👧"
        bulkActions={[
          { label: 'Export', icon: '📥', onClick: handleExport },
        ]}
      />

      <Modal open={!!detailRow} onClose={() => setDetailRow(null)} title="Family Details">
        {detailRow && (
          <div className="admin-detail-content">
            <div className="admin-detail-row">
              <span className="admin-detail-label">Name</span>
              <span className="admin-detail-value">{detailRow.name}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Email</span>
              <span className="admin-detail-value dg-mono-text">{detailRow.email}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Status</span>
              <StatusBadge status={detailRow.status} />
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Joined</span>
              <span className="admin-detail-value">{detailRow.date}</span>
            </div>
            {detailRow.childrenList?.length > 0 && (
              <>
                <h4 style={{ color: '#fff', marginTop: 16, marginBottom: 8, fontSize: 14 }}>Children</h4>
                {detailRow.childrenList.map(c => (
                  <div key={c.id} className="admin-child-pill">
                    <span>👧 {c.name}</span>
                    {c.age && <span className="admin-child-age">Age {c.age}</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
