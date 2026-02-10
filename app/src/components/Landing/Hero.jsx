import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate();

  const scrollToMetrics = () => {
    const metricsSection = document.getElementById('metrics');
    if (metricsSection) {
      metricsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-20 px-4">
      {/* Badge row */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <div className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-sm font-fredoka font-semibold">
          Ages 9-13
        </div>
        <div className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 text-sm font-fredoka font-semibold">
          Visual Learning
        </div>
        <div className="px-4 py-2 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-300 text-sm font-fredoka font-semibold">
          Interactive
        </div>
      </div>

      {/* Main title */}
      <h1 className="text-6xl md:text-7xl font-bold font-fredoka text-center mb-6 leading-tight">
        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mind Over Machines
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl text-gray-300 text-center max-w-2xl mb-12 font-fredoka">
        Learn AI, ethics, and critical thinking through interactive adventures.
        Perfect for the next generation of digital leaders.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <button
          onClick={scrollToMetrics}
          className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-fredoka font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
        >
          Start Learning
        </button>
        <button
          onClick={() => navigate('/badges')}
          className="px-8 py-4 rounded-lg border-2 border-purple-400 text-purple-300 font-fredoka font-bold text-lg hover:bg-purple-500/10 transition-all duration-300"
        >
          My Badges
        </button>
        <button
          onClick={() => navigate('/parent')}
          className="px-8 py-4 rounded-lg border-2 border-pink-400 text-pink-300 font-fredoka font-bold text-lg hover:bg-pink-500/10 transition-all duration-300"
        >
          Parent Portal
        </button>
        <button
          onClick={() => navigate('/admin')}
          className="px-8 py-4 rounded-lg border-2 border-gray-500 text-gray-400 font-fredoka font-bold text-lg hover:bg-gray-500/10 transition-all duration-300"
        >
          Admin Panel
        </button>
      </div>

      {/* Decorative element */}
      <div className="relative w-full max-w-2xl h-64 mt-8 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/50 to-transparent blur-3xl rounded-full"></div>
      </div>
    </div>
  );
}

export default Hero;
