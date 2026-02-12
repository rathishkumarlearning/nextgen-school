import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { AnimatedNumber } from '../components/DataGrid.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

let adminService = null;
import('../services/admin.service.js').then(m => { adminService = m; }).catch(() => {});

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: 'All time' },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const baseChartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,16,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10, family: 'Inter' } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10, family: 'JetBrains Mono, monospace' } } },
  },
};

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11, family: 'Inter' }, padding: 12, usePointStyle: true } },
    tooltip: { backgroundColor: 'rgba(10,10,16,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 10 },
  },
  cutout: '60%',
};

export default function AnalyticsTab() {
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenueByDay, setRevenueByDay] = useState(null);
  const [enrollByDay, setEnrollByDay] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => { loadData(); }, [range]);

  async function loadData() {
    setLoading(true);
    try {
      if (!adminService) adminService = await import('../services/admin.service.js');
      const [st, rev, enr, ana] = await Promise.all([
        adminService.getStats(),
        adminService.getRevenueByDay(range),
        adminService.getEnrollmentsByDay(range),
        adminService.getAnalytics(),
      ]);
      if (st.data) setStats(st.data);
      if (rev.data) setRevenueByDay(rev.data);
      if (enr.data) setEnrollByDay(enr.data);
      if (ana.data) setAnalytics(ana.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const days = Array.from({ length: Math.min(range, 30) }, (_, i) => {
    const d = new Date(Date.now() - (Math.min(range, 30) - 1 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const dayLabels = days.map(d => {
    const dt = new Date(d + 'T12:00:00');
    return range <= 7 ? dt.toLocaleDateString('en', { weekday: 'short' }) : dt.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  });

  const revChart = revenueByDay ? {
    labels: dayLabels,
    datasets: [{
      label: 'Revenue ($)',
      data: days.map(d => revenueByDay[d] || 0),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: range <= 7 ? 4 : 0,
      pointBackgroundColor: '#8b5cf6',
    }],
  } : null;

  const enrChart = enrollByDay ? {
    labels: dayLabels,
    datasets: [{
      label: 'Enrollments',
      data: days.map(d => enrollByDay[d] || 0),
      backgroundColor: 'rgba(6,182,212,0.4)',
      borderColor: '#06b6d4',
      borderWidth: 2,
      borderRadius: 6,
    }],
  } : null;

  const popularChart = analytics?.popularCourses ? {
    labels: analytics.popularCourses.slice(0, 6).map(c => c.title || 'Unknown'),
    datasets: [{
      label: 'Students',
      data: analytics.popularCourses.slice(0, 6).map(c => c.students),
      backgroundColor: COLORS.slice(0, 6).map(c => c + '80'),
      borderColor: COLORS.slice(0, 6),
      borderWidth: 1,
      borderRadius: 6,
    }],
  } : null;

  const horizontalBarOpts = {
    ...baseChartOpts,
    indexAxis: 'y',
  };

  const funnelChart = analytics?.completionFunnel ? {
    labels: analytics.completionFunnel.map(c => c.title || 'Unknown'),
    datasets: [
      {
        label: 'Started',
        data: analytics.completionFunnel.map(c => c.started),
        backgroundColor: 'rgba(139,92,246,0.4)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Completed',
        data: analytics.completionFunnel.map(c => c.completed),
        backgroundColor: 'rgba(16,185,129,0.4)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  } : null;

  const funnelOpts = {
    ...baseChartOpts,
    plugins: {
      ...baseChartOpts.plugins,
      legend: { display: true, labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11, family: 'Inter' }, usePointStyle: true, padding: 16 } },
    },
  };

  const methodChart = {
    labels: ['Stripe', 'Razorpay', 'Free'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: ['rgba(139,92,246,0.6)', 'rgba(6,182,212,0.6)', 'rgba(16,185,129,0.6)'],
      borderColor: ['#8b5cf6', '#06b6d4', '#10b981'],
      borderWidth: 2,
    }],
  };

  const metricCards = [
    { label: 'Total Revenue', value: stats?.totalRevenue || 0, prefix: '$', color: '#10b981' },
    { label: 'Total Users', value: stats?.totalFamilies || 0, color: '#8b5cf6' },
    { label: 'Avg Revenue/User', value: stats?.totalFamilies ? Math.round((stats.totalRevenue || 0) / stats.totalFamilies) : 0, prefix: '$', color: '#06b6d4' },
    { label: 'Completion Rate', value: stats?.chaptersCompleted || 0, suffix: '', color: '#ec4899' },
  ];

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 className="admin-page-title">Analytics</h2>
          <p className="admin-page-subtitle">Deep dive into your school's metrics</p>
        </div>
        <div className="admin-range-selector">
          {RANGES.map(r => (
            <button
              key={r.value}
              className={`admin-range-btn ${range === r.value ? 'active' : ''}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="admin-mini-stats" style={{ marginBottom: 24 }}>
        {metricCards.map(m => (
          <div key={m.label} className="admin-mini-stat glass-card" style={{ '--stat-color': m.color }}>
            <span className="admin-mini-stat-label">{m.label}</span>
            <span className="admin-mini-stat-value dg-mono-text" style={{ color: m.color }}>
              {loading ? '—' : <AnimatedNumber value={m.value} prefix={m.prefix || ''} suffix={m.suffix || ''} />}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="admin-analytics-grid">
        <div className="admin-chart-card-pro glass-card admin-chart-wide">
          <h4 className="admin-chart-card-title">Revenue Trend</h4>
          <div className="admin-chart-area">
            {loading ? <div className="admin-chart-loading">Loading…</div> : revChart && <Line data={revChart} options={baseChartOpts} />}
          </div>
        </div>
        <div className="admin-chart-card-pro glass-card">
          <h4 className="admin-chart-card-title">User Growth</h4>
          <div className="admin-chart-area">
            {loading ? <div className="admin-chart-loading">Loading…</div> : enrChart && <Bar data={enrChart} options={baseChartOpts} />}
          </div>
        </div>
        <div className="admin-chart-card-pro glass-card">
          <h4 className="admin-chart-card-title">Course Popularity</h4>
          <div className="admin-chart-area">
            {loading ? <div className="admin-chart-loading">Loading…</div> : popularChart && <Bar data={popularChart} options={horizontalBarOpts} />}
          </div>
        </div>
        <div className="admin-chart-card-pro glass-card admin-chart-wide">
          <h4 className="admin-chart-card-title">Completion Funnel</h4>
          <div className="admin-chart-area">
            {loading ? <div className="admin-chart-loading">Loading…</div> : funnelChart && <Bar data={funnelChart} options={funnelOpts} />}
          </div>
        </div>
        <div className="admin-chart-card-pro glass-card">
          <h4 className="admin-chart-card-title">Payment Methods</h4>
          <div className="admin-chart-area">
            {loading ? <div className="admin-chart-loading">Loading…</div> : <Doughnut data={methodChart} options={doughnutOpts} />}
          </div>
        </div>
      </div>
    </div>
  );
}
