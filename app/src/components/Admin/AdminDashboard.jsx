import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import DB from '../../lib/db';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const users = DB.getUsers();
  const children = DB.getChildren();
  const purchases = DB.getPurchases();
  const progress = DB.getProgress();

  // Calculate stats
  const families = users.length;
  const childCount = children.length;
  const revenue = purchases
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
  const transactions = purchases.length;
  const chaptersDone = progress.reduce((sum, p) => sum + p.completed.length, 0);
  const failedPayments = purchases.filter((p) => p.status === 'failed').length;

  // Generate last 7 days data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Revenue chart data
  const revenueByDay = last7Days.map((day) => {
    return purchases
      .filter((p) => p.date.startsWith(day) && p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);
  });

  const revenueChartData = {
    labels: last7Days.map((d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueByDay,
        backgroundColor: 'rgba(34, 211, 238, 0.5)',
        borderColor: 'rgb(34, 211, 238)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Enrollments chart data
  const enrollmentsByDay = last7Days.map((day) => {
    return users.filter((u) => u.createdAt.startsWith(day)).length;
  });

  const enrollmentsChartData = {
    labels: last7Days.map((d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'New Enrollments',
        data: enrollmentsByDay,
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Course completion data
  const courseCompletion = {
    AI: progress.filter((p) => p.course === 'AI').reduce((sum, p) => sum + p.completed.length, 0),
    Space: progress
      .filter((p) => p.course === 'Space')
      .reduce((sum, p) => sum + p.completed.length, 0),
    Robotics: progress
      .filter((p) => p.course === 'Robotics')
      .reduce((sum, p) => sum + p.completed.length, 0),
  };

  const completionChartData = {
    labels: ['AI', 'Space', 'Robotics'],
    datasets: [
      {
        label: 'Chapters Completed',
        data: [courseCompletion.AI, courseCompletion.Space, courseCompletion.Robotics],
        backgroundColor: ['rgba(34, 211, 238, 0.6)', 'rgba(168, 85, 247, 0.6)', 'rgba(236, 72, 153, 0.6)'],
        borderColor: ['rgb(34, 211, 238)', 'rgb(168, 85, 247)', 'rgb(236, 72, 153)'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: { size: 12 },
        },
      },
      title: {
        color: '#e2e8f0',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <div className="text-text2 text-sm font-medium">Families</div>
          <div className="text-3xl font-bold text-text mt-2">{families}</div>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <div className="text-text2 text-sm font-medium">Children</div>
          <div className="text-3xl font-bold text-text mt-2">{childCount}</div>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <div className="text-text2 text-sm font-medium">Revenue</div>
          <div className="text-3xl font-bold text-cyan-400 mt-2">${revenue}</div>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <div className="text-text2 text-sm font-medium">Transactions</div>
          <div className="text-3xl font-bold text-text mt-2">{transactions}</div>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <div className="text-text2 text-sm font-medium">Chapters Done</div>
          <div className="text-3xl font-bold text-text mt-2">{chaptersDone}</div>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <div className="text-text2 text-sm font-medium">Failed Payments</div>
          <div className="text-3xl font-bold text-red-500 mt-2">{failedPayments}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-text mb-4">Revenue (Last 7 Days)</h3>
          <Bar data={revenueChartData} options={chartOptions} height={250} />
        </div>

        {/* Enrollments Chart */}
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-text mb-4">Enrollments (Last 7 Days)</h3>
          <Line data={enrollmentsChartData} options={chartOptions} height={250} />
        </div>
      </div>

      {/* Course Completion Chart */}
      <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6 max-w-md">
        <h3 className="text-lg font-bold text-text mb-4">Course Completion</h3>
        <Doughnut data={completionChartData} options={doughnutOptions} height={250} />
      </div>
    </div>
  );
}
