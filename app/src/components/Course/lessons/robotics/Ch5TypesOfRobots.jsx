import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import FlipCards from '../../activities/FlipCards';
import MatchingDrop from '../../activities/MatchingDrop';

export default function Ch5TypesOfRobots({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [flipComplete, setFlipComplete] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);

  const robotCards = [
    {
      emoji: '🤖',
      frontTitle: 'Industrial',
      backTitle: 'Factory Robots',
      backText: 'Build cars, assemble products, weld metal. They\'re strong, fast, and do repetitive tasks perfectly.',
    },
    {
      emoji: '🧹',
      frontTitle: 'Cleaning',
      backTitle: 'Service Robots',
      backText: 'Vacuum your house, mop floors, clean windows. They work autonomously to keep spaces clean.',
    },
    {
      emoji: '🚑',
      frontTitle: 'Medical',
      backTitle: 'Healthcare Robots',
      backText: 'Perform surgery with precision, deliver medicine, help patients. They save lives!',
    },
    {
      emoji: '🔬',
      frontTitle: 'Research',
      backTitle: 'Science Robots',
      backText: 'Explore deep oceans, distant planets, and tiny cells. They gather data humans can\'t reach.',
    },
    {
      emoji: '🎮',
      frontTitle: 'Entertainment',
      backTitle: 'Social Robots',
      backText: 'Dance, play, talk with humans. They\'re designed to be fun and interactive!',
    },
  ];

  const robots = [
    { value: 'robot_arm', name: 'Robotic Arm', correctZone: 'manufacturing' },
    { value: 'humanoid', name: 'Humanoid Robot', correctZone: 'service' },
    { value: 'drone', name: 'Drone', correctZone: 'inspection' },
    { value: 'surgical', name: 'Surgical Robot', correctZone: 'medical' },
  ];

  const jobs = [
    { id: 'manufacturing', label: 'Manufacturing', answer: 'robot_arm' },
    { id: 'service', label: 'Customer Service', answer: 'humanoid' },
    { id: 'inspection', label: 'Inspection & Delivery', answer: 'drone' },
    { id: 'medical', label: 'Surgery', answer: 'surgical' },
  ];

  const handleFlipComplete = () => {
    setFlipComplete(true);
    addPoints(25, 'Robot types learned');
  };

  const handleMatchComplete = () => {
    setMatchComplete(true);
    addPoints(25, 'Robot jobs matched');
    if (flipComplete) {
      completeChapter('robotics', 4);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          There are many types of robots designed for different jobs. Let's explore the varieties!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 1: Robot Types</h3>
        <p className="text-text-secondary">
          Flip each card to learn about different categories of robots!
        </p>
      </div>

      <FlipCards
        cards={robotCards}
        onComplete={handleFlipComplete}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 2: Match Robots to Jobs</h3>
        <p className="text-text-secondary">
          Drag each robot to the job it's best suited for!
        </p>
      </div>

      <MatchingDrop
        draggables={robots}
        dropZones={jobs}
        onComplete={handleMatchComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Robot Classifications</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>🏭 <strong>By Industry:</strong> Industrial, medical, service, entertainment</li>
          <li>📦 <strong>By Size:</strong> Microscopic, small, large, giant</li>
          <li>🌍 <strong>By Environment:</strong> Land, air, water, space</li>
          <li>🧠 <strong>By Intelligence:</strong> Simple automated, learning-based AI robots</li>
          <li>👥 <strong>By Role:</strong> Worker, helper, explorer, companion</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">The Future of Robots</h4>
        <p className="text-text-secondary">
          As technology advances, robots are becoming more capable, intelligent, and helpful. In the future, you might work alongside robot colleagues, live with robot companions, or explore space with robot explorers!
        </p>
      </div>
    </div>
  );
}
