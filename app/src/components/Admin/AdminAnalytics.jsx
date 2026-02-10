import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { COURSES } from '../../lib/constants';
import DB from '../../lib/db';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminAnalytics() {
  const progress = DB.getProgress();
  const children = DB.getChildren();

  const courses = COURSES;
  const courseColors = {
    AI: 'rgba(34, 211, 238, 0.6)',
    Space: 'rgba(168, 85, 247, 0.6)',
    Robotics: 'rgba(236, 72, 153, 0.6)',
  };

  const courseBorderColors = {
    AI: 'rgb(34, 211, 238)',
    Space: 'rgb(168, 85, 247)',
    Robotics: 'rgb(236, 72, 153)',
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
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

  return (
    <div className="space-y-8">
      {courses.map((course) => {
        const courseProgress = progress.filter((p) => p.course === course.name);
        const studentCount = children.filter((c) =>
          courseProgress.some((p) => p.childId === c.id)
        ).length;

        // Get chapter completion counts
        const chapterCompletionCounts = Array(8).fill(0);
        courseProgress.forEach((p) => {
          p.completed.forEach((chapterIndex) => {
            if (chapterIndex < 8) {
              chapterCompletionCounts[chapterIndex]++;
            }
          });
        });

        const chartData = {
          labels: Array.from({ length: 8 }, (_, i) => `Ch ${i + 1}`),
          datasets: [
            {
              label: `${course.name} Completions`,
              data: chapterCompletionCounts,
              backgroundColor: courseColors[course.name],
              borderColor: courseBorderColors[course.name],
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        };

        return (
          <div
            key={course.name}
            className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text">
                {course.emoji} {course.name}
              </h3>
              <p className="text-text2">
                {studentCount} student{studentCount !== 1 ? 's' : ''} enrolled
              </p>
            </div>
            <Bar data={chartData} options={chartOptions} height={200} />
          </div>
        );
      })}
    </div>
  );
}
