import { useEffect, useRef, useState } from 'react';

function Metrics() {
  const [students, setStudents] = useState(0);
  const [chapters, setChapters] = useState(0);
  const [badges, setBadges] = useState(0);
  const containerRef = useRef(null);

  const targetStudents = 152;
  const targetChapters = 847;
  const targetBadges = 523;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Start animation
          animateCounter(setStudents, targetStudents);
          animateCounter(setChapters, targetChapters);
          animateCounter(setBadges, targetBadges);
          observer.unobserve(containerRef.current);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const animateCounter = (setter, target) => {
    let current = 0;
    const increment = target / 60; // 60 frames
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(interval);
      } else {
        setter(Math.floor(current));
      }
    }, 30);
  };

  return (
    <section
      ref={containerRef}
      id="metrics"
      className="py-20 px-4 relative"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold font-fredoka text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Learning in Motion
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Students Learning Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-400/30 rounded-2xl p-8 hover:border-cyan-400/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-fredoka font-semibold text-white">
                Students Learning
              </h3>
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-5xl font-bold text-cyan-400 font-fredoka">
              {students.toLocaleString()}
            </p>
            <p className="text-gray-400 mt-2 font-fredoka">Active learners</p>
          </div>

          {/* Chapters Completed Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-400/30 rounded-2xl p-8 hover:border-purple-400/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-fredoka font-semibold text-white">
                Chapters Completed
              </h3>
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-5xl font-bold text-purple-400 font-fredoka">
              {chapters.toLocaleString()}
            </p>
            <p className="text-gray-400 mt-2 font-fredoka">Lessons completed</p>
          </div>

          {/* Badges Earned Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-pink-400/30 rounded-2xl p-8 hover:border-pink-400/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-fredoka font-semibold text-white">
                Badges Earned
              </h3>
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-5xl font-bold text-pink-400 font-fredoka">
              {badges.toLocaleString()}
            </p>
            <p className="text-gray-400 mt-2 font-fredoka">Achievements unlocked</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Metrics;
