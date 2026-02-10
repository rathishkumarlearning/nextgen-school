import React from 'react';

export default function RobotPreview({ parts }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-bg2 to-bg3 border border-glass-border rounded-xl p-8 flex flex-col items-center justify-center min-h-80">
        {/* Robot Display */}
        <div className="text-center">
          <div className="text-7xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold text-text mb-6">Your Robot</h3>

          {/* Parts List */}
          {parts && parts.length > 0 && (
            <div className="bg-bg1 border border-glass-border rounded-lg p-4 max-w-xs">
              <h4 className="text-sm font-semibold text-text-secondary mb-3 uppercase">Components</h4>
              <div className="space-y-2">
                {parts.map((part, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-left p-2 bg-cyan-500/10 border border-cyan-400/30 rounded">
                    <span className="text-lg">{part.emoji}</span>
                    <span className="text-sm font-semibold text-text">{part.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
