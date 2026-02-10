import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import SequenceBuilder from '../../activities/SequenceBuilder';
import BucketSort from '../../activities/BucketSort';

export default function Ch2HowAILearns({ onComplete }) {
  const { addPoints, completeChapter, gameState } = useGame();
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [animalComplete, setAnimalComplete] = useState(false);

  const sequenceItems = [
    'Collect Data',
    'Clean Data',
    'Train Model',
    'Test It',
    'Improve',
  ];

  const animalItems = [
    { name: 'Whiskers', value: 'whiskers', correctBucket: 'cat' },
    { name: 'Buddy', value: 'buddy', correctBucket: 'dog' },
    { name: 'Mittens', value: 'mittens', correctBucket: 'cat' },
    { name: 'Poodle', value: 'poodle', correctBucket: 'dog' },
    { name: 'Luna', value: 'luna', correctBucket: 'cat' },
    { name: 'Rex', value: 'rex', correctBucket: 'dog' },
  ];

  const animalBuckets = [
    { id: 'cat', label: 'Cats', emoji: '🐱', color: 'blue' },
    { id: 'dog', label: 'Dogs', emoji: '🐕', color: 'green' },
  ];

  const handleSequenceComplete = () => {
    if (!sequenceComplete) {
      setSequenceComplete(true);
      addPoints(25, 'Sequence activity');
    }
  };

  const handleAnimalComplete = () => {
    if (!animalComplete) {
      setAnimalComplete(true);
      addPoints(25, 'Animal sorting');
      if (sequenceComplete) {
        completeChapter('ai', 1);
        onComplete?.();
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          AI learns by following these steps. Each step is important to teaching AI how to make good decisions!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 1: AI Learning Steps</h3>
        <p className="text-text-secondary">
          Drag the steps into the correct order to show how AI learns.
        </p>
      </div>

      <SequenceBuilder
        items={sequenceItems}
        correctOrder={[0, 1, 2, 3, 4]}
        slotCount={5}
        onComplete={handleSequenceComplete}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 2: Train Like AI</h3>
        <p className="text-text-secondary">
          Now let's practice like AI does! Sort these animals into cats and dogs. AI does this by learning from examples.
        </p>
      </div>

      <BucketSort
        items={animalItems}
        buckets={animalBuckets}
        onComplete={handleAnimalComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">How AI Learns</h4>
        <p className="text-text-secondary">
          AI learns like you do! When you see many cats and dogs, you learn to recognize them quickly. AI does the same with data. It sees thousands of examples and learns the patterns that make something a cat or dog.
        </p>
      </div>
    </div>
  );
}
