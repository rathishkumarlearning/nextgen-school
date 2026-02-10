import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import BucketSort from '../../activities/BucketSort';
import FlipCards from '../../activities/FlipCards';

export default function Ch1WhatIsARobot({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [bucketComplete, setBucketComplete] = useState(false);
  const [flipComplete, setFlipComplete] = useState(false);

  const items = [
    { name: 'Roomba', value: 'roomba', correctBucket: 'robot' },
    { name: 'Self-Driving Car', value: 'car', correctBucket: 'robot' },
    { name: 'Light Bulb', value: 'bulb', correctBucket: 'notrobot' },
    { name: 'Mars Rover', value: 'rover', correctBucket: 'robot' },
    { name: 'Teddy Bear', value: 'teddy', correctBucket: 'notrobot' },
    { name: 'Factory Arm', value: 'factory', correctBucket: 'robot' },
    { name: 'Book', value: 'book', correctBucket: 'notrobot' },
    { name: 'Robot Dog', value: 'dog', correctBucket: 'robot' },
    { name: 'Bicycle', value: 'bike', correctBucket: 'notrobot' },
    { name: 'Surgery Robot', value: 'surgery', correctBucket: 'robot' },
  ];

  const buckets = [
    { id: 'robot', label: 'Is a Robot', emoji: '🤖', color: 'blue' },
    { id: 'notrobot', label: 'Not a Robot', emoji: '⚙️', color: 'green' },
  ];

  const flipCards = [
    {
      emoji: '👀',
      frontTitle: 'SENSE',
      backTitle: 'Input Systems',
      backText: 'Robots use sensors like cameras, touch, and sound to understand their environment.',
    },
    {
      emoji: '🧠',
      frontTitle: 'THINK',
      backTitle: 'Processing',
      backText: 'Robots process information with computers. They decide what to do based on inputs.',
    },
    {
      emoji: '⚡',
      frontTitle: 'ACT',
      backTitle: 'Output Systems',
      backText: 'Robots use motors and actuators to move and interact with the world.',
    },
  ];

  const handleBucketComplete = () => {
    setBucketComplete(true);
    addPoints(25, 'Robot identification');
  };

  const handleFlipComplete = () => {
    setFlipComplete(true);
    addPoints(25, 'Robot cycle learning');
    if (bucketComplete) {
      completeChapter('robotics', 0);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          A robot is a machine that can sense its environment, think about what to do, and act on the world. All robots have these three things!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 1: Spot the Robots</h3>
        <p className="text-text-secondary">
          Sort items into robots and non-robots. Remember: real robots sense, think, and act!
        </p>
      </div>

      <BucketSort
        items={items}
        buckets={buckets}
        onComplete={handleBucketComplete}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 2: The Robot Cycle</h3>
        <p className="text-text-secondary">
          Every robot follows the same cycle: SENSE → THINK → ACT. Flip each card to learn more!
        </p>
      </div>

      <FlipCards
        cards={flipCards}
        onComplete={handleFlipComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">What Makes a Robot?</h4>
        <p className="text-text-secondary mb-3">
          Robots are programmable machines that:
        </p>
        <ul className="space-y-2 text-text-secondary">
          <li>🎯 Have a specific purpose or task</li>
          <li>👀 Use sensors to gather information</li>
          <li>🧠 Process information with computers</li>
          <li>⚡ Use motors and actuators to move</li>
          <li>🔄 Follow programmed instructions</li>
        </ul>
      </div>
    </div>
  );
}
