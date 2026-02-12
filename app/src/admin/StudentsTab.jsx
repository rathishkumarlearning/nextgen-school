import React, { useState, useEffect } from 'react';
import DataGrid, { StatusBadge, Modal } from '../components/DataGrid.jsx';

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailStudent, setDetailStudent] = useState(null);
  const [courseFilter, setCourseFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      if (!adminService) adminService = await import('../services/admin.service.js');
      const res = await adminService.getStudentProgress();
      const data = (res.data || []).map(s => {
        const progressMap = {};
        (s.progress || []).forEach(p => {
          if (!progressMap[p.course_id]) progressMap[p.course_id] = [];
          progressMap[p.course_id].push(p);
        });
        const totalChapters = Object.values(progressMap).reduce((sum, arr) => sum + arr.length, 0);
        return {
          id: s.id,
          name: s.name || '—',
          age: s.age || '—',
          parent: s.profiles?.name || s.profiles?.email || '—',
          coursesProgress: progressMap,
          totalChapters,
          badges: totalChapters >= 10 ? '⭐' : totalChapters >= 5 ? '🌟' : '',
          lastActive: s.progress?.length > 0
            ? s.progress.sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))[0]?.completed_at?.slice(0, 10) || '—'
            : '—',
        };
      });
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.parent.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v, row) => (
      <div className="dg-cell-primary">
        <span className="dg-avatar" style={{ background: '#06b6d4' }}>{(v || '?')[0].toUpperCase()}</span>
        <span>{v}</span>
      </div>
    )},
    { key: 'age', label: 'Age', width: '70px', render: v => <span className="dg-number">{v}</span> },
    { key: 'parent', label: 'Parent', sortable: true },
    { key: 'totalChapters', label: 'Progress', width: '200px', render: (v, row) => (
      <div className="admin-progress-cell">
        <div className="admin-progress-bar-mini">
          <div className="admin-progress-fill-mini" style={{ width: `${Math.min(v * 5, 100)}%`, background: v >= 10 ? '#10b981' : v >= 5 ? '#f59e0b' : '#8b5cf6' }} />
        </div>
        <span className="dg-mono-text" style={{ fontSize: 11, minWidth: 40 }}>{v} ch.</span>
      </div>
    )},
    { key: 'badges', label: 'Badges', width: '80px', render: v => v || '—' },
    { key: 'lastActive', label: 'Last Active', width: '110px', sortable: true, render: v => <span className="dg-mono-text">{v}</span> },
  ];

  const handleSearch = (val) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => { setSearch(val); setPage(1); }, 400);
    setSearchTimeout(t);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Students</h2>
        <p className="admin-page-subtitle">Track student progress and achievements</p>
      </div>

      <DataGrid
        columns={columns}
        data={paginated}
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        onSearch={handleSearch}
        searchPlaceholder="Search students or parents…"
        loading={loading}
        onRowClick={setDetailStudent}
        emptyMessage="No students found"
        emptyIcon="🧒"
      />

      <Modal open={!!detailStudent} onClose={() => setDetailStudent(null)} title={`${detailStudent?.name || 'Student'} — Progress`} width="600px">
        {detailStudent && (
          <div className="admin-detail-content">
            <div className="admin-detail-row">
              <span className="admin-detail-label">Name</span>
              <span className="admin-detail-value">{detailStudent.name}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Age</span>
              <span className="admin-detail-value">{detailStudent.age}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Parent</span>
              <span className="admin-detail-value">{detailStudent.parent}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Total Chapters</span>
              <span className="admin-detail-value dg-mono-text">{detailStudent.totalChapters}</span>
            </div>

            <h4 style={{ color: '#fff', marginTop: 20, marginBottom: 12, fontSize: 14 }}>Course Progress</h4>
            {Object.entries(detailStudent.coursesProgress).length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No progress recorded yet</p>
            ) : (
              Object.entries(detailStudent.coursesProgress).map(([courseId, chapters]) => (
                <div key={courseId} className="admin-course-progress-detail glass-card" style={{ padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Course {courseId.slice(0, 8)}</span>
                    <span className="dg-mono-text" style={{ fontSize: 12, color: '#8b5cf6' }}>{chapters.length} chapters</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {chapters.sort((a, b) => a.chapter_index - b.chapter_index).map(ch => (
                      <span key={ch.chapter_index} className="admin-chapter-dot completed" title={`Chapter ${ch.chapter_index + 1}`}>
                        {ch.chapter_index + 1}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
