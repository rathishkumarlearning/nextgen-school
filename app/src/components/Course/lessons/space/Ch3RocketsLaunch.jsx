import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import RocketBuilder from '../../activities/RocketBuilder';

export default function Ch3RocketsLaunch({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const parts = [
    { emoji: '📌', name: 'Nose Cone', desc: 'Reduces air resistance' },
    { emoji: '📦', name: 'Payload', desc: 'Cargo like satellites' },
    { emoji: '⛽', name: 'Fuel Tank', desc: 'Stores rocket fuel' },
    { emoji: '⚙️', name: 'Engine', desc: 'Provides thrust' },
    { emoji: '🪶', name: 'Fins', desc: 'Keeps rocket stable' },
  ];

  const handleLaunch = () => {
    addPoints(50, 'Rocket launch');
    completeChapter('space', 2);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Rockets are engineering marvels! They need to be perfectly balanced to launch into space. Let's build a rocket!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Build Your Rocket</h3>
        <p className="text-text-secondary">Drag each rocket part into the correct slot. From top to bottom: Nose Cone, Payload, Fuel Tank, Engine, Fins.</p>
      </div>

      <RocketBuilder
        parts={parts}
        onLaunch={handleLaunch}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">How Rockets Work</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>🎯 <strong>Nose Cone:</strong> Cuts through air smoothly</li>
          <li>📦 <strong>Payload:</strong> The important cargo like satellites or astronauts</li>
          <li>⛽ <strong>Fuel Tank:</strong> Contains the fuel that powers the rocket</li>
          <li>⚙️ <strong>Engine:</strong> Combusts fuel and expels hot gases downward</li>
          <li>🪶 <strong>Fins:</strong> Keep the rocket on course through the air</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Newton's Third Law</h4>
        <p className="text-text-secondary">
          "For every action, there is an equal and opposite reaction." Rockets push hot gas downward, and the gas pushes the rocket upward! This is the physics that makes spaceflight possible.
        </p>
      </div>
    </div>
  );
}
