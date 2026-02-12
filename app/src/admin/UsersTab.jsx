import React, { useState, useEffect, useCallback } from 'react';
import DataGrid, { StatusBadge, ActionButton } from '../components/DataGrid';

let adminService;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => { adminService = null; });

export default function UsersTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'parent' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!adminService) throw new Error('not ready');
      const { data: d, count } = await adminService.getEnrollments({ page, pageSize, search });
      setData((d || []).map(u => ({ ...u, status: u.deactivated_at ? 'deactivated' : 'active', role: u.role || 'parent' })));
      setTotal(count || 0);
    } catch { setData([]); setTotal(0); }
    setLoading(false);
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter ? data.filter(u => u.status === statusFilter) : data;

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', render: v => <span className={`dg-role-badge ${v}`}>{v}</span> },
    { key: 'children', label: 'Children', render: (_, r) => (r.children || []).length },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Users</h2>

      <DataGrid
        columns={columns}
        data={filtered}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        searchValue={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search users..."
        loading={loading}
        emptyMessage="No users found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={row => setDetailUser(row)}
        filters={[{
          key: 'status',
          label: 'Status',
          options: [
            { value: '', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'deactivated', label: 'Deactivated' },
          ],
          value: statusFilter,
          onChange: setStatusFilter,
        }]}
        bulkActions={[
          { label: 'Deactivate', icon: '🚫', onClick: ids => alert(`Deactivate ${ids.size} users`), variant: 'warning' },
          { label: 'Delete', icon: '🗑️', onClick: ids => alert(`Delete ${ids.size} users`), variant: 'danger' },
        ]}
        headerExtra={
          <button className="admin-btn primary" onClick={() => setShowCreate(true)}>+ Create User</button>
        }
        actions={row => (
          <>
            <ActionButton icon="👁️" title="View" onClick={() => setDetailUser(row)} />
            <ActionButton icon="✏️" title="Edit" onClick={() => {}} />
            <ActionButton icon="🗑️" title="Delete" onClick={() => {}} variant="danger" />
          </>
        )}
      />

      {/* User Detail Modal */}
      {detailUser && (
        <div className="admin-modal-overlay" onClick={() => setDetailUser(null)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', margin: 0 }}>{detailUser.name}</h3>
              <button className="admin-modal-close" onClick={() => setDetailUser(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p><strong>Email:</strong> {detailUser.email}</p>
              <p><strong>Role:</strong> {detailUser.role}</p>
              <p><strong>Status:</strong> <StatusBadge status={detailUser.status} /></p>
              <p><strong>Joined:</strong> {detailUser.created_at ? new Date(detailUser.created_at).toLocaleDateString() : '—'}</p>
              <h4>Children</h4>
              {(detailUser.children || []).length === 0 ? <p style={{ opacity: 0.5 }}>No children</p> :
                (detailUser.children || []).map(c => (
                  <div key={c.id} className="admin-child-card glass-card" style={{ padding: 12, marginBottom: 8 }}>
                    <strong>{c.name}</strong> — Age {c.age}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && (
        <div className="admin-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', margin: 0 }}>Create User</h3>
              <button className="admin-modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              {['name', 'email', 'password'].map(f => (
                <div key={f} className="admin-grant-field">
                  <label style={{ textTransform: 'capitalize' }}>{f}</label>
                  <input
                    type={f === 'password' ? 'password' : 'text'}
                    value={createForm[f]}
                    onChange={e => setCreateForm(p => ({ ...p, [f]: e.target.value }))}
                    className="admin-input"
                  />
                </div>
              ))}
              <div className="admin-grant-field">
                <label>Role</label>
                <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))} className="admin-input">
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="admin-btn primary" style={{ marginTop: 16 }} onClick={() => { alert('Create user: ' + JSON.stringify(createForm)); setShowCreate(false); }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
