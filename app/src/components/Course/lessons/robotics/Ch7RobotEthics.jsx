import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import ChoiceCards from '../../activities/ChoiceCards';

export default function Ch7RobotEthics({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [completedCount, setCompletedCount] = useState(0);

  const scenarios = [
    {
      question: 'A delivery robot can navigate city streets, but an elderly person gets hit because the robot didn\'t see them. What\'s the issue?',
      options: [
        {
          text: 'The robot wasn\'t tested well enough on all situations',
          correct: true,
          explanation: 'Exactly! Robots must be safe for EVERYONE, including vulnerable people. Thorough testing is essential.',
        },
        {
          text: 'It\'s not the robot\'s fault, accidents happen',
          correct: false,
          explanation: 'Builders are responsible for safety. We need better design and testing before release.',
        },
        {
          text: 'Elderly people shouldn\'t cross where robots work',
          correct: false,
          explanation: 'That\'s unfair! Public spaces should be safe for all people, including robots.',
        },
      ],
    },
    {
      question: 'A robot vacuum has a camera to navigate. Your family\'s privacy is at risk if it records everything. What should happen?',
      options: [
        {
          text: 'The robot company should ignore privacy concerns - it\'s needed for safety',
          correct: false,
          explanation: 'Safety AND privacy are both important! Engineers should find ways to do both.',
        },
        {
          text: 'Users should have control: choose what data is recorded and how it\'s used',
          correct: true,
          explanation: 'Perfect! When robots collect data, people deserve privacy and control.',
        },
        {
          text: 'All camera data should be uploaded to the cloud',
          correct: false,
          explanation: 'That would violate privacy! Data should stay private unless you choose otherwise.',
        },
      ],
    },
    {
      question: 'A creative AI robot makes beautiful art. Who deserves credit - the robot, the programmer, or the person who owns it?',
      options: [
        {
          text: 'Only the robot created it, so the robot gets credit',
          correct: false,
          explanation: 'Robots can\'t deserve credit. Humans created the robot and programmed its abilities.',
        },
        {
          text: 'The programmer who wrote the creative algorithm deserves credit',
          correct: true,
          explanation: 'Correct! Robots are tools. The humans who built and directed them deserve the recognition.',
        },
        {
          text: 'Whoever owns the robot gets all the credit',
          correct: false,
          explanation: 'Ownership is different from creation. Credit should go to those who created it.',
        },
      ],
    },
  ];

  const handleScenarioComplete = () => {
    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    addPoints(20, `Ethics scenario ${newCount}`);

    if (newCount === scenarios.length) {
      completeChapter('robotics', 6);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          As robots become more powerful and widespread, we need to think carefully about ethics. How should robots be designed and used responsibly?
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Robot Ethics Dilemmas</h3>
        <p className="text-text-secondary">
          Read each scenario and think about what's ethically right. Progress: {completedCount} / {scenarios.length}
        </p>
      </div>

      {completedCount < scenarios.length && (
        <ChoiceCards
          question={scenarios[completedCount].question}
          options={scenarios[completedCount].options}
          onCorrect={handleScenarioComplete}
        />
      )}

      {completedCount === scenarios.length && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400 rounded-xl p-6 text-center">
          <div className="text-5xl mb-3">⚖️</div>
          <h3 className="text-2xl font-bold text-text mb-2">Ethics Champion!</h3>
          <p className="text-text-secondary">You understand how to build robots responsibly!</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Robot Ethics Principles</h4>
        <ul className="space-y-3 text-text-secondary">
          <li>
            <strong className="text-cyan-400">🛡️ Safety:</strong> Robots must be safe for humans and the environment
          </li>
          <li>
            <strong className="text-purple-400">🔒 Privacy:</strong> Robots collecting data must protect privacy
          </li>
          <li>
            <strong className="text-pink-400">⚖️ Fairness:</strong> Robots should treat all people fairly, regardless of background
          </li>
          <li>
            <strong className="text-yellow-400">🤝 Transparency:</strong> People should understand how robots work and make decisions
          </li>
          <li>
            <strong className="text-green-400">👥 Human Control:</strong> Humans must stay in control of important decisions</li>
        </ul>
      </div>
    </div>
  );
}
