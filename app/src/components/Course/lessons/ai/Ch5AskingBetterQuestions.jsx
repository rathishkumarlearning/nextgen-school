import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import ChoiceCards from '../../activities/ChoiceCards';

export default function Ch5AskingBetterQuestions({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [completedCount, setCompletedCount] = useState(0);

  const scenarios = [
    {
      question: 'You ask AI: "Write me a story." What would make your question BETTER?',
      options: [
        {
          text: 'Ask: "Write me a funny space adventure about a robot pilot"',
          correct: true,
          explanation: 'Excellent! Specific details help AI create exactly what you want. This is a "better prompt."',
        },
        {
          text: 'Ask: "Write me a story that\'s really, really good"',
          correct: false,
          explanation: 'This is vague. What makes a story "good" to you? Be more specific!',
        },
        {
          text: 'Ask: "Write a story" without changing anything',
          correct: false,
          explanation: 'You can do better! More details = better results.',
        },
      ],
    },
    {
      question: 'You ask AI: "How do I build a robot?" What\'s the BEST follow-up question?',
      options: [
        {
          text: 'Ask: "What\'s a robot?"',
          correct: false,
          explanation: 'You already know this! Ask something more helpful.',
        },
        {
          text: 'Ask: "I have $50 and want to build a robot that moves. What are the easiest steps?"',
          correct: true,
          explanation: 'Perfect! Budget, goal, and level of difficulty make this a powerful question!',
        },
        {
          text: 'Ask: "Build a robot for me"',
          correct: false,
          explanation: 'AI can give instructions but can\'t actually build it. Ask for what it CAN help with!',
        },
      ],
    },
    {
      question: 'What makes a question "better" for AI?',
      options: [
        {
          text: 'It includes specific details about what you want',
          correct: true,
          explanation: 'Yes! Details like: topic, style, length, purpose, and context make AI responses much better.',
        },
        {
          text: 'It\'s as short as possible',
          correct: false,
          explanation: 'Too short = too vague. A little more detail helps a lot!',
        },
        {
          text: 'It asks AI to do something impossible',
          correct: false,
          explanation: 'AI works best when you ask what\'s actually possible!',
        },
      ],
    },
  ];

  const handleScenarioComplete = () => {
    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    addPoints(20, `Question ${newCount}`);

    if (newCount === scenarios.length) {
      completeChapter('ai', 4);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          The better your question, the better AI's answer. Learn how to ask questions that get great results!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Ask Better Questions</h3>
        <p className="text-text-secondary">
          Choose the best way to ask AI for help. Progress: {completedCount} / {scenarios.length}
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
          <h3 className="text-2xl font-bold text-text mb-2">Question Master!</h3>
          <p className="text-text-secondary">You know how to ask AI for amazing answers!</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Tips for Better Questions</h4>
        <ul className="space-y-2 text-text-secondary">
          <li>✓ Be specific: include details like topic, style, and purpose</li>
          <li>✓ Give context: explain WHY you\'re asking</li>
          <li>✓ Ask for what\'s possible: Don\'t ask AI to do things it can\'t</li>
          <li>✓ Iterate: If the answer isn\'t perfect, ask a follow-up question</li>
          <li>✓ Be clear: Use simple, direct language</li>
        </ul>
      </div>
    </div>
  );
}
