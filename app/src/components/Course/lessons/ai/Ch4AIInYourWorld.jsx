import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import SceneExplorer from '../../activities/SceneExplorer';

export default function Ch4AIInYourWorld({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [sceneComplete, setSceneComplete] = useState(false);

  const items = [
    { emoji: '📱', x: 10, y: 20, name: 'Smartphone', fact: 'Your phone uses AI to recognize faces, predict what you\'ll type, and filter spam!' },
    { emoji: '📺', x: 70, y: 15, name: 'Smart TV', fact: 'Smart TVs use AI to recommend shows based on what you watch.' },
    { emoji: '🔊', x: 45, y: 60, name: 'Smart Speaker', fact: 'Alexa and Google Home listen and understand your voice commands using AI!' },
    { emoji: '🎮', x: 80, y: 55, name: 'Game Console', fact: 'Video game AI controls enemy characters and adapts to how you play.' },
    { emoji: '❄️', x: 25, y: 65, name: 'Smart Fridge', fact: 'Smart fridges can track what\'s inside and suggest recipes!' },
    { emoji: '🚗', x: 55, y: 80, name: 'Self-Driving Car', fact: 'Autonomous cars use AI to see the road, identify obstacles, and drive safely.' },
    { emoji: '💻', x: 35, y: 35, name: 'Laptop', fact: 'Your computer uses AI for spell-checking, auto-complete, and security.' },
    { emoji: '🌡️', x: 60, y: 30, name: 'Smart Thermostat', fact: 'Smart thermostats learn your preferences and save energy automatically.' },
  ];

  const handleSceneComplete = () => {
    setSceneComplete(true);
    addPoints(50, 'Scene explorer');
    completeChapter('ai', 3);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          AI is everywhere in your world! Let's explore a room filled with devices that use artificial intelligence.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Find the AI Devices</h3>
        <p className="text-text-secondary">
          Click on each emoji in the scene to discover what it is and how it uses AI.
        </p>
      </div>

      <SceneExplorer
        items={items}
        totalToFind={items.length}
        onComplete={handleSceneComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">AI is All Around You!</h4>
        <p className="text-text-secondary mb-3">
          From the moment you wake up and check your phone, to watching your favorite shows and playing games, AI is helping you every day. It:
        </p>
        <ul className="space-y-2 text-text-secondary">
          <li>🎯 Learns your preferences and personalizes your experience</li>
          <li>🛡️ Keeps you safe by detecting unusual activity</li>
          <li>💡 Saves time by automating repetitive tasks</li>
          <li>🚀 Helps accomplish things that would be impossible without it</li>
        </ul>
      </div>
    </div>
  );
}
