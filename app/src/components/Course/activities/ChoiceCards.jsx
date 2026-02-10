import React, { useState } from 'react';
import Feedback from '../../Common/Feedback';

export default function ChoiceCards({ question, options, onCorrect }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });
  const [answered, setAnswered] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSelect = (idx) => {
    if (answered) return;

    const option = options[idx];
    setSelectedIdx(idx);

    if (option.correct) {
      setAnswered(true);
      setFeedback({
        show: true,
        type: 'success',
        message: `Correct! ${option.explanation}`,
      });
      setTimeout(() => {
        onCorrect();
      }, 1500);
    } else {
      setShaking(true);
      setFeedback({
        show: true,
        type: 'error',
        message: option.explanation || 'Not quite right. Try again!',
      });
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => {
        setSelectedIdx(null);
        setFeedback({ show: false, type: 'info', message: '' });
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      {/* Question */}
      <div className="bg-gradient-to-br from-bg2 to-bg3 border border-glass-border rounded-xl p-4 md:p-6">
        <p className="text-lg md:text-xl font-semibold text-text">{question}</p>
      </div>

      {/* Option Cards */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ${shaking ? 'animate-bounce' : ''}`}
      >
        {options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = option.correct;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`p-4 md:p-6 rounded-xl border-2 transition-all text-left cursor-pointer active:scale-95 ${
                isSelected && isCorrect
                  ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/30'
                  : isSelected && !isCorrect
                  ? 'bg-red-500/20 border-red-400 shadow-lg shadow-red-500/30'
                  : 'bg-bg2 border-glass-border hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20'
              } ${answered && !isCorrect && isSelected ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center font-bold mt-1 ${
                    isSelected && isCorrect
                      ? 'bg-green-400 border-green-400 text-white'
                      : isSelected && !isCorrect
                      ? 'bg-red-400 border-red-400 text-white'
                      : 'border-text-secondary'
                  }`}
                >
                  {isSelected && isCorrect && '✓'}
                  {isSelected && !isCorrect && '✗'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text">{option.text}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
