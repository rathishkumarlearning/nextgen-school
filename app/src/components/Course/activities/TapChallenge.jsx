import React, { useState, useEffect, useRef } from 'react';
import Feedback from '../../Common/Feedback';

export default function TapChallenge({ duration = 10, onScore }) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [taps, setTaps] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setShowResult(true);
      onScore?.(taps);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeLeft, taps, onScore]);

  const handleStart = () => {
    setIsRunning(true);
    setTaps(0);
    setTimeLeft(duration);
    setShowResult(false);
  };

  const handleTap = () => {
    if (isRunning) {
      setTaps((prev) => prev + 1);
    }
  };

  const progressPercent = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6">
        {/* Timer Display */}
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-2">Time Remaining</p>
          <div className="text-5xl md:text-6xl font-bold text-cyan-400 font-mono">
            {timeLeft}s
          </div>
        </div>

        {/* Tap Button */}
        <button
          onClick={handleTap}
          disabled={!isRunning}
          className={`w-48 h-48 md:w-64 md:h-64 rounded-full font-bold text-white text-5xl md:text-6xl transition-all active:scale-95 flex items-center justify-center ${
            isRunning
              ? 'bg-gradient-to-br from-cyan-500 to-purple-500 hover:shadow-2xl hover:shadow-cyan-500/50 cursor-pointer'
              : 'bg-gradient-to-br from-gray-600 to-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {taps}
        </button>

        {/* Start/Restart Button */}
        {!isRunning && !showResult && (
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Start Challenge
          </button>
        )}

        {!isRunning && showResult && (
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="w-full h-2 bg-bg3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Result */}
      {showResult && (
        <div className="bg-gradient-to-br from-bg2 to-bg3 border border-glass-border rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold mb-3">Challenge Complete!</h3>
          <div className="text-4xl font-bold text-cyan-400 mb-3">{taps} Taps</div>
          <p className="text-text-secondary">
            {taps > 50 ? 'Amazing reflexes! 🚀' : taps > 30 ? 'Great effort! 💪' : 'Good try! Keep practicing! 📈'}
          </p>
        </div>
      )}
    </div>
  );
}
