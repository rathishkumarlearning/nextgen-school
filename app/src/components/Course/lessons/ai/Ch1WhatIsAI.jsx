import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import BucketSort from '../../activities/BucketSort';

export default function Ch1WhatIsAI({ onComplete }) {
  const { addPoints, completeChapter, gameState } = useGame();
  const [activityComplete, setActivityComplete] = useState(false);

  const items = [
    { name: 'Alexa', value: 'alexa', correctBucket: 'ai' },
    { name: 'Siri', value: 'siri', correctBucket: 'ai' },
    { name: 'Netflix Suggestions', value: 'netflix', correctBucket: 'ai' },
    { name: 'Google Search', value: 'googlesearch', correctBucket: 'ai' },
    { name: 'Face Filters', value: 'facefilters', correctBucket: 'ai' },
    { name: 'Light Switch', value: 'lightswitch', correctBucket: 'noai' },
    { name: 'Bicycle', value: 'bicycle', correctBucket: 'noai' },
    { name: 'Paper Book', value: 'paperbook', correctBucket: 'noai' },
    { name: 'Game NPCs', value: 'gamenpcs', correctBucket: 'ai' },
    { name: 'Alarm Clock', value: 'alarmclock', correctBucket: 'noai' },
    { name: 'Google Maps', value: 'googlemaps', correctBucket: 'ai' },
  ];

  const buckets = [
    { id: 'ai', label: 'Uses AI', emoji: '🤖', color: 'blue' },
    { id: 'noai', label: 'No AI', emoji: '⚙️', color: 'green' },
  ];

  const handleActivityComplete = () => {
    if (!activityComplete) {
      setActivityComplete(true);
      addPoints(50, 'Chapter 1 completion');
      completeChapter('ai', 0);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          AI (Artificial Intelligence) is all around us! It learns from data and makes decisions, just like we do. Let's explore which everyday tools use AI and which don't.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Sort the Items</h3>
        <p className="text-text-secondary">
          Drag each item into the correct bucket. AI tools learn and adapt, while regular tools just follow fixed instructions.
        </p>
      </div>

      <BucketSort
        items={items}
        buckets={buckets}
        onComplete={handleActivityComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Key Idea</h4>
        <p className="text-text-secondary">
          AI is smart software that learns patterns from examples. A light switch just turns on or off, but AI can recognize your face, suggest movies you'll like, and answer your questions. The more data AI sees, the better it gets!
        </p>
      </div>
    </div>
  );
}
