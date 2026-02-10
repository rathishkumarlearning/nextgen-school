import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import TapChallenge from '../../activities/TapChallenge';
import ChoiceCards from '../../activities/ChoiceCards';

export default function Ch7AstronautTraining({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [tapScore, setTapScore] = useState(null);
  const [scenarioComplete, setScenarioComplete] = useState(0);

  const scenarios = [
    {
      question: 'An alarm sounds in the spacecraft. What do you do?',
      options: [
        {
          text: 'Panic and float around',
          correct: false,
          explanation: 'Astronauts train to stay calm. Follow emergency procedures!',
        },
        {
          text: 'Check the panel and follow your training procedures',
          correct: true,
          explanation: 'Correct! Astronauts spend years learning emergency protocols.',
        },
        {
          text: 'Contact Earth immediately',
          correct: false,
          explanation: 'First, stabilize the situation. Earth can\'t help immediately!',
        },
      ],
    },
    {
      question: 'You\'re doing a spacewalk and feel dizzy. What\'s happening?',
      options: [
        {
          text: 'You\'re getting sick from space',
          correct: false,
          explanation: 'Actually, that\'s space motion sickness - astronauts train to manage it!',
        },
        {
          text: 'Your inner ear is confused by zero gravity',
          correct: true,
          explanation: 'Yes! Your balance system depends on gravity. Astronauts adapt over days.',
        },
        {
          text: 'The oxygen is running out',
          correct: false,
          explanation: 'If that were true, your suit would warn you!',
        },
      ],
    },
  ];

  const handleTapScore = (score) => {
    setTapScore(score);
    addPoints(Math.min(score, 50), 'Reflex challenge');
  };

  const handleScenarioComplete = () => {
    const newCount = scenarioComplete + 1;
    setScenarioComplete(newCount);
    addPoints(15, `Scenario ${newCount}`);

    if (newCount === scenarios.length && tapScore !== null) {
      completeChapter('space', 6);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Astronauts don't just go to space - they train for years! Let's explore what it takes to be an astronaut.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 1: Reflex Training</h3>
        <p className="text-text-secondary">
          Astronauts need sharp reflexes! Tap as many times as you can in 10 seconds.
        </p>
      </div>

      <TapChallenge
        duration={10}
        onScore={handleTapScore}
      />

      {tapScore !== null && (
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400 rounded-lg p-4">
          <p className="text-text">Your score: <strong className="text-cyan-400 text-lg">{tapScore}</strong> taps</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 2: Emergency Response</h3>
        <p className="text-text-secondary">
          Choose the best emergency response. Progress: {scenarioComplete} / {scenarios.length}
        </p>
      </div>

      {scenarioComplete < scenarios.length && (
        <ChoiceCards
          question={scenarios[scenarioComplete].question}
          options={scenarios[scenarioComplete].options}
          onCorrect={handleScenarioComplete}
        />
      )}

      {scenarioComplete === scenarios.length && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400 rounded-xl p-6 text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h3 className="text-2xl font-bold text-text mb-2">Astronaut Ready!</h3>
          <p className="text-text-secondary">You've completed basic astronaut training!</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Astronaut Training</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>🏊 <strong>Water Training:</strong> Spacewalk training happens underwater!</li>
          <li>✈️ <strong>Zero-G Flights:</strong> Parabolic flights create short periods of weightlessness</li>
          <li>🧠 <strong>Mental Training:</strong> Learning to stay calm in emergencies</li>
          <li>🌍 <strong>Survival:</strong> Training for harsh environments</li>
          <li>👥 <strong>Teamwork:</strong> Working closely with crew in tight spaces</li>
        </ul>
      </div>
    </div>
  );
}
