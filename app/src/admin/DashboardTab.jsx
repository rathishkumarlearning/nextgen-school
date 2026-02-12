import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { AnimatedNumber } from '../components/DataGrid.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

const STAT_CONFIG = [
  { key: 'totalFamilies', label: 'Families', icon: '👨‍👩‍👧‍👦', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { key: 'totalChildren', label: 'Children', icon: '👧', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { key: 'totalRevenue', label: 'Revenue', icon: '💰', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)', prefix: '$' },
  { key: 'totalPurchases', label: 'Transactions', icon: '🧾', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'chaptersCompleted', label: 'Chapters Done', icon: '📚', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  { key: 'failedPayments', label: 'Failed Payments', icon: '⚠️', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
];

const chartOpts = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,16,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleFont: { family: 'Inter' },
      bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11, family: 'Inter' } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11, family: 'JetBrains Mono, monospace' } } },
  },
});

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11, family: 'Inter' }, padding: 16, usePointStyle: true } },
    tooltip: { backgroundColor: 'rgba(10,10,16,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 10 },
  },
  cutout: '65%',
};

export default function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      if (!adminService) {
        const m = await import('../services/admin.service.js');
        adminService = m;
      }

      const [statsRes, revRes, enrRes, compRes] = await Promise.all([
        adminService.getStats(),
        adminService.getRevenueByDay(7),
        adminService.getEnrollmentsByDay(7),
        adminService.getCourseCompletion(),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (revRes.data) setRevenueData(revRes.data);
      if (enrRes.data) setEnrollmentData(enrRes.data);
      if (compRes.data) setCompletionData(compRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const dayLabels = last7Days.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }));

  const revenueChart = revenueData ? {
    labels: dayLabels,
    datasets: [{
      label: 'Revenue',
      data: last7Days.map(d => revenueData[d] || 0),
      backgroundColor: 'rgba(139,92,246,0.3)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: 'rgba(139,92,246,0.5)',
    }],
  } : null;

  const enrollChart = enrollmentData ? {
    labels: dayLabels,
    datasets: [{
      label: 'Enrollments',
      data: last7Days.map(d => enrollmentData[d] || 0),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#06b6d4',
      pointBorderColor: '#050508',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  } : null;

  const compChart = completionData ? {
    labels: completionData.map(c => c.title || 'Unknown'),
    datasets: [{
      data: completionData.map(c => c.completionPct),
      backgroundColor: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
      borderColor: '#050508',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  } : null;

  if (error) {
    return (
      <div className="admin-error-state">
        <span className="admin-error-icon">⚠️</span>
        <p>Failed to load dashboard data</p>
        <button className="admin-btn primary" onClick={loadData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Dashboard</h2>
        <p className="admin-page-subtitle">Overview of your school's performance</p>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid-6">
        {STAT_CONFIG.map(s => (
          <div key={s.key} className="admin-stat-card-pro glass-card" style={{ '--stat-color': s.color }}>
            <div className="admin-stat-card-icon" style={{ background: s.gradient }}>{s.icon}</div>
            <div className="admin-stat-card-content">
              <div className="admin-stat-card-value" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {loading ? (
                  <div className="dg-skeleton" style={{ width: 60, height: 28 }} />
                ) : (
                  <AnimatedNumber value={stats?.[s.key] || 0} prefix={s.prefix || ''} />
                )}
              </div>
              <div className="admin-stat-card-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="admin-charts-row-3">
        <div className="admin-chart-card-pro glass-card">
          <h4 className="admin-chart-card-title">Revenue (Last 7 Days)</h4>
          <div className="admin-chart-area">
            {loading ? <ChartSkeleton /> : revenueChart && <Bar data={revenueChart} options={chartOpts('Revenue')} />}
          </div>
        </div>
        <div className="admin-chart-card-pro glass-card">
          <h4 className="admin-chart-card-title">Enrollments (Last 7 Days)</h4>
          <div className="admin-chart-area">
            {loading ? <ChartSkeleton /> : enrollChart && <Line data={enrollChart} options={chartOpts('Enrollments')} />}
          </div>
        </div>
        <div className="admin-chart-card-pro glass-card">
          <h4 className="admin-chart-card-title">Course Completion</h4>
          <div className="admin-chart-area">
            {loading ? <ChartSkeleton /> : compChart && <Doughnut data={compChart} options={doughnutOpts} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: '100%', padding: '20px 0' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="dg-skeleton" style={{ flex: 1, height: `${30 + Math.random() * 60}%`, borderRadius: 6 }} />
      ))}
    </div>
  );
}
