import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import MazeNavigator from '../../activities/MazeNavigator';

export default function Ch4RobotMovement({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  // 7x7 maze with walls (1) and paths (0)
  const maze = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 1],
  ];

  const start = [1, 1];
  const goal = [5, 5];

  const handleComplete = () => {
    addPoints(50, 'Maze navigation');
    completeChapter('robotics', 3);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Robots need precise movement commands to navigate through spaces. Can you guide a robot through this maze?
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Navigate the Maze</h3>
        <p className="text-text-secondary">
          Click the arrow buttons to command the robot. Plan your route from start 🏁 to goal 🎯, then press Run!
        </p>
      </div>

      <MazeNavigator
        grid={maze}
        start={start}
        goal={goal}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Robot Navigation</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>🗺️ <strong>Planning:</strong> Robots need a map or instructions to navigate</li>
          <li>➡️ <strong>Movement:</strong> Each step is a discrete movement command</li>
          <li>🎯 <strong>Goals:</strong> The robot tries to reach its destination</li>
          <li>🚧 <strong>Obstacles:</strong> Robots must detect and avoid walls</li>
          <li>🔄 <strong>Feedback:</strong> Sensors tell the robot where it is</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Real-World Navigation</h4>
        <p className="text-text-secondary">
          Autonomous vehicles and delivery robots use similar logic! They build maps, plan routes, and execute movement commands while avoiding obstacles. This is how self-driving cars navigate city streets!
        </p>
      </div>
    </div>
  );
}
