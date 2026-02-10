import { useNavigate } from 'react-router-dom';

function CourseCards() {
  const navigate = useNavigate();

  const courses = [
    {
      id: 'ai-adventures',
      emoji: '🤖',
      title: 'AI Adventures',
      description: 'Discover how AI works through interactive games and challenges.',
      color: 'from-cyan-500 to-blue-500',
      borderColor: 'border-cyan-400/30',
    },
    {
      id: 'space-explorers',
      emoji: '🚀',
      title: 'Space Explorers',
      description: 'Explore AI applications in space exploration and astronomy.',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-400/30',
    },
    {
      id: 'robotics-lab',
      emoji: '🔧',
      title: 'Robotics Lab',
      description: 'Build and program your own robots with AI and machine learning.',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-400/30',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold font-fredoka text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Popular Courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className={`bg-gradient-to-br ${course.color} bg-opacity-10 border ${course.borderColor} rounded-2xl p-8 hover:scale-105 hover:shadow-2xl hover:shadow-${course.color}/50 transition-all duration-300 text-left group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {course.emoji}
                </span>
              </div>

              <h3 className="text-2xl font-bold font-fredoka text-white mb-3">
                {course.title}
              </h3>

              <p className="text-gray-300 mb-6 font-fredoka">
                {course.description}
              </p>

              <div className="inline-block px-4 py-2 bg-white/10 rounded-lg text-sm font-fredoka text-gray-200 group-hover:bg-white/20 transition-colors">
                8 Chapters • 50+ Activities
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CourseCards;
