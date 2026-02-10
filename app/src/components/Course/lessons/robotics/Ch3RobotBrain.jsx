import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import BlockBuilder from '../../activities/BlockBuilder';

export default function Ch3RobotBrain({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const blocks = [
    { id: 'if1', type: 'if', text: 'If object detected' },
    { id: 'if2', type: 'if', text: 'If battery low' },
    { id: 'then1', type: 'then', text: 'Then stop moving' },
    { id: 'then2', type: 'then', text: 'Then turn left' },
    { id: 'else1', type: 'else', text: 'Else continue' },
    { id: 'action1', type: 'action', text: 'Move forward' },
    { id: 'action2', type: 'action', text: 'Beep sound' },
    { id: 'sensor1', type: 'sensor', text: 'Check sensors' },
  ];

  const handleComplete = () => {
    addPoints(50, 'Robot logic programming');
    completeChapter('robotics', 2);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          A robot's "brain" is the program that tells it how to think and decide. It uses IF/THEN logic to make decisions!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Build Robot Logic</h3>
        <p className="text-text-secondary">
          Drag logic blocks to create a program. Start with SENSOR or IF, follow with THEN, and optionally add ELSE!
        </p>
      </div>

      <BlockBuilder
        blocks={blocks}
        minBlocks={3}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Programming Logic</h4>
        <div className="space-y-3 text-text-secondary">
          <div>
            <strong className="text-cyan-400">❓ IF:</strong> A condition to check (e.g., "if obstacle detected")
          </div>
          <div>
            <strong className="text-green-400">✓ THEN:</strong> What to do if the condition is true (e.g., "then stop")
          </div>
          <div>
            <strong className="text-red-400">✗ ELSE:</strong> What to do if the condition is false (optional)
          </div>
          <div>
            <strong className="text-cyan-400">⚡ ACTION:</strong> Something the robot does (move, beep, turn)
          </div>
          <div>
            <strong className="text-purple-400">👀 SENSOR:</strong> Information the robot gathers (temperature, distance)
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Example Program</h4>
        <div className="space-y-2 text-text-secondary font-mono text-sm">
          <div>1. Check sensors for obstacles</div>
          <div>2. IF obstacle detected</div>
          <div>3. THEN stop and turn left</div>
          <div>4. ELSE continue moving forward</div>
        </div>
      </div>
    </div>
  );
}
