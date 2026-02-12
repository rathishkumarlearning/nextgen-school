import React, { useState, useEffect } from 'react';
import DataGrid, { StatusBadge, ActionButton, Modal, AnimatedNumber } from '../components/DataGrid.jsx';

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

export default function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [accessLog, setAccessLog] = useState([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [grantModal, setGrantModal] = useState(null);
  const [grantForm, setGrantForm] = useState({ userId: '', reason: '' });
  const [error, setError] = useState(null);

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      if (!adminService) adminService = await import('../services/admin.service.js');
      const res = await adminService.getCourseOverview();
      setCourses(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAccessLog() {
    setAccessLoading(true);
    try {
      const res = await adminService.getCourseAccessLog({ pageSize: 50 });
      setAccessLog(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAccessLoading(false);
    }
  }

  async function handleGrant() {
    if (!grantForm.userId || !grantModal) return;
    try {
      await adminService.grantCourseAccess(grantForm.userId, grantModal.id, grantForm.reason);
      setGrantModal(null);
      setGrantForm({ userId: '', reason: '' });
      loadCourses();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRevoke(accessId) {
    try {
      await adminService.revokeCourseAccess(accessId);
      loadAccessLog();
    } catch (e) {
      console.error(e);
    }
  }

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadAccessLog();
    }
  };

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h2 className="admin-page-title">Courses</h2>
          <p className="admin-page-subtitle">Manage courses and access</p>
        </div>
        <div className="admin-course-cards-pro">
          {[1, 2, 3].map(i => (
            <div key={i} className="admin-course-card-pro glass-card">
              <div className="dg-skeleton" style={{ width: '60%', height: 24, marginBottom: 16 }} />
              <div className="dg-skeleton" style={{ width: '100%', height: 60 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Courses</h2>
        <p className="admin-page-subtitle">Manage courses, enrollments, and access grants</p>
      </div>

      <div className="admin-course-cards-pro">
        {courses.map(course => (
          <div key={course.id} className={`admin-course-card-pro glass-card ${expandedId === course.id ? 'expanded' : ''}`}>
            <div className="admin-course-card-top" onClick={() => toggleExpand(course.id)}>
              <div className="admin-course-card-title-row">
                <span className="admin-course-emoji">{course.emoji || '📖'}</span>
                <h3 className="admin-course-name">{course.title}</h3>
                <span className="admin-course-expand">{expandedId === course.id ? '▲' : '▼'}</span>
              </div>
              <div className="admin-course-metrics">
                <div className="admin-course-metric">
                  <span className="admin-course-metric-value dg-mono-text">{course.students}</span>
                  <span className="admin-course-metric-label">Students</span>
                </div>
                <div className="admin-course-metric">
                  <span className="admin-course-metric-value dg-mono-text">{course.completionPct}%</span>
                  <span className="admin-course-metric-label">Completed</span>
                </div>
                <div className="admin-course-metric">
                  <span className="admin-course-metric-value dg-mono-text" style={{ color: '#10b981' }}>${course.revenue}</span>
                  <span className="admin-course-metric-label">Revenue</span>
                </div>
                <div className="admin-course-metric">
                  <span className="admin-course-metric-value dg-mono-text">{course.chaptersDone}</span>
                  <span className="admin-course-metric-label">Chapters</span>
                </div>
              </div>
              <div className="admin-course-progress-bar">
                <div className="admin-course-progress-fill" style={{ width: `${course.completionPct}%` }} />
              </div>
            </div>

            {expandedId === course.id && (
              <div className="admin-course-expanded">
                <div className="admin-course-actions-row">
                  <button className="admin-btn primary" onClick={() => setGrantModal(course)}>
                    ✨ Grant Access
                  </button>
                </div>

                {/* Access Log for this course */}
                <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '16px 0 8px', fontWeight: 600 }}>Access Log</h4>
                {accessLoading ? (
                  <div style={{ padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
                ) : (
                  <div className="admin-access-log">
                    {accessLog.filter(a => a.course_id === course.id).length === 0 ? (
                      <div style={{ padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No access grants for this course</div>
                    ) : (
                      <table className="admin-mini-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Status</th>
                            <th>Granted</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accessLog.filter(a => a.course_id === course.id).map(a => (
                            <tr key={a.id}>
                              <td>{a.profiles?.name || a.profiles?.email || '—'}</td>
                              <td><StatusBadge status={a.active !== false ? 'granted' : 'revoked'} /></td>
                              <td className="dg-mono-text">{a.granted_at?.slice(0, 10) || '—'}</td>
                              <td>
                                {a.active !== false && (
                                  <button className="admin-btn-sm danger" onClick={() => handleRevoke(a.id)}>Revoke</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {courses.length === 0 && (
          <div className="admin-empty-state glass-card">
            <span style={{ fontSize: 48 }}>📚</span>
            <p>No courses found</p>
          </div>
        )}
      </div>

      <Modal open={!!grantModal} onClose={() => setGrantModal(null)} title={`Grant Access — ${grantModal?.title || ''}`}>
        <div className="admin-form-group">
          <label className="admin-form-label">User ID</label>
          <input
            className="admin-input"
            placeholder="Enter user ID…"
            value={grantForm.userId}
            onChange={e => setGrantForm(f => ({ ...f, userId: e.target.value }))}
          />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Reason (optional)</label>
          <input
            className="admin-input"
            placeholder="e.g., Scholarship, Support ticket…"
            value={grantForm.reason}
            onChange={e => setGrantForm(f => ({ ...f, reason: e.target.value }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="admin-btn primary" onClick={handleGrant}>Grant Access</button>
          <button className="admin-btn" onClick={() => setGrantModal(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
