import React, { useState, useCallback } from 'react';

export default function SceneExplorer({ items, totalToFind, onComplete }) {
  const [discovered, setDiscovered] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = useCallback((item, idx) => {
    if (!discovered.has(idx)) {
      const newDiscovered = new Set(discovered);
      newDiscovered.add(idx);
      setDiscovered(newDiscovered);

      if (newDiscovered.size === totalToFind) {
        setTimeout(() => onComplete?.(), 500);
      }
    }
    setSelectedItem(item);
  }, [discovered, totalToFind, onComplete]);

  return (
    <div className="space-y-6">
      {/* Counter */}
      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-lg px-4 py-2">
          <p className="text-sm text-text-secondary">Found</p>
          <p className="text-2xl font-bold text-cyan-400">
            {discovered.size} / {totalToFind}
          </p>
        </div>
      </div>

      {/* Scene */}
      <div className="relative w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-glass-border" style={{ aspectRatio: '16/10' }}>
        {items.map((item, idx) => {
          const isDiscovered = discovered.has(idx);
          const isSelected = selectedItem === item;

          return (
            <button
              key={idx}
              onClick={() => handleItemClick(item, idx)}
              className={`absolute text-4xl md:text-6xl transition-all cursor-pointer ${
                isDiscovered ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              } ${isSelected ? 'scale-125 drop-shadow-lg' : 'scale-100'}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.25)' : 'scale(1)'}`,
              }}
              title={isDiscovered ? item.name : 'Unknown'}
            >
              {item.emoji}
            </button>
          );
        })}

        {/* Info Popup */}
        {selectedItem && discovered.has(items.indexOf(selectedItem)) && (
          <div className="absolute bottom-6 left-6 right-6 bg-bg2 border border-cyan-400 rounded-lg p-4 max-w-sm">
            <h4 className="font-bold text-lg mb-2">{selectedItem.name}</h4>
            <p className="text-sm text-text-secondary">{selectedItem.fact}</p>
          </div>
        )}
      </div>

      {/* Discovered Items List */}
      <div className="bg-bg2 border border-glass-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
          Discovered Items
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((item, idx) => {
            const isDiscovered = discovered.has(idx);
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg text-center transition-all ${
                  isDiscovered
                    ? 'bg-green-500/20 border border-green-400'
                    : 'bg-bg3 border border-glass-border opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-xs font-semibold text-text">{isDiscovered ? item.name : '???'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
