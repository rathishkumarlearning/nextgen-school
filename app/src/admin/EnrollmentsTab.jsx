import React, { useState, useEffect, useCallback } from 'react';
import DataGrid from '../components/DataGrid';

let adminService;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => { adminService = null; });

const columns = [
  { key: 'name', label: 'Parent Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'children', label: 'Children',
    render: (_, row) => (row.children || []).map(c => `${c.name} (${c.age})`).join(', ') || '—',
  },
  {
    key: 'created_at', label: 'Joined', sortable: true,
    render: v => v ? new Date(v).toLocaleDateString() : '—',
  },
];

export default function EnrollmentsTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!adminService) throw new Error('not ready');
      const { data: d, count } = await adminService.getEnrollments({ page, pageSize, search });
      setData(d || []);
      setTotal(count || 0);
    } catch { setData([]); setTotal(0); }
    setLoading(false);
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Enrollments</h2>
      <DataGrid
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        searchValue={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email..."
        loading={loading}
        emptyMessage="No enrollments yet"
      />
    </div>
  );
}
