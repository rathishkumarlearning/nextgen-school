import React, { useState, useCallback } from 'react';
import Feedback from '../../Common/Feedback';

export default function SequenceBuilder({ items, correctOrder, slotCount, onComplete }) {
  const [slots, setSlots] = useState(Array(slotCount).fill(null));
  const [availableItems, setAvailableItems] = useState(items.map((_, idx) => idx));
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });

  const handleItemDrop = useCallback((itemIdx, slotIdx) => {
    if (slots[slotIdx] !== null) {
      setAvailableItems((prev) => [...prev, slots[slotIdx]]);
    }

    setSlots((prev) => {
      const newSlots = [...prev];
      newSlots[slotIdx] = itemIdx;
      return newSlots;
    });

    setAvailableItems((prev) => prev.filter((idx) => idx !== itemIdx));
  }, [slots]);

  const handleRemoveFromSlot = useCallback((slotIdx) => {
    const itemIdx = slots[slotIdx];
    if (itemIdx !== null) {
      setSlots((prev) => {
        const newSlots = [...prev];
        newSlots[slotIdx] = null;
        return newSlots;
      });
      setAvailableItems((prev) => [...prev, itemIdx]);
    }
  }, [slots]);

  const handleCheck = useCallback(() => {
    const allFilled = slots.every((slot) => slot !== null);

    if (!allFilled) {
      setFeedback({
        show: true,
        type: 'error',
        message: 'Fill all the steps first!',
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    const isCorrect = slots.every((slot, idx) => slot === correctOrder[idx]);

    if (isCorrect) {
      setFeedback({
        show: true,
        type: 'success',
        message: 'Perfect sequence! You got it right! 🎉',
      });
      setTimeout(() => onComplete(), 1000);
    } else {
      setFeedback({
        show: true,
        type: 'error',
        message: 'Not quite right. Check the order and try again!',
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2500);
    }
  }, [slots, correctOrder, onComplete]);

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      {/* Available Items */}
      <div className="bg-bg2 border border-glass-border rounded-xl p-4 md:p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
          Available Items
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {availableItems.map((itemIdx) => (
            <div
              key={itemIdx}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('itemIdx', itemIdx.toString());
              }}
              className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 hover:border-cyan-400 cursor-move active:scale-95 transition-all text-center font-semibold"
            >
              {items[itemIdx]}
            </div>
          ))}
        </div>
      </div>

      {/* Sequence Slots */}
      <div className="bg-bg2 border border-glass-border rounded-xl p-4 md:p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Build the Sequence
        </h3>
        <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-2">
          {slots.map((itemIdx, slotIdx) => (
            <div key={slotIdx} className="flex-1 flex items-stretch gap-2">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedIdx = parseInt(e.dataTransfer.getData('itemIdx'), 10);
                  handleItemDrop(droppedIdx, slotIdx);
                }}
                className="flex-1 flex flex-col items-center justify-center min-h-32 md:min-h-40 rounded-lg border-2 border-dashed border-purple-400/50 bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-move"
              >
                {itemIdx !== null ? (
                  <div
                    onClick={() => handleRemoveFromSlot(slotIdx)}
                    className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <div className="text-3xl font-bold text-purple-400 mb-2">Step {slotIdx + 1}</div>
                    <div className="font-semibold text-text">{items[itemIdx]}</div>
                    <div className="text-xs text-text-secondary mt-2">Click to remove</div>
                  </div>
                ) : (
                  <div className="text-center text-text-secondary">
                    <div className="text-2xl font-bold text-text-secondary mb-2">Step {slotIdx + 1}</div>
                    <div className="text-xs">Drag item here</div>
                  </div>
                )}
              </div>
              {slotIdx < slots.length - 1 && (
                <div className="flex items-center px-2 text-2xl text-purple-400">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheck}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all active:scale-95"
      >
        Check Sequence
      </button>
    </div>
  );
}
