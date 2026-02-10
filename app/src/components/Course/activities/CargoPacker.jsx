import React, { useState, useCallback } from 'react';
import Feedback from '../../Common/Feedback';

export default function CargoPacker({ items, maxWeight, minEssentials, onComplete }) {
  const [packed, setPacked] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });

  const currentWeight = packed.reduce((sum, idx) => sum + items[idx].weight, 0);
  const weightPercent = (currentWeight / maxWeight) * 100;
  const packedEssentials = packed.filter((idx) => items[idx].essential).length;

  const handleItemDrop = useCallback((itemIdx) => {
    if (packed.includes(itemIdx)) return;

    const item = items[itemIdx];
    const wouldExceed = currentWeight + item.weight > maxWeight;

    if (wouldExceed) {
      setFeedback({
        show: true,
        type: 'error',
        message: 'Too heavy! This item would exceed capacity.',
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    setPacked((prev) => [...prev, itemIdx]);
  }, [packed, items, currentWeight, maxWeight]);

  const handleRemove = useCallback((itemIdx) => {
    setPacked((prev) => prev.filter((idx) => idx !== itemIdx));
  }, []);

  const handleCheck = useCallback(() => {
    const hasMinEssentials = packedEssentials >= minEssentials;
    const withinCapacity = currentWeight <= maxWeight;

    if (!withinCapacity) {
      setFeedback({
        show: true,
        type: 'error',
        message: 'Cargo is too heavy!',
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    if (!hasMinEssentials) {
      setFeedback({
        show: true,
        type: 'error',
        message: `Pack at least ${minEssentials} essential items!`,
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    setFeedback({
      show: true,
      type: 'success',
      message: 'Perfect cargo load! Ready for launch! 🚀',
    });
    setTimeout(() => {
      onComplete?.();
    }, 1000);
  }, [packedEssentials, currentWeight, maxWeight, minEssentials, onComplete]);

  const availableItems = items.filter((_, idx) => !packed.includes(idx));

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Items */}
        <div className="bg-bg2 border border-glass-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Cargo Items
          </h3>
          <div className="space-y-2">
            {availableItems.map((item, idx) => {
              const actualIdx = items.indexOf(item);
              return (
                <div
                  key={actualIdx}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('itemIdx', actualIdx.toString());
                  }}
                  className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 hover:border-cyan-400 cursor-move active:scale-95 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{item.emoji}</span>
                      <div>
                        <div className="font-semibold text-sm text-text">{item.name}</div>
                        <div className="text-xs text-text-secondary">{item.weight}kg</div>
                      </div>
                    </div>
                    {item.essential && (
                      <span className="text-xs font-bold bg-red-500/30 border border-red-400 px-2 py-1 rounded">
                        Essential
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cargo Bay */}
        <div className="space-y-4">
          {/* Weight Bar */}
          <div className="bg-bg2 border border-glass-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Cargo Bay
            </h3>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text">{currentWeight} / {maxWeight} kg</span>
                <span className="text-text-secondary">{Math.round(weightPercent)}%</span>
              </div>
              <div className="h-4 bg-bg3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    weightPercent <= 70
                      ? 'bg-green-500'
                      : weightPercent <= 90
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(weightPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Packed Items */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const itemIdx = parseInt(e.dataTransfer.getData('itemIdx'), 10);
                handleItemDrop(itemIdx);
              }}
              className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-2 border-dashed border-purple-400/50 rounded-lg p-4 min-h-40"
            >
              {packed.length > 0 ? (
                <div className="space-y-2">
                  {packed.map((itemIdx) => {
                    const item = items[itemIdx];
                    return (
                      <div
                        key={itemIdx}
                        onClick={() => handleRemove(itemIdx)}
                        className={`p-3 rounded-lg border-2 cursor-pointer hover:opacity-70 transition-all flex items-center justify-between ${
                          item.essential
                            ? 'bg-red-500/20 border-red-400'
                            : 'bg-green-500/20 border-green-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{item.emoji}</span>
                          <div className="text-sm font-semibold text-text">{item.name}</div>
                        </div>
                        <span className="text-xs text-text-secondary">{item.weight}kg</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary text-sm italic">
                  Drag items here
                </div>
              )}
            </div>

            {/* Essentials Counter */}
            <div className="mt-3 text-sm">
              <span className="text-text-secondary">Essential items: </span>
              <span className={`font-bold ${packedEssentials >= minEssentials ? 'text-green-400' : 'text-red-400'}`}>
                {packedEssentials} / {minEssentials}
              </span>
            </div>
          </div>

          {/* Check Button */}
          <button
            onClick={handleCheck}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all active:scale-95"
          >
            Check Cargo
          </button>
        </div>
      </div>
    </div>
  );
}
