import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import DataGrid from '../components/DataGrid';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

let adminService;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => { adminService = null; });

export default function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (!adminService) throw new Error('not ready');
        const [a, s] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getStudentProgress(),
        ]);
        if (a.data) setAnalytics(a.data);
        if (s.data) setStudents(s.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const topStudents = students
    .map(s => ({
      id: s.id,
      name: s.name,
      age: s.age,
      parent: s.profiles?.name || '—',
      chapters: (s.progress || []).length,
      courses: new Set((s.progress || []).map(p => p.course_id)).size,
    }))
    .sort((a, b) => b.chapters - a.chapters)
    .slice(0, 10)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const funnel = analytics?.completionFunnel || [];
  const funnelChart = {
    labels: funnel.map(f => f.title || f.courseId),
    datasets: [
      { label: 'Started', data: funnel.map(f => f.started), backgroundColor: '#8b5cf6', borderRadius: 4 },
      { label: 'Completed', data: funnel.map(f => f.completed), backgroundColor: '#10b981', borderRadius: 4 },
    ],
  };

  const avgChapters = students.length > 0
    ? (students.reduce((s, st) => s + (st.progress || []).length, 0) / students.length).toFixed(1)
    : 0;

  const metrics = [
    { label: 'Avg Chapters/Student', value: avgChapters, icon: '📖', color: '#8b5cf6' },
    { label: 'Active Students', value: students.length, icon: '🎯', color: '#06b6d4' },
    { label: 'Top Course', value: analytics?.popularCourses?.[0]?.title || '—', icon: '🏆', color: '#f59e0b' },
    { label: 'Courses Tracked', value: funnel.length, icon: '📊', color: '#ec4899' },
  ];

  return (
    <div>
      <h2 className="admin-section-title" style={{ fontFamily: 'Fredoka, sans-serif' }}>Analytics</h2>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {metrics.map(m => (
          <div key={m.label} className="admin-stat-card glass-card">
            <div className="admin-stat-icon">{m.icon}</div>
            <div className="admin-stat-value" style={{ color: m.color, fontSize: typeof m.value === 'string' && m.value.length > 5 ? 18 : 28 }}>
              {loading ? '...' : m.value}
            </div>
            <div className="admin-stat-label">{m.label}</div>
          </div>
        ))}
      </div>

      {funnel.length > 0 && (
        <div className="glass-card admin-chart-card" style={{ marginTop: 24 }}>
          <h3 className="admin-chart-title">Completion Funnel</h3>
          <div className="admin-chart-wrap">
            <Bar data={funnelChart} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)' } } },
              scales: {
                x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.04)' } },
              },
            }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3 className="admin-chart-title" style={{ marginBottom: 12 }}>🏆 Top Students</h3>
        <DataGrid
          columns={[
            { key: 'rank', label: '#', width: '50px' },
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age', width: '60px' },
            { key: 'chapters', label: 'Chapters', sortable: true },
            { key: 'courses', label: 'Courses' },
          ]}
          data={topStudents}
          total={topStudents.length}
          page={1}
          pageSize={10}
          loading={loading}
          emptyMessage="No student data yet"
        />
      </div>
    </div>
  );
}
