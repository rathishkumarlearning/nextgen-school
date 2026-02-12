import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

let adminService;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => { adminService = null; });

const STAT_CONFIG = [
  { key: 'totalFamilies', label: 'Families', icon: '👨‍👩‍👧‍👦', color: '#8b5cf6' },
  { key: 'totalChildren', label: 'Children', icon: '👧', color: '#06b6d4' },
  { key: 'totalRevenue', label: 'Revenue', icon: '💰', color: '#10b981', prefix: '$' },
  { key: 'totalPurchases', label: 'Transactions', icon: '🧾', color: '#f59e0b' },
  { key: 'chaptersCompleted', label: 'Chapters Done', icon: '📚', color: '#ec4899' },
  { key: 'failedPayments', label: 'Failed Payments', icon: '⚠️', color: '#ef4444' },
];

export default function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (!adminService) throw new Error('Service not ready');
      const [s, r, e, c] = await Promise.all([
        adminService.getStats(),
        adminService.getRevenueByDay(7),
        adminService.getEnrollmentsByDay(7),
        adminService.getCourseCompletion(),
      ]);
      if (s.data) setStats(s.data);
      if (r.data) setRevenueData(r.data);
      if (e.data) setEnrollmentData(e.data);
      if (c.data) setCompletionData(c.data);
    } catch { /* fallback: empty */ }
    setLoading(false);
  }

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Nunito' } } } },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const dayLabels = days.map(d => d.slice(5));

  const revenueChart = {
    labels: dayLabels,
    datasets: [{
      label: 'Revenue ($)',
      data: days.map(d => revenueData?.[d] || 0),
      backgroundColor: 'rgba(139,92,246,0.6)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const enrollmentChart = {
    labels: dayLabels,
    datasets: [{
      label: 'Enrollments',
      data: days.map(d => enrollmentData?.[d] || 0),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#06b6d4',
    }],
  };

  const doughnutChart = completionData ? {
    labels: completionData.map(c => c.title || c.courseId),
    datasets: [{
      data: completionData.map(c => c.completionPct),
      backgroundColor: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }],
  } : null;

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        {STAT_CONFIG.map(s => (
          <div key={s.key} className="admin-stat-card glass-card">
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-value" style={{ color: s.color }}>
              {loading ? '...' : `${s.prefix || ''}${stats?.[s.key]?.toLocaleString() ?? 0}`}
            </div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-charts-row">
        <div className="glass-card admin-chart-card">
          <h3 className="admin-chart-title">Revenue (7 days)</h3>
          <div className="admin-chart-wrap"><Bar data={revenueChart} options={chartOpts} /></div>
        </div>
        <div className="glass-card admin-chart-card">
          <h3 className="admin-chart-title">Enrollments (7 days)</h3>
          <div className="admin-chart-wrap"><Line data={enrollmentChart} options={chartOpts} /></div>
        </div>
      </div>

      {doughnutChart && (
        <div className="glass-card admin-chart-card" style={{ maxWidth: 400, margin: '24px auto' }}>
          <h3 className="admin-chart-title">Course Completion %</h3>
          <div className="admin-chart-wrap" style={{ height: 260 }}>
            <Doughnut data={doughnutChart} options={{ ...chartOpts, scales: undefined }} />
          </div>
        </div>
      )}
    </div>
  );
}
