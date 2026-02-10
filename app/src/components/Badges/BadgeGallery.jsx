import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { BADGE_DATA } from '../../lib/constants';

export default function BadgeGallery() {
  const navigate = useNavigate();
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-glass transition"
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text">🏆 Badge Gallery</h1>
          <p className="text-text2">Complete chapters to earn badges!</p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {BADGE_DATA.map((badge, index) => {
          const isEarned = state.completed && state.completed.includes(index);

          return (
            <div
              key={index}
              className={`relative group p-4 rounded-2xl transition-all duration-300 ${
                isEarned
                  ? 'bg-glass backdrop-blur-[20px] border-2 border-yellow-400 shadow-lg shadow-yellow-400/30'
                  : 'bg-glass backdrop-blur-[20px] border border-glass-border opacity-40 grayscale'
              }`}
            >
              {/* Badge Content */}
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-2">{badge.emoji}</div>
                {isEarned && <p className="text-sm font-bold text-text">{badge.name}</p>}
                {!isEarned && (
                  <p className="text-xs text-text2">Chapter {index + 1}</p>
                )}
              </div>

              {/* Glow effect for earned badges */}
              {isEarned && (
                <div className="absolute inset-0 rounded-2xl bg-yellow-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {(!state.completed || state.completed.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-text2 text-lg">Complete chapters to earn badges!</p>
        </div>
      )}
    </div>
  );
}
