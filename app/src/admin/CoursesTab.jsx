import React, { useState, useEffect, useCallback, useRef } from 'react';
import DataGrid, { StatusBadge, ActionButton } from '../components/DataGrid';

let adminService;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => { adminService = null; });

const COURSE_ICONS = { ai: '🤖', space: '🚀', robotics: '🔧' };
const COURSE_COLORS = { ai: '#8b5cf6', space: '#06b6d4', robotics: '#ec4899' };

export default function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [accessLog, setAccessLog] = useState([]);
  const [accessTotal, setAccessTotal] = useState(0);
  const [accessPage, setAccessPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Grant access state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [reason, setReason] = useState('');
  const [granting, setGranting] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => { loadData(); }, [accessPage]);

  async function loadData() {
    setLoading(true);
    try {
      if (!adminService) throw new Error('not ready');
      const [c, al] = await Promise.all([
        adminService.getCourseOverview(),
        adminService.getCourseAccessLog({ page: accessPage }),
      ]);
      if (c.data) setCourses(c.data);
      if (al.data) setAccessLog(al.data);
      setAccessTotal(al.count || 0);
    } catch {}
    setLoading(false);
  }

  const handleUserSearch = useCallback((q) => {
    setSearchQuery(q);
    setSelectedUser(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await adminService.getEnrollments({ search: q, pageSize: 5 });
        setSearchResults(data || []);
      } catch { setSearchResults([]); }
    }, 300);
  }, []);

  async function handleGrant() {
    if (!selectedUser || !selectedCourse) return;
    setGranting(true);
    try {
      await adminService.grantCourseAccess(selectedUser.id, selectedCourse, reason);
      setSelectedUser(null); setSearchQuery(''); setReason(''); setSelectedCourse('');
      loadData();
    } catch {}
    setGranting(false);
  }

  async function handleRevoke(id) {
    if (!confirm('Revoke this access?')) return;
    try { await adminService.revokeCourseAccess(id); loadData(); } catch {}
  }

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Course Management</h2>

      {/* Course Cards */}
      <div className="admin-course-cards">
        {courses.map(c => {
          const slug = (c.title || '').toLowerCase();
          const icon = Object.entries(COURSE_ICONS).find(([k]) => slug.includes(k))?.[1] || '📘';
          const color = Object.entries(COURSE_COLORS).find(([k]) => slug.includes(k))?.[1] || '#8b5cf6';
          return (
            <div key={c.id} className="glass-card admin-course-card">
              <div className="admin-course-card-header">
                <span style={{ fontSize: 28 }}>{icon}</span>
                <h3 style={{ color, fontFamily: 'Fredoka, sans-serif', margin: 0 }}>{c.title}</h3>
              </div>
              <div className="admin-course-stats">
                <div><span className="admin-course-stat-num">{c.students}</span><span className="admin-course-stat-label">Students</span></div>
                <div><span className="admin-course-stat-num">{c.completionPct}%</span><span className="admin-course-stat-label">Completion</span></div>
                <div><span className="admin-course-stat-num">${c.revenue}</span><span className="admin-course-stat-label">Revenue</span></div>
                <div><span className="admin-course-stat-num">{c.chaptersDone}</span><span className="admin-course-stat-label">Chapters</span></div>
              </div>
              <div className="admin-course-progress-bar">
                <div className="admin-course-progress-fill" style={{ width: `${c.completionPct}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grant Access */}
      <div className="glass-card" style={{ padding: 24, marginTop: 24 }}>
        <h3 className="admin-chart-title">Grant Course Access</h3>
        <div className="admin-grant-form">
          <div className="admin-grant-field" style={{ position: 'relative' }}>
            <label>User</label>
            <input
              type="text"
              value={selectedUser ? selectedUser.name : searchQuery}
              onChange={e => handleUserSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="admin-input"
            />
            {searchResults.length > 0 && !selectedUser && (
              <div className="admin-autocomplete">
                {searchResults.map(u => (
                  <div key={u.id} className="admin-autocomplete-item" onClick={() => { setSelectedUser(u); setSearchResults([]); }}>
                    <strong>{u.name}</strong> <span style={{ opacity: 0.6 }}>{u.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="admin-grant-field">
            <label>Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="admin-input">
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="admin-grant-field">
            <label>Reason</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional reason..." className="admin-input" />
          </div>
          <button className="admin-btn primary" onClick={handleGrant} disabled={!selectedUser || !selectedCourse || granting}>
            {granting ? 'Granting...' : 'Grant Access'}
          </button>
        </div>
      </div>

      {/* Access Log */}
      <div style={{ marginTop: 24 }}>
        <h3 className="admin-chart-title" style={{ marginBottom: 12 }}>Access Log</h3>
        <DataGrid
          columns={[
            { key: 'user', label: 'User', render: (_, r) => r.profiles?.name || '—' },
            { key: 'course_id', label: 'Course' },
            { key: 'reason', label: 'Reason', render: v => v || '—' },
            { key: 'granted_at', label: 'Granted', render: v => v ? new Date(v).toLocaleDateString() : '—' },
            { key: 'active', label: 'Status', render: v => <StatusBadge status={v === false ? 'Revoked' : 'Active'} /> },
          ]}
          data={accessLog}
          total={accessTotal}
          page={accessPage}
          pageSize={20}
          onPageChange={setAccessPage}
          loading={loading}
          emptyMessage="No access grants yet"
          actions={row => row.active !== false && (
            <ActionButton icon="🚫" title="Revoke" onClick={() => handleRevoke(row.id)} variant="danger" />
          )}
        />
      </div>
    </div>
  );
}
