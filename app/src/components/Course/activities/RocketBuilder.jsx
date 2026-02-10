import React, { useState, useCallback, useRef } from 'react';
import gsap from 'gsap';
import Feedback from '../../Common/Feedback';

export default function RocketBuilder({ parts, onLaunch }) {
  const [slots, setSlots] = useState(Array(5).fill(null));
  const [availableParts, setAvailableParts] = useState(parts.map((_, idx) => idx));
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });
  const [launched, setLaunched] = useState(false);
  const rocketRef = useRef(null);

  const handlePartDrop = useCallback((partIdx, slotIdx) => {
    if (slots[slotIdx] !== null) {
      setAvailableParts((prev) => [...prev, slots[slotIdx]]);
    }

    setSlots((prev) => {
      const newSlots = [...prev];
      newSlots[slotIdx] = partIdx;
      return newSlots;
    });

    setAvailableParts((prev) => prev.filter((idx) => idx !== partIdx));
  }, [slots]);

  const handleRemoveFromSlot = useCallback((slotIdx) => {
    const partIdx = slots[slotIdx];
    if (partIdx !== null) {
      setSlots((prev) => {
        const newSlots = [...prev];
        newSlots[slotIdx] = null;
        return newSlots;
      });
      setAvailableParts((prev) => [...prev, partIdx]);
    }
  }, [slots]);

  const handleLaunch = useCallback(() => {
    const isFull = slots.every((slot) => slot !== null);

    if (!isFull) {
      setFeedback({
        show: true,
        type: 'error',
        message: 'Complete your rocket first!',
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    setLaunched(true);
    setFeedback({
      show: true,
      type: 'success',
      message: 'Rocket launching! 🚀',
    });

    // GSAP animation
    gsap.to(rocketRef.current, {
      y: -500,
      opacity: 0,
      duration: 2,
      ease: 'power2.in',
      onComplete: () => {
        setTimeout(() => {
          onLaunch?.();
        }, 500);
      },
    });
  }, [slots, onLaunch]);

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Parts */}
        <div className="bg-bg2 border border-glass-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Rocket Parts
          </h3>
          <div className="space-y-2">
            {availableParts.map((partIdx) => {
              const part = parts[partIdx];
              return (
                <div
                  key={partIdx}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('partIdx', partIdx.toString());
                  }}
                  className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 hover:border-cyan-400 cursor-move active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{part.emoji}</span>
                    <div className
="flex-1">
                      <div className="font-semibold text-text">{part.name}</div>
                      <div className="text-xs text-text-secondary">{part.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rocket Assembly */}
        <div className="bg-bg2 border border-glass-border rounded-xl p-4 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-text-secondary mb-6 uppercase tracking-wide">
            Assemble Your Rocket
          </h3>

          {/* Rocket Frame */}
          <div
            ref={rocketRef}
            className="flex flex-col gap-1 mb-6"
          >
            {slots.map((partIdx, slotIdx) => {
              const part = partIdx !== null ? parts[partIdx] : null;

              return (
                <div
                  key={slotIdx}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedIdx = parseInt(e.dataTransfer.getData('partIdx'), 10);
                    handlePartDrop(droppedIdx, slotIdx);
                  }}
                  className={`w-32 h-16 rounded-lg border-2 flex items-center justify-center transition-all cursor-move ${
                    part
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-purple-500/5 border-dashed border-purple-400/50 hover:bg-purple-500/10'
                  }`}
                >
                  {part ? (
                    <div
                      onClick={() => handleRemoveFromSlot(slotIdx)}
                      className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      <div className="text-3xl">{part.emoji}</div>
                      <div className="text-xs font-semibold text-text mt-1">{part.name}</div>
                    </div>
                  ) : (
                    <div className="text-center text-text-secondary text-xs">
                      <div className="text-lg mb-1">
                        {slotIdx === 0 ? '📌' : slotIdx === 1 ? '📦' : slotIdx === 2 ? '⛽' : slotIdx === 3 ? '⚙️' : '🪶'}
                      </div>
                      Slot {slotIdx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Launch Button */}
          {slots.every((s) => s !== null) && !launched && (
            <button
              onClick={handleLaunch}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95"
            >
              🚀 LAUNCH
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
