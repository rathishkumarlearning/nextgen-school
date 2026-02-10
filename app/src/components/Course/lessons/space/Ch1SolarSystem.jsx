import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import SceneExplorer from '../../activities/SceneExplorer';
import SequenceBuilder from '../../activities/SequenceBuilder';

export default function Ch1SolarSystem({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [sceneComplete, setSceneComplete] = useState(false);
  const [sequenceComplete, setSequenceComplete] = useState(false);

  const planets = [
    { emoji: '☀️', x: 50, y: 50, name: 'Sun', fact: 'The Sun is a massive ball of hot gas. It provides heat and light for all planets!' },
    { emoji: '🪨', x: 15, y: 20, name: 'Mercury', fact: 'Closest to the Sun. It\'s hot and rocky with no atmosphere.' },
    { emoji: '🌍', x: 25, y: 65, name: 'Venus', fact: 'Hottest planet! Its thick atmosphere traps heat like a greenhouse.' },
    { emoji: '🌎', x: 60, y: 25, name: 'Earth', fact: 'Our home! It\'s the only planet with liquid water and life.' },
    { emoji: '🔴', x: 75, y: 75, name: 'Mars', fact: 'The red planet! Scientists study it to look for signs of ancient life.' },
    { emoji: '🪐', x: 35, y: 80, name: 'Jupiter', fact: 'Largest planet! It\'s a gas giant with a Great Red Spot storm.' },
    { emoji: '💫', x: 80, y: 40, name: 'Saturn', fact: 'Famous for its beautiful rings made of ice and rock!' },
    { emoji: '🌀', x: 10, y: 40, name: 'Uranus & Neptune', fact: 'Ice giants at the edge of our solar system, very cold and distant!' },
  ];

  const planetOrder = [
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus & Neptune',
  ];

  const handleSceneComplete = () => {
    setSceneComplete(true);
    addPoints(25, 'Planet explorer');
  };

  const handleSequenceComplete = () => {
    setSequenceComplete(true);
    addPoints(25, 'Planet order');
    if (sceneComplete) {
      completeChapter('space', 0);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Our solar system has a Sun at the center with 8 planets orbiting around it. Let's explore each one!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 1: Discover the Planets</h3>
        <p className="text-text-secondary">Click on each emoji to learn about the planets!</p>
      </div>

      <SceneExplorer
        items={planets}
        totalToFind={planets.length}
        onComplete={handleSceneComplete}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 2: Planet Order</h3>
        <p className="text-text-secondary">Can you arrange the planets in order from closest to farthest from the Sun?</p>
      </div>

      <SequenceBuilder
        items={planetOrder}
        correctOrder={[0, 1, 2, 3, 4, 5, 6]}
        slotCount={7}
        onComplete={handleSequenceComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Our Solar System</h4>
        <p className="text-text-secondary">
          Our solar system formed about 4.6 billion years ago! The Sun is so massive that its gravity keeps all planets in orbit. Each planet is unique with its own atmosphere, weather, and characteristics.
        </p>
      </div>
    </div>
  );
}
