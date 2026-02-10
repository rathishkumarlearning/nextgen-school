import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import MultiStepWizard from '../../activities/MultiStepWizard';

export default function Ch8DesignMission({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const steps = [
    {
      id: 'destination',
      title: 'Choose Your Destination',
      description: 'Where would you like to explore?',
      type: 'choice',
      options: [
        { value: 'moon', label: 'The Moon', emoji: '🌙', desc: 'Nearby, great for bases' },
        { value: 'mars', label: 'Mars', emoji: '🔴', desc: 'The red planet' },
        { value: 'saturn', label: 'Saturn', emoji: '💫', desc: 'Icy distant adventure' },
        { value: 'europa', label: 'Europa', emoji: '❄️', desc: 'Moon with ice ocean' },
      ],
    },
    {
      id: 'crew',
      title: 'Build Your Crew',
      description: 'What skills do you need?',
      type: 'choice',
      options: [
        { value: 'scientist', label: 'Scientists', emoji: '🔬', desc: 'Discover new things' },
        { value: 'engineer', label: 'Engineers', emoji: '⚙️', desc: 'Build & fix things' },
        { value: 'medic', label: 'Medical Officer', emoji: '⚕️', desc: 'Keep crew healthy' },
        { value: 'pilot', label: 'Pilot', emoji: '🧑‍🚀', desc: 'Navigate safely' },
      ],
    },
    {
      id: 'equipment',
      title: 'Pack Equipment',
      description: 'What tools will you bring?',
      type: 'choice',
      options: [
        { value: 'samples', label: 'Sample Collection', emoji: '🧪', desc: 'Study rocks & soil' },
        { value: 'habitat', label: 'Habitat Module', emoji: '🏠', desc: 'Safe shelter' },
        { value: 'research', label: 'Research Lab', emoji: '🔭', desc: 'Scientific equipment' },
        { value: 'rover', label: 'Exploration Rover', emoji: '🚙', desc: 'Travel & explore' },
      ],
    },
    {
      id: 'mission_name',
      title: 'Name Your Mission',
      description: 'Give your mission an inspiring name!',
      type: 'input',
      placeholder: 'e.g., Project Nova, Horizon Quest...',
    },
    {
      id: 'summary',
      title: 'Your Space Mission',
      description: 'Here\'s the mission you\'ve designed!',
      type: 'summary',
      items: [
        {
          emoji: '🎯',
          label: 'Objective',
          value: 'Explore new frontiers and expand humanity\'s presence in space',
        },
        {
          emoji: '👥',
          label: 'Team',
          value: 'A dedicated crew of skilled professionals ready for adventure',
        },
        {
          emoji: '🛠️',
          label: 'Capabilities',
          value: 'Advanced equipment and tools for discovery and survival',
        },
      ],
    },
  ];

  const handleComplete = () => {
    addPoints(75, 'Chapter 8 capstone - Space mission design');
    completeChapter('space', 7);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          You've learned about planets, stars, rockets, and astronauts. Now design your own space mission!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Capstone: Design Your Space Mission</h3>
        <p className="text-text-secondary">
          Make decisions about destination, crew, equipment, and mission objectives.
        </p>
      </div>

      <MultiStepWizard
        steps={steps}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Space Exploration Pioneer!</h4>
        <p className="text-text-secondary">
          By designing this mission, you've thought like mission planners do! Every space mission requires careful planning, the right team, proper equipment, and bold objectives. Who knows - maybe one day you'll lead humanity to the stars!
        </p>
      </div>
    </div>
  );
}
