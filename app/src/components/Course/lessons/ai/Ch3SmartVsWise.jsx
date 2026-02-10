import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import ChoiceCards from '../../activities/ChoiceCards';

export default function Ch3SmartVsWise({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [completedCount, setCompletedCount] = useState(0);

  const scenarios = [
    {
      question: 'AI says: "The capital of France is London." What should you do?',
      options: [
        {
          text: 'Believe AI because it sounds smart',
          correct: false,
          explanation: 'AI can make mistakes! Just because it sounds confident doesn\'t mean it\'s right.',
        },
        {
          text: 'That doesn\'t sound right, let me check for myself',
          correct: true,
          explanation: 'Smart thinking! Always verify important information. Paris is the capital of France!',
        },
        {
          text: 'Tell everyone AI is broken',
          correct: false,
          explanation: 'AI can be helpful even when it makes mistakes. We just need to check its work!',
        },
      ],
    },
    {
      question: 'You ask AI to write a birthday card for your grandma. What should you do?',
      options: [
        {
          text: 'Send it exactly as AI wrote it',
          correct: false,
          explanation: 'AI doesn\'t know your grandma like you do! It\'s missing your personal touch.',
        },
        {
          text: 'Read it first and add your own words and feelings',
          correct: true,
          explanation: 'Perfect! AI can help, but your personal message makes it special. That\'s wisdom!',
        },
        {
          text: 'Delete it and write everything yourself',
          correct: false,
          explanation: 'AI can help! You don\'t need to reject all help, just make it your own.',
        },
      ],
    },
    {
      question: 'AI suggests a "fact" for your school report. What should you do?',
      options: [
        {
          text: 'Use it without checking',
          correct: false,
          explanation: 'Your grade depends on accurate info! Always verify facts for school.',
        },
        {
          text: 'Check if it\'s true using another source',
          correct: true,
          explanation: 'Excellent judgment! This is called "critical thinking." Smart students do this!',
        },
        {
          text: 'Never believe anything AI tells you',
          correct: false,
          explanation: 'AI can be helpful! You just need to think carefully about what to trust.',
        },
      ],
    },
  ];

  const handleScenarioComplete = () => {
    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    addPoints(20, `Scenario ${newCount}`);

    if (newCount === scenarios.length) {
      completeChapter('ai', 2);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Being smart means knowing facts. Being wise means knowing what to do with them! AI can be smart, but you need to be wise about using it.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Scenarios: Smart or Wise?</h3>
        <p className="text-text-secondary">
          Read each scenario and choose the wisest response. Progress: {completedCount} / {scenarios.length}
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
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-text mb-2">All Scenarios Complete!</h3>
          <p className="text-text-secondary">You're learning to use AI wisely. Great job!</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Smart vs Wise</h4>
        <ul className="space-y-2 text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="font-bold text-cyan-400 mt-1">Smart:</span>
            <span>Knowing lots of information or how to use tools like AI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-purple-400 mt-1">Wise:</span>
            <span>Knowing when to use tools, when to question them, and when to add your own judgment</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
