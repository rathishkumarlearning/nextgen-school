import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import MultiStepWizard from '../../activities/MultiStepWizard';

export default function Ch8DesignYourRobot({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const steps = [
    {
      id: 'body',
      title: 'Design the Body',
      description: 'What should your robot look like?',
      type: 'choice',
      options: [
        { value: 'humanoid', label: 'Humanoid', emoji: '🤖', desc: 'Two arms, two legs' },
        { value: 'wheeled', label: 'Wheeled', emoji: '🚙', desc: 'Moves on wheels' },
        { value: 'tracked', label: 'Tracked', emoji: '🐛', desc: 'Tank-like treads' },
        { value: 'flying', label: 'Flying', emoji: '🚁', desc: 'Drone-style drone' },
      ],
    },
    {
      id: 'sensors',
      title: 'Add Sensors',
      description: 'How should it sense the world?',
      type: 'choice',
      options: [
        { value: 'vision', label: 'Vision', emoji: '📷', desc: 'Camera for seeing' },
        { value: 'touch', label: 'Touch', emoji: '👆', desc: 'Pressure & contact' },
        { value: 'hearing', label: 'Hearing', emoji: '🎤', desc: 'Microphone sensors' },
        { value: 'distance', label: 'Distance', emoji: '📡', desc: 'Proximity sensors' },
      ],
    },
    {
      id: 'mission',
      title: 'Set the Mission',
      description: 'What should your robot do?',
      type: 'choice',
      options: [
        { value: 'explore', label: 'Explore', emoji: '🔍', desc: 'Discover new areas' },
        { value: 'help', label: 'Help Humans', emoji: '🤝', desc: 'Assist with tasks' },
        { value: 'deliver', label: 'Deliver', emoji: '📦', desc: 'Transport items' },
        { value: 'clean', label: 'Clean', emoji: '🧹', desc: 'Keep things tidy' },
      ],
    },
    {
      id: 'name',
      title: 'Name Your Robot',
      description: 'Give your creation a unique name!',
      type: 'input',
      placeholder: 'e.g., RoboHelper, ExploreBot, DeliveryDroid...',
    },
    {
      id: 'summary',
      title: 'Your Robot Design',
      description: 'Here\'s the robot you\'ve imagined!',
      type: 'summary',
      items: [
        {
          emoji: '🤖',
          label: 'Design',
          value: 'A sophisticated machine with sensors and a powerful computer brain',
        },
        {
          emoji: '⚙️',
          label: 'Capabilities',
          value: 'Built to work autonomously and solve important problems',
        },
        {
          emoji: '🎯',
          label: 'Purpose',
          value: 'Making the world safer, cleaner, and more efficient',
        },
      ],
    },
  ];

  const handleComplete = () => {
    addPoints(75, 'Chapter 8 capstone - Robot design');
    completeChapter('robotics', 7);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          You've learned about sensors, brains, and robot types. Now it's time to design your own robot!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Capstone: Design Your Robot</h3>
        <p className="text-text-secondary">
          Make decisions about form, function, sensors, and mission. What kind of robot would you create?
        </p>
      </div>

      <MultiStepWizard
        steps={steps}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Robot Engineering Career</h4>
        <p className="text-text-secondary mb-3">
          Did you know you can work as a roboticist? These engineers design and build robots for industries like:
        </p>
        <ul className="space-y-1 text-text-secondary">
          <li>🏭 Manufacturing and automation</li>
          <li>🏥 Healthcare and medicine</li>
          <li>🌍 Environmental cleanup</li>
          <li>🚀 Space exploration</li>
          <li>🔬 Scientific research</li>
          <li>🏠 Home automation</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">The Future of Robotics</h4>
        <p className="text-text-secondary">
          The robots you've designed in this course are just the beginning! As AI and robotics advance, robots will become more capable, intelligent, and helpful. Maybe YOU will design the robots of tomorrow!
        </p>
      </div>
    </div>
  );
}
