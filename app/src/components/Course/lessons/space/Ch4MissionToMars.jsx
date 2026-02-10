import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import CargoPacker from '../../activities/CargoPacker';

export default function Ch4MissionToMars({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const supplies = [
    { emoji: '🥗', name: 'Food', weight: 200, essential: true },
    { emoji: '💧', name: 'Water', weight: 300, essential: true },
    { emoji: '💨', name: 'Oxygen', weight: 150, essential: true },
    { emoji: '☀️', name: 'Solar Panels', weight: 100, essential: true },
    { emoji: '🔧', name: 'Tools', weight: 50, essential: true },
    { emoji: '⚕️', name: 'Medical Kit', weight: 80, essential: true },
    { emoji: '📡', name: 'Communication', weight: 60, essential: true },
    { emoji: '🧑‍🚀', name: 'Space Suits', weight: 120, essential: false },
    { emoji: '🚙', name: 'Rover', weight: 200, essential: false },
    { emoji: '🔬', name: 'Science Lab', weight: 150, essential: false },
    { emoji: '🎮', name: 'Entertainment', weight: 20, essential: false },
    { emoji: '🌱', name: 'Seeds', weight: 10, essential: false },
  ];

  const handleComplete = () => {
    addPoints(50, 'Mars mission cargo');
    completeChapter('space', 3);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          A mission to Mars needs careful planning! You must pack everything needed to survive, but the spacecraft has weight limits.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Pack for Mars</h3>
        <p className="text-text-secondary">
          Pack supplies for a Mars mission. You have 1000 kg capacity. You MUST include at least 7 essential items!
        </p>
      </div>

      <CargoPacker
        items={supplies}
        maxWeight={1000}
        minEssentials={7}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Mars Mission Facts</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>🔴 <strong>Distance:</strong> 225 million km away (farther than Venus)</li>
          <li>⏱️ <strong>Travel Time:</strong> 6-9 months to reach Mars</li>
          <li>❄️ <strong>Temperature:</strong> -80°C at night, -20°C during day</li>
          <li>💨 <strong>Atmosphere:</strong> 95% carbon dioxide, very thin</li>
          <li>🏜️ <strong>Surface:</strong> Desert-like with canyons and volcanoes</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Why Mars?</h4>
        <p className="text-text-secondary">
          Mars is the next frontier for human exploration! Scientists believe Mars once had liquid water and possibly life. By studying Mars, we learn about planetary evolution and humanity's future in space.
        </p>
      </div>
    </div>
  );
}
