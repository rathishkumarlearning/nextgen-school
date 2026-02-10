import React, { useState, useCallback } from 'react';
import Feedback from '../../Common/Feedback';

export default function BlockBuilder({ blocks, minBlocks, onComplete }) {
  const [placed, setPlaced] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });

  const typeStyles = {
    if: 'bg-yellow-500/20 border-yellow-400 text-yellow-300',
    then: 'bg-green-500/20 border-green-400 text-green-300',
    else: 'bg-red-500/20 border-red-400 text-red-300',
    action: 'bg-cyan-500/20 border-cyan-400 text-cyan-300',
    sensor: 'bg-purple-500/20 border-purple-400 text-purple-300',
  };

  const typeEmojis = {
    if: '❓',
    then: '✓',
    else: '✗',
    action: '⚡',
    sensor: '👀',
  };

  const handleDrop = useCallback((blockId) => {
    if (!placed.includes(blockId)) {
      setPlaced((prev) => [...prev, blockId]);
    }
  }, [placed]);

  const handleRemove = useCallback((idx) => {
    setPlaced((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleCheck = useCallback(() => {
    if (placed.length < minBlocks) {
      setFeedback({
        show: true,
        type: 'error',
        message: `Place at least ${minBlocks} blocks!`,
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    setFeedback({
      show: true,
      type: 'success',
      message: 'Great logic! You built a solid program! 🎉',
    });
    setTimeout(() => {
      onComplete?.();
    }, 1000);
  }, [placed.length, minBlocks, onComplete]);

  const availableBlocks = blocks.filter((block) => !placed.includes(block.id));

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Palette */}
        <div className="bg-bg2 border border-glass-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Block Palette
          </h3>
          <div className="space-y-2">
            {availableBlocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('blockId', block.id);
                }}
                className={`p-3 rounded-lg border-2 cursor-move active:scale-95 transition-all flex items-center gap-2 ${typeStyles[block.type]}`}
              >
                <span>{typeEmojis[block.type]}</span>
                <span className="font-semibold text-sm">{block.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flowchart Area */}
        <div className="bg-bg2 border border-glass-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Flowchart ({placed.length}/{minBlocks})
          </h3>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const blockId = e.dataTransfer.getData('blockId');
              handleDrop(blockId);
            }}
            className="min-h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-2 border-dashed border-purple-400/50 rounded-lg p-4 flex flex-col gap-2"
          >
            {placed.length > 0 ? (
              <>
                {placed.map((blockId, idx) => {
                  const block = blocks.find((b) => b.id === blockId);
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => handleRemove(idx)}
                        className={`w-full p-3 rounded-lg border-2 cursor-pointer active:scale-95 transition-all flex items-center gap-2 ${typeStyles[block.type]}`}
                      >
                        <span>{typeEmojis[block.type]}</span>
                        <span className="font-semibold text-sm flex-1 text-left">{block.text}</span>
                        <span className="text-lg">×</span>
                      </button>
                      {idx < placed.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="text-purple-400 text-xl">↓</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary text-sm italic">
                Drag blocks here to build your program
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheck}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all active:scale-95"
      >
        Check Logic
      </button>
    </div>
  );
}
