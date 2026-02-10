import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import MatchingDrop from '../../activities/MatchingDrop';

export default function Ch6SpaceAI({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const tools = [
    { value: 'rover', name: 'Rover Navigation', correctZone: 'routing' },
    { value: 'telescope', name: 'Image Analysis', correctZone: 'analysis' },
    { value: 'robotics', name: 'Repair Tasks', correctZone: 'maintenance' },
    { value: 'prediction', name: 'Solar Storm Prediction', correctZone: 'forecasting' },
  ];

  const problems = [
    { id: 'routing', label: 'Finding Safe Routes', answer: 'rover' },
    { id: 'analysis', label: 'Identifying New Planets', answer: 'telescope' },
    { id: 'maintenance', label: 'Repairing Satellites', answer: 'robotics' },
    { id: 'forecasting', label: 'Predicting Space Weather', answer: 'prediction' },
  ];

  const handleComplete = () => {
    addPoints(50, 'Space AI matching');
    completeChapter('space', 5);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          AI is essential for modern space exploration! It helps rovers navigate, telescopes analyze images, and satellites stay safe.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Match AI Tools to Space Problems</h3>
        <p className="text-text-secondary">
          Drag each AI tool to the space problem it solves!
        </p>
      </div>

      <MatchingDrop
        draggables={tools}
        dropZones={problems}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">AI in Space Exploration</h4>
        <ul className="space-y-3 text-text-secondary">
          <li>
            <strong className="text-cyan-400">🚙 Rover Navigation:</strong> AI helps rovers avoid obstacles and find interesting rocks without waiting for commands from Earth
          </li>
          <li>
            <strong className="text-purple-400">🔭 Image Analysis:</strong> AI processes millions of telescope images to identify new planets and galaxies
          </li>
          <li>
            <strong className="text-pink-400">🔧 Satellite Repair:</strong> Robotic arms with AI can repair damaged satellites in orbit
          </li>
          <li>
            <strong className="text-yellow-400">⛈️ Space Weather:</strong> AI predicts solar storms that could damage communications
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Future of Space Exploration</h4>
        <p className="text-text-secondary">
          As we explore farther into space, AI becomes more critical. Mars rovers must make decisions independently because radio signals take 20+ minutes to reach Mars! AI is the key to humanity's future in space.
        </p>
      </div>
    </div>
  );
}
