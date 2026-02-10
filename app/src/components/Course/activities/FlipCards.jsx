import React, { useState } from 'react';

export default function FlipCards({ cards, onComplete }) {
  const [flipped, setFlipped] = useState(new Set());
  const [discovered, setDiscovered] = useState(new Set());

  const toggleFlip = (idx) => {
    const newFlipped = new Set(flipped);
    if (newFlipped.has(idx)) {
      newFlipped.delete(idx);
    } else {
      newFlipped.add(idx);
      const newDiscovered = new Set(discovered);
      newDiscovered.add(idx);
      setDiscovered(newDiscovered);

      if (newDiscovered.size === cards.length) {
        setTimeout(() => onComplete?.(), 500);
      }
    }
    setFlipped(newFlipped);
  };

  return (
    <div className="space-y-6">
      {/* Counter */}
      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-lg px-4 py-2">
          <p className="text-sm text-text-secondary">Discovered</p>
          <p className="text-2xl font-bold text-cyan-400">
            {discovered.size} / {cards.length}
          </p>
        </div>
      </div>

      {/* Flip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const isFlipped = flipped.has(idx);

          return (
            <div
              key={idx}
              onClick={() => toggleFlip(idx)}
              className="h-64 cursor-pointer perspective"
            >
              <div
                className={`relative w-full h-full rounded-xl transition-transform duration-500 transform-gpu ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 rounded-xl p-6 flex flex-col items-center justify-center text-center ${
                    isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-6xl mb-4">{card.emoji}</div>
                  <h3 className="text-lg font-bold text-text">{card.frontTitle}</h3>
                  <p className="text-sm text-text-secondary mt-2">Click to reveal</p>
                </div>

                {/* Back */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 rounded-xl p-6 flex flex-col items-center justify-center text-center ${
                    isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <h3 className="text-lg font-bold text-text mb-3">{card.backTitle}</h3>
                  <p className="text-sm text-text">{card.backText}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
