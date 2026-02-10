import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import MatchingDrop from '../../activities/MatchingDrop';

export default function Ch2RobotSenses({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const sensors = [
    { value: 'camera', name: 'Camera', correctZone: 'sight' },
    { value: 'microphone', name: 'Microphone', correctZone: 'hearing' },
    { value: 'pressure', name: 'Pressure Sensor', correctZone: 'touch' },
    { value: 'proximity', name: 'Proximity Sensor', correctZone: 'detection' },
    { value: 'temperature', name: 'Temperature Sensor', correctZone: 'heat' },
  ];

  const situations = [
    { id: 'sight', label: 'Seeing Objects', answer: 'camera' },
    { id: 'hearing', label: 'Hearing Sounds', answer: 'microphone' },
    { id: 'touch', label: 'Feeling Contact', answer: 'pressure' },
    { id: 'detection', label: 'Detecting Distance', answer: 'proximity' },
    { id: 'heat', label: 'Measuring Warmth', answer: 'temperature' },
  ];

  const handleComplete = () => {
    addPoints(50, 'Robot sensors matching');
    completeChapter('robotics', 1);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Robots "sense" the world through different types of sensors, just like humans use eyes, ears, and skin!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Match Sensors to Situations</h3>
        <p className="text-text-secondary">
          Drag each sensor to the situation where it's most useful!
        </p>
      </div>

      <MatchingDrop
        draggables={sensors}
        dropZones={situations}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Types of Robot Sensors</h4>
        <ul className="space-y-3 text-text-secondary">
          <li>
            <strong className="text-cyan-400">📷 Vision (Camera):</strong> Helps robots see and identify objects, navigate, and read barcodes
          </li>
          <li>
            <strong className="text-purple-400">🎤 Audio (Microphone):</strong> Allows robots to hear commands and detect sounds in their environment
          </li>
          <li>
            <strong className="text-pink-400">👆 Touch (Pressure):</strong> Lets robots grip objects with right pressure and detect contact
          </li>
          <li>
            <strong className="text-yellow-400">📡 Proximity:</strong> Detects how far away objects are using ultrasound or IR light
          </li>
          <li>
            <strong className="text-green-400">🌡️ Temperature:</strong> Measures heat to ensure proper conditions in factories or HVAC systems
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Example: Vacuum Robot</h4>
        <p className="text-text-secondary">
          A robot vacuum like Roomba uses a proximity sensor to detect walls and obstacles, a camera to map the room, and pressure sensors to feel obstacles. Together, these sensors let it clean your house safely!
        </p>
      </div>
    </div>
  );
}
