import { useState, useEffect } from 'react';

function EngagementPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show popup after 10 seconds on landing page
    const timer = setTimeout(() => {
      setShow(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-400/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold font-fredoka bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Weekly Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Lessons Completed</p>
              <p className="text-3xl font-bold text-cyan-400">5</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-300 text-sm">XP Earned</p>
              <p className="text-3xl font-bold text-yellow-400">250</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-300 text-sm">Badges Unlocked</p>
              <p className="text-3xl font-bold text-purple-400">2</p>
            </div>
          </div>

          <button
            onClick={() => setShow(false)}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-fredoka font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}

export default EngagementPopup;
