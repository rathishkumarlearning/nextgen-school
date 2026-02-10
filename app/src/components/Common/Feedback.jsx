import { useEffect, useState } from 'react';

const encouragementMessages = [
  '🌟 Awesome work!',
  "🎉 You're amazing!",
  '💡 Great thinking!',
  '⭐ Keep it up!',
  "🚀 You're on fire!",
  '🎯 Perfectly done!',
  '✨ Brilliant!',
  '🏆 You nailed it!',
  '💪 You got this!',
  '🌈 Fantastic effort!',
];

function Feedback({ type = 'info', message, show = false }) {
  const [randomMessage, setRandomMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    if (show && type === 'error') {
      setRandomMessage(
        encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
      );
    }
  }, [show, type]);

  if (!isVisible) return null;

  const baseStyles = 'fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg backdrop-blur-sm font-fredoka transition-all duration-500 z-50';

  const typeStyles = {
    success: 'bg-gradient-to-r from-green-500/80 to-emerald-500/80 border-2 border-green-400',
    error: 'bg-gradient-to-r from-yellow-500/80 to-purple-500/80 border-2 border-purple-400',
    info: 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 border-2 border-cyan-400',
  };

  const icon = {
    success: '🎉',
    error: '✨',
    info: 'ℹ️',
  };

  const displayMessage = type === 'error' ? randomMessage : message;

  return (
    <div
      className={`${baseStyles} ${typeStyles[type]} ${
        isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      }`}
      style={{
        animation: isVisible ? 'scaleIn 0.3s ease-out' : 'none',
      }}
    >
      <div className="flex items-center gap-2 text-white text-center">
        <span className="text-2xl">{icon[type]}</span>
        <span className="font-semibold">{displayMessage}</span>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: translate(-50%, -20px) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Feedback;
