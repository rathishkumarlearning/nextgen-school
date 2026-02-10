import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import BucketSort from '../../activities/BucketSort';

export default function Ch6RobotsAndAI({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [activityComplete, setActivityComplete] = useState(false);

  const items = [
    { name: 'Apple', value: 'apple', correctBucket: 'apple' },
    { name: 'Banana', value: 'banana', correctBucket: 'banana' },
    { name: 'Apple', value: 'apple2', correctBucket: 'apple' },
    { name: 'Banana', value: 'banana2', correctBucket: 'banana' },
    { name: 'Apple', value: 'apple3', correctBucket: 'apple' },
    { name: 'Banana', value: 'banana3', correctBucket: 'banana' },
  ];

  const buckets = [
    { id: 'apple', label: 'Apples', emoji: '🍎', color: 'red' },
    { id: 'banana', label: 'Bananas', emoji: '🍌', color: 'yellow' },
  ];

  const handleActivityComplete = () => {
    if (!activityComplete) {
      setActivityComplete(true);
      addPoints(50, 'AI sorting activity');
      completeChapter('robotics', 5);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          When you combine robotics with AI, you get amazing capabilities! AI helps robots make smart decisions and learn from experience.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: AI Robot Sorting</h3>
        <p className="text-text-secondary">
          Help an AI robot learn to sort fruit! Drag each item into the correct category. This simulates how real robots use computer vision to identify and sort items.
        </p>
      </div>

      <BucketSort
        items={items}
        buckets={buckets}
        onComplete={handleActivityComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Robots + AI = Superpowers</h4>
        <div className="space-y-3 text-text-secondary">
          <div>
            <strong className="text-cyan-400">Robotics</strong> provides the physical body - motors, sensors, and movement
          </div>
          <div>
            <strong className="text-purple-400">AI</strong> provides the brain - decision-making, learning, and adaptation
          </div>
          <div>
            <strong className="text-pink-400">Together:</strong> They create machines that can work autonomously in complex environments
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Real-World Examples</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>🚗 Self-driving cars use AI to understand traffic and make driving decisions</li>
          <li>🏥 Surgical robots use AI to make precise movements guided by surgeons</li>
          <li>📦 Warehouse robots use AI to sort packages quickly and accurately</li>
          <li>🤖 Social robots use AI to understand and respond to humans naturally</li>
        </ul>
      </div>
    </div>
  );
}
