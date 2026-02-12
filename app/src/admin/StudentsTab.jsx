import React, { useState, useEffect, useMemo } from 'react';

let adminService;
try { adminService = await import('../services/admin.service.js'); } catch { adminService = null; }

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (!adminService) throw new Error('not ready');
        const { data } = await adminService.getStudentProgress();
        setStudents(data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const courses = useMemo(() => {
    const set = new Set();
    students.forEach(s => (s.progress || []).forEach(p => set.add(p.course_id)));
    return [...set];
  }, [students]);

  const filtered = useMemo(() => {
    let f = students;
    if (search) f = f.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()));
    if (courseFilter) f = f.filter(s => (s.progress || []).some(p => p.course_id === courseFilter));
    return f;
  }, [students, search, courseFilter]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Student Progress</h2>

      <div className="dg-header" style={{ marginBottom: 16 }}>
        <div className="dg-header-left">
          <div className="dg-search">
            <span className="dg-search-icon">🔍</span>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search students..." className="dg-search-input" />
          </div>
          <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(1); }} className="admin-input" style={{ width: 'auto', minWidth: 140 }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="dg-pagination-info">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="admin-students-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card admin-student-card">
              <div className="dg-skeleton" style={{ width: '60%', height: 18, marginBottom: 8 }} />
              <div className="dg-skeleton" style={{ width: '40%', height: 14 }} />
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="dg-empty-inner" style={{ padding: 60 }}>
          <span className="dg-empty-icon">📭</span>
          <p>No students found</p>
        </div>
      ) : (
        <div className="admin-students-grid">
          {paged.map(s => {
            const progress = s.progress || [];
            const courseGroups = {};
            progress.forEach(p => {
              if (!courseGroups[p.course_id]) courseGroups[p.course_id] = [];
              courseGroups[p.course_id].push(p.chapter_index);
            });
            return (
              <div key={s.id} className="glass-card admin-student-card">
                <div className="admin-student-header">
                  <h4 style={{ margin: 0, color: '#fff', fontFamily: 'Fredoka, sans-serif' }}>{s.name}</h4>
                  <span style={{ opacity: 0.5, fontSize: 13 }}>Age {s.age}</span>
                </div>
                <p style={{ margin: '4px 0 12px', opacity: 0.5, fontSize: 13 }}>Parent: {s.profiles?.name || '—'}</p>
                {Object.entries(courseGroups).map(([courseId, chapters]) => (
                  <div key={courseId} className="admin-student-progress">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ opacity: 0.7 }}>{courseId}</span>
                      <span style={{ color: '#8b5cf6' }}>{chapters.length} ch</span>
                    </div>
                    <div className="admin-course-progress-bar">
                      <div className="admin-course-progress-fill" style={{ width: `${Math.min(100, (chapters.length / 8) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                {Object.keys(courseGroups).length === 0 && <p style={{ opacity: 0.4, fontSize: 13 }}>No progress yet</p>}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="dg-pagination" style={{ marginTop: 20 }}>
          <div className="dg-pagination-info">Page {page} of {totalPages}</div>
          <div className="dg-pagination-buttons">
            <button className="dg-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            <button className="dg-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}
