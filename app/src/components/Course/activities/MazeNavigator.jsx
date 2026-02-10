import React, { useState, useCallback, useEffect } from 'react';
import Feedback from '../../Common/Feedback';

export default function MazeNavigator({ grid, start, goal, onComplete }) {
  const [position, setPosition] = useState(start);
  const [commands, setCommands] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });

  const addCommand = useCallback((direction) => {
    setCommands((prev) => [...prev, direction]);
  }, []);

  const clearCommands = useCallback(() => {
    setCommands([]);
    setPosition(start);
  }, [start]);

  const executeCommands = useCallback(async () => {
    if (commands.length === 0) {
      setFeedback({
        show: true,
        type: 'error',
        message: 'Add some commands first!',
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
      return;
    }

    setIsRunning(true);
    let currentPos = start;

    for (const command of commands) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      let newRow = currentPos[0];
      let newCol = currentPos[1];

      if (command === 'up') newRow--;
      if (command === 'down') newRow++;
      if (command === 'left') newCol--;
      if (command === 'right') newCol++;

      // Check bounds and walls
      if (
        newRow < 0 ||
        newRow >= grid.length ||
        newCol < 0 ||
        newCol >= grid[0].length ||
        grid[newRow][newCol] === 1
      ) {
        setFeedback({
          show: true,
          type: 'error',
          message: 'Hit a wall! Try again.',
        });
        setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
        setIsRunning(false);
        return;
      }

      currentPos = [newRow, newCol];
      setPosition([newRow, newCol]);
    }

    if (currentPos[0] === goal[0] && currentPos[1] === goal[1]) {
      setFeedback({
        show: true,
        type: 'success',
        message: 'You reached the goal! 🎉',
      });
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    } else {
      setFeedback({
        show: true,
        type: 'error',
        message: "Didn't reach the goal. Try a different path!",
      });
      setTimeout(() => setFeedback({ show: false, type: 'info', message: '' }), 2000);
    }

    setIsRunning(false);
  }, [commands, grid, start, goal, onComplete]);

  const directionButtons = [
    { dir: 'up', emoji: '⬆️', label: 'Up' },
    { dir: 'down', emoji: '⬇️', label: 'Down' },
    { dir: 'left', emoji: '⬅️', label: 'Left' },
    { dir: 'right', emoji: '➡️', label: 'Right' },
  ];

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maze Grid */}
        <div className="bg-bg2 border border-glass-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Maze
          </h3>
          <div className="inline-block border border-glass-border rounded-lg overflow-hidden">
            {grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => {
                  const isStart = rowIdx === start[0] && colIdx === start[1];
                  const isGoal = rowIdx === goal[0] && colIdx === goal[1];
                  const isRobot = rowIdx === position[0] && colIdx === position[1];
                  const isWall = cell === 1;

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`w-8 h-8 md:w-10 md:h-10 border border-glass-border flex items-center justify-center text-sm font-bold ${
                        isWall
                          ? 'bg-gray-800'
                          : isGoal
                          ? 'bg-green-500/30'
                          : isStart
                          ? 'bg-blue-500/30'
                          : 'bg-bg3'
                      }`}
                    >
                      {isRobot && '🤖'}
                      {isGoal && !isRobot && '🎯'}
                      {isStart && !isRobot && '🏁'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Commands */}
        <div className="space-y-4">
          {/* Direction Buttons */}
          <div className="bg-bg2 border border-glass-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Add Commands
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {directionButtons.map((btn) => (
                <button
                  key={btn.dir}
                  onClick={() => addCommand(btn.dir)}
                  disabled={isRunning}
                  className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-xl"
                >
                  {btn.emoji}
                </button>
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                onClick={clearCommands}
                disabled={isRunning}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-all text-sm font-semibold"
              >
                Clear
              </button>
              <button
                onClick={executeCommands}
                disabled={isRunning}
                className="flex-1 px-4 py-2 bg-green-500/20 border border-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 transition-all text-sm font-semibold"
              >
                Run
              </button>
            </div>
          </div>

          {/* Command Sequence Display */}
          <div className="bg-bg2 border border-glass-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Command Sequence ({commands.length})
            </h3>
            {commands.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {commands.map((cmd, idx) => {
                  const emojiMap = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
                  return (
                    <div
                      key={idx}
                      className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 rounded-lg text-sm font-semibold text-text"
                    >
                      {idx + 1}. {emojiMap[cmd]}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-text-secondary text-sm italic">No commands yet. Add some above!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
