import React, { useState, useEffect, useCallback } from 'react';
import DataGrid, { StatusBadge, ActionButton, Modal } from '../components/DataGrid.jsx';

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

export default function UsersTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailRow, setDetailRow] = useState(null);
  const [createModal, setCreateModal] = useState(false);
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
        role: 'parent',
        childrenCount: u.children?.length || 0,
        children: u.children || [],
        purchases: 0,
        status: 'active',
        joined: u.created_at?.slice(0, 10) || '—',
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

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v, row) => (
      <div className="dg-cell-primary">
        <span className="dg-avatar" style={{ background: row.role === 'admin' ? '#8b5cf6' : '#3b82f6' }}>
          {(v || '?')[0].toUpperCase()}
        </span>
        <div>
          <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
        </div>
      </div>
    )},
    { key: 'email', label: 'Email', sortable: true, render: v => <span className="dg-mono-text">{v}</span> },
    { key: 'role', label: 'Role', width: '100px', render: v => <StatusBadge status={v} /> },
    { key: 'childrenCount', label: 'Children', width: '90px', render: v => <span className="dg-number">{v}</span> },
    { key: 'status', label: 'Status', width: '100px', render: v => <StatusBadge status={v} /> },
    { key: 'joined', label: 'Joined', width: '110px', sortable: true, render: v => <span className="dg-mono-text">{v}</span> },
  ];

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="admin-page-title">Users</h2>
          <p className="admin-page-subtitle">Manage all registered users</p>
        </div>
        <button className="admin-btn primary" onClick={() => setCreateModal(true)}>+ Create User</button>
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
        searchPlaceholder="Search users…"
        loading={loading}
        onRowClick={setDetailRow}
        emptyMessage="No users found"
        emptyIcon="👥"
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <ActionButton icon="👁" title="View" onClick={() => setDetailRow(row)} />
            <ActionButton icon="✏️" title="Edit" onClick={() => {}} />
            <ActionButton icon="🗑" title="Delete" variant="danger" onClick={() => {}} />
          </div>
        )}
      />

      {/* Detail Modal */}
      <Modal open={!!detailRow} onClose={() => setDetailRow(null)} title="User Details" width="560px">
        {detailRow && (
          <div className="admin-detail-content">
            <div className="admin-detail-header-card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, marginBottom: 16 }}>
              <div className="dg-avatar-lg" style={{ background: '#8b5cf6' }}>{(detailRow.name || '?')[0].toUpperCase()}</div>
              <div>
                <h3 style={{ color: '#fff', margin: 0, fontSize: 18 }}>{detailRow.name}</h3>
                <p className="dg-mono-text" style={{ margin: '4px 0 0', opacity: 0.6 }}>{detailRow.email}</p>
              </div>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Role</span>
              <StatusBadge status={detailRow.role} />
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Status</span>
              <StatusBadge status={detailRow.status} />
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Joined</span>
              <span className="admin-detail-value dg-mono-text">{detailRow.joined}</span>
            </div>
            {detailRow.children?.length > 0 && (
              <>
                <h4 style={{ color: '#fff', marginTop: 20, marginBottom: 8, fontSize: 14 }}>Children ({detailRow.children.length})</h4>
                {detailRow.children.map(c => (
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

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create User">
        <div className="admin-form-group">
          <label className="admin-form-label">Name</label>
          <input className="admin-input" placeholder="Full name" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Email</label>
          <input className="admin-input" type="email" placeholder="email@example.com" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Role</label>
          <select className="admin-input">
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="admin-btn primary">Create</button>
          <button className="admin-btn" onClick={() => setCreateModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
