import { useState } from 'react';

export default function PinPad({ onSubmit, disabled = false }) {
  const [pin, setPin] = useState('');

  const handleDigit = (digit) => {
    if (pin.length < 4 && !disabled) {
      setPin(pin + digit);
    }
  };

  const handleBackspace = () => {
    if (!disabled) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (pin.length === 4 && !disabled) {
      onSubmit(pin);
    }
  };

  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['⌫', '0', '✓'],
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* PIN Indicator */}
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition ${
              index < pin.length
                ? 'bg-cyan-400'
                : 'bg-glass border border-glass-border'
            }`}
          />
        ))}
      </div>

      {/* PIN Pad Grid */}
      <div className="grid grid-cols-3 gap-3">
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            {row.map((btn) => {
              if (btn === '⌫') {
                return (
                  <button
                    key={btn}
                    onClick={handleBackspace}
                    disabled={disabled}
                    className="w-16 h-16 rounded-lg bg-glass border border-glass-border text-text hover:bg-red-500/20 hover:border-red-500/50 transition font-semibold text-xl active:scale-95"
                  >
                    {btn}
                  </button>
                );
              }
              if (btn === '✓') {
                return (
                  <button
                    key={btn}
                    onClick={handleSubmit}
                    disabled={disabled || pin.length !== 4}
                    className="w-16 h-16 rounded-lg bg-glass border border-glass-border text-text hover:bg-green-500/20 hover:border-green-500/50 disabled:opacity-50 transition font-semibold text-xl active:scale-95"
                  >
                    {btn}
                  </button>
                );
              }
              return (
                <button
                  key={btn}
                  onClick={() => handleDigit(btn)}
                  disabled={disabled}
                  className="w-16 h-16 rounded-lg bg-glass border border-glass-border text-text hover:border-cyan-400 hover:text-cyan-400 transition font-semibold text-xl active:scale-95"
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <p className="text-text2 text-sm">Enter your child's 4-digit PIN</p>
    </div>
  );
}
