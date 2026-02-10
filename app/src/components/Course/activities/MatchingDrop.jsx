import React, { useState, useCallback } from 'react';
import Feedback from '../../Common/Feedback';

export default function MatchingDrop({ draggables, dropZones, onComplete }) {
  const [matches, setMatches] = useState({});
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });
  const [incorrectZone, setIncorrectZone] = useState(null);

  const handleDrop = useCallback((dragValue, zoneId) => {
    const dragItem = draggables.find((d) => d.value === dragValue);
    const zone = dropZones.find((z) => z.id === zoneId);

    if (!dragItem || !zone) return;

    const isCorrect = dragValue === zone.answer || dragItem.correctZone === zoneId;

    if (isCorrect) {
      setMatches((prev) => ({
        ...prev,
        [zoneId]: dragValue,
      }));
      setFeedback({
        show: true,
        type: 'success',
        message: `${dragItem.name} matches with ${zone.label}! ✓`,
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 1500);

      // Check if complete
      const newMatches = { ...matches, [zoneId]: dragValue };
      if (Object.keys(newMatches).length === dropZones.length) {
        setTimeout(() => onComplete?.(), 500);
      }
    } else {
      setIncorrectZone(zoneId);
      setFeedback({
        show: true,
        type: 'error',
        message: `${dragItem.name} doesn't match ${zone.label}. Try again!`,
      });
      setTimeout(() => setIncorrectZone(null), 500);
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
    }
  }, [draggables, dropZones, matches, onComplete]);

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Draggables */}
        <div className="bg-bg2 border border-glass-border rounded-xl p-4 md:p-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Items to Match
          </h3>
          <div className="space-y-2">
            {draggables.map((item) => {
              const isMatched = Object.values(matches).includes(item.value);
              return (
                <div
                  key={item.value}
                  draggable={!isMatched}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('dragValue', item.value);
                  }}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                    isMatched
                      ? 'bg-green-500/20 border-green-400 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400/50 hover:border-cyan-400 cursor-move active:scale-95'
                  }`}
                >
                  <div className="font-semibold text-text">{item.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="space-y-3">
          {dropZones.map((zone) => {
            const matchedValue = matches[zone.id];
            const matchedItem = draggables.find((d) => d.value === matchedValue);
            const isWrong = incorrectZone === zone.id;

            return (
              <div
                key={zone.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const dragValue = e.dataTransfer.getData('dragValue');
                  handleDrop(dragValue, zone.id);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  matchedItem
                    ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20'
                    : isWrong
                    ? 'animate-bounce bg-red-500/20 border-red-400'
                    : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-dashed border-purple-400/50 hover:border-purple-400'
                }`}
              >
                <h4 className="font-bold text-sm md:text-base mb-2">{zone.label}</h4>
                {matchedItem ? (
                  <div className="bg-green-400/20 border border-green-400 rounded-lg p-2 text-sm font-semibold text-text flex items-center justify-between">
                    <span>✓ {matchedItem.name}</span>
                  </div>
                ) : (
                  <div className="text-text-secondary text-sm italic">Drag item here</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
