import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import BucketSort from '../../activities/BucketSort';

export default function Ch6WhenAIGetsItWrong({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [activityComplete, setActivityComplete] = useState(false);

  const items = [
    { name: 'Earth is the 3rd planet', value: 'earth3rd', correctBucket: 'correct' },
    { name: 'Dinosaurs and humans lived together', value: 'dinoshumans', correctBucket: 'wrong' },
    { name: 'Water boils at 100°C', value: 'watercool', correctBucket: 'correct' },
    { name: 'The Moon is bigger than Earth', value: 'moonbig', correctBucket: 'wrong' },
    { name: 'Heart pumps blood', value: 'heartblood', correctBucket: 'correct' },
    { name: 'Penguins can fly', value: 'penguinsfly', correctBucket: 'wrong' },
    { name: 'The Sun is a star', value: 'sunstar', correctBucket: 'correct' },
    { name: 'Humans use only 10% of their brains', value: 'brain10pct', correctBucket: 'wrong' },
  ];

  const buckets = [
    { id: 'correct', label: 'This is Correct', emoji: '✓', color: 'green' },
    { id: 'wrong', label: 'This is Wrong', emoji: '✗', color: 'red' },
  ];

  const handleActivityComplete = () => {
    if (!activityComplete) {
      setActivityComplete(true);
      addPoints(50, 'Chapter 6 completion');
      completeChapter('ai', 5);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Even smart AI can make mistakes! It might sound confident but give wrong information. That's why it's important to check its work.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Fact Check</h3>
        <p className="text-text-secondary">
          Sort these statements into correct and incorrect. This is what we do when AI gives us answers!
        </p>
      </div>

      <BucketSort
        items={items}
        buckets={buckets}
        onComplete={handleActivityComplete}
      />

      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Why AI Gets Things Wrong</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>📊 <strong>Training data:</strong> If AI learned from bad information, it will repeat it</li>
          <li>❓ <strong>Ambiguous questions:</strong> Unclear questions get unclear answers</li>
          <li>🎲 <strong>Probability:</strong> AI makes its best guess, not always 100% right</li>
          <li>⏱️ <strong>Outdated info:</strong> AI might not know about recent events</li>
          <li>🌍 <strong>Knowledge gaps:</strong> AI doesn\'t know everything</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">How to Check AI</h4>
        <ol className="space-y-2 text-text-secondary list-decimal list-inside">
          <li>Ask yourself: Does this sound right?</li>
          <li>Look it up on trusted sites (Wikipedia, government sites, etc.)</li>
          <li>Ask a teacher, parent, or librarian</li>
          <li>Ask AI again with more specific details</li>
          <li>Cross-reference multiple sources</li>
        </ol>
      </div>
    </div>
  );
}
