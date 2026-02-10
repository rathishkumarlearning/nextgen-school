import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import SequenceBuilder from '../../activities/SequenceBuilder';
import FlipCards from '../../activities/FlipCards';

export default function Ch2LifeOfAStar({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [flipComplete, setFlipComplete] = useState(false);

  const starStages = [
    'Nebula (Cloud of gas)',
    'Protostar (Forming)',
    'Main Sequence (Stable adult)',
    'Red Giant (Expanding)',
    'Supernova/White Dwarf (Final)',
  ];

  const starCards = [
    {
      emoji: '☁️',
      frontTitle: 'Nebula',
      backTitle: 'Star Nursery',
      backText: 'A massive cloud of gas and dust floating in space. This is where stars begin to form!',
    },
    {
      emoji: '✨',
      frontTitle: 'Protostar',
      backTitle: 'Baby Star',
      backText: 'Gas and dust are collapsing together. It\'s getting hotter and denser as gravity pulls inward.',
    },
    {
      emoji: '⭐',
      frontTitle: 'Main Sequence',
      backTitle: 'Stable Star',
      backText: 'Stars spend most of their lives here. The Sun is in this stage! It fuses hydrogen into helium.',
    },
    {
      emoji: '🔴',
      frontTitle: 'Red Giant',
      backTitle: 'Aging Star',
      backText: 'The star expands as it runs out of fuel. It becomes huge and red, sometimes engulfing nearby planets!',
    },
    {
      emoji: '💥',
      frontTitle: 'Supernova',
      backTitle: 'Star\'s Death',
      backText: 'A massive explosion! The star either collapses into a white dwarf or becomes a black hole.',
    },
  ];

  const handleSequenceComplete = () => {
    setSequenceComplete(true);
    addPoints(25, 'Star lifecycle sequence');
  };

  const handleFlipComplete = () => {
    setFlipComplete(true);
    addPoints(25, 'Star facts');
    if (sequenceComplete) {
      completeChapter('space', 1);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Stars aren't eternal. They are born, live long lives, and eventually die. Let's trace the life of a star!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 1: Star Lifecycle</h3>
        <p className="text-text-secondary">Put the star stages in the correct order.</p>
      </div>

      <SequenceBuilder
        items={starStages}
        correctOrder={[0, 1, 2, 3, 4]}
        slotCount={5}
        onComplete={handleSequenceComplete}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 2: Star Facts</h3>
        <p className="text-text-secondary">Flip each card to learn about different star stages!</p>
      </div>

      <FlipCards
        cards={starCards}
        onComplete={handleFlipComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Star Lifespan</h4>
        <p className="text-text-secondary">
          Stars like our Sun live for about 10 billion years! Larger stars live shorter lives but burn brighter. When stars die, they create all the elements that make up planets and eventually life!
        </p>
      </div>
    </div>
  );
}
