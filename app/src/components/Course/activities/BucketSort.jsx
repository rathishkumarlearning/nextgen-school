import React, { useState, useCallback } from 'react';
import { useDragDrop } from '../../../hooks/useDragDrop';
import Feedback from '../../Common/Feedback';

export default function BucketSort({ items, buckets, onComplete }) {
  const { activeId } = useDragDrop();
  const [placements, setPlacements] = useState({});
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });
  const [shaking, setShaking] = useState(null);

  const itemLookup = Object.fromEntries(items.map((item) => [item.value, item]));
  const bucketLookup = Object.fromEntries(buckets.map((bucket) => [bucket.id, bucket]));

  const handleItemDrop = useCallback((itemValue, bucketId) => {
    const item = itemLookup[itemValue];
    const bucket = bucketLookup[bucketId];

    if (!item || !bucket) return;

    const isCorrect = item.value === bucket.answer || bucket.id === item.correctBucket;

    if (isCorrect) {
      setPlacements((prev) => ({
        ...prev,
        [itemValue]: bucketId,
      }));
      setFeedback({
        show: true,
        type: 'success',
        message: `${item.name} goes in ${bucket.label}! ✓`,
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
    } else {
      setShaking(bucketId);
      setFeedback({
        show: true,
        type: 'error',
        message: `Try again! ${item.name} doesn't belong in ${bucket.label}.`,
      });
      setTimeout(() => setShaking(null), 500);
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2500);
    }
  }, [itemLookup, bucketLookup]);

  const handleCheck = useCallback(() => {
    const allPlaced = items.every((item) => placements[item.value]);
    const allCorrect = items.every((item) => {
      const bucketId = placements[item.value];
      return bucketId && (item.value === itemLookup[item.value].value);
    });

    if (!allPlaced) {
      setFeedback({
        show: true,
        type: 'error',
        message: 'Make sure all items are sorted!',
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    if (allCorrect) {
      setFeedback({
        show: true,
        type: 'success',
        message: 'Perfect! You sorted everything correctly! 🎉',
      });
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [items, placements, itemLookup, onComplete]);

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      {/* Source Items */}
      <div className="bg-bg2 border border-glass-border rounded-xl p-4 md:p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
          Items to Sort
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {items.map((item) => {
            const isPlaced = placements[item.value];
            return (
              <div
                key={item.value}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('itemValue', item.value);
                }}
                className={`p-3 md:p-4 rounded-lg text-center cursor-move transition-all ${
                  isPlaced
                    ? 'bg-green-500/30 border border-green-400 opacity-50'
                    : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 hover:border-cyan-400 active:scale-95'
                }`}
              >
                <div className="text-lg font-semibold text-text">{item.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {buckets.map((bucket) => {
          const itemsInBucket = items.filter((item) => placements[item.value] === bucket.id);
          return (
            <div
              key={bucket.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const itemValue = e.dataTransfer.getData('itemValue');
                handleItemDrop(itemValue, bucket.id);
              }}
              className={`min-h-40 p-4 rounded-xl border-2 transition-all ${
                shaking === bucket.id ? 'animate-bounce' : ''
              } ${
                bucket.color === 'blue'
                  ? 'bg-blue-500/10 border-blue-400'
                  : bucket.color === 'green'
                  ? 'bg-green-500/10 border-green-400'
                  : bucket.color === 'red'
                  ? 'bg-red-500/10 border-red-400'
                  : bucket.color === 'yellow'
                  ? 'bg-yellow-500/10 border-yellow-400'
                  : 'bg-purple-500/10 border-purple-400'
              }`}
            >
              <h4 className="font-bold text-sm md:text-base mb-3 flex items-center gap-2">
                {bucket.emoji && <span className="text-xl">{bucket.emoji}</span>}
                {bucket.label}
              </h4>
              <div className="space-y-2">
                {itemsInBucket.map((item) => (
                  <div
                    key={item.value}
                    className="bg-green-400/20 border border-green-400 rounded-lg p-2 text-sm font-semibold text-text"
                  >
                    ✓ {item.name}
                  </div>
                ))}
                {itemsInBucket.length === 0 && (
                  <div className="text-text-secondary text-sm italic">Drag items here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheck}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all active:scale-95"
      >
        Check Answer
      </button>
    </div>
  );
}
