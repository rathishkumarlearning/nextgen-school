import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import ChoiceCards from '../../activities/ChoiceCards';

export default function Ch7AIEthics({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [completedCount, setCompletedCount] = useState(0);

  const scenarios = [
    {
      question: 'An AI coaches basketball teams. It rates players by past performance but gives lower scores to players with certain last names. What\'s wrong?',
      options: [
        {
          text: 'Nothing, the AI is just using data',
          correct: false,
          explanation: 'This is bias! If the data has unfair patterns, AI will repeat them. This is unethical and harms people.',
        },
        {
          text: 'The AI is being unfair. It\'s judging by name, not ability',
          correct: true,
          explanation: 'Exactly! This is AI bias. The AI learned unfair patterns from data and now discriminates.',
        },
        {
          text: 'We can\'t solve this with AI',
          correct: false,
          explanation: 'We CAN fix it! We need to find and remove biased patterns from the training data.',
        },
      ],
    },
    {
      question: 'A photo app automatically tags your face with a label. A friend feels hurt because the label is inaccurate and embarrassing. What should the company do?',
      options: [
        {
          text: 'Tell them it\'s just AI and can\'t be changed',
          correct: false,
          explanation: 'That\'s not fair! Companies must take responsibility for their AI\'s mistakes.',
        },
        {
          text: 'Let users delete, report, or correct the labels',
          correct: true,
          explanation: 'Perfect! When AI affects people, they should have control and the ability to appeal.',
        },
        {
          text: 'Use the labels to train AI to be better',
          correct: false,
          explanation: 'Not without asking! Privacy matters. Always get consent before using someone\'s data.',
        },
      ],
    },
    {
      question: 'An AI real estate app gives lower house prices to certain neighborhoods. This makes homes cheaper there but also perpetuates historical injustice. What\'s the issue?',
      options: [
        {
          text: 'It helps people buy cheaper homes',
          correct: false,
          explanation: 'The outcome might seem good, but it repeats unfair patterns that harm communities.',
        },
        {
          text: 'The AI learned biased patterns from history and is now recreating old injustices',
          correct: true,
          explanation: 'Exactly! AI can accidentally perpetuate discrimination. We must actively work against this.',
        },
        {
          text: 'There\'s no problem if the AI makes accurate predictions',
          correct: false,
          explanation: 'Accuracy isn\'t enough! Ethical AI must be fair. It\'s not OK to automate injustice.',
        },
      ],
    },
  ];

  const handleScenarioComplete = () => {
    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    addPoints(20, `Ethics scenario ${newCount}`);

    if (newCount === scenarios.length) {
      completeChapter('ai', 6);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Just because we CAN build AI doesn't mean we should build it that way. Ethics means doing what's right, especially when it's hard. Let's explore AI ethics!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity: Ethical Dilemmas</h3>
        <p className="text-text-secondary">
          Read each scenario and decide what's ethically right. Progress: {completedCount} / {scenarios.length}
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
          <div className="text-5xl mb-3">🌟</div>
          <h3 className="text-2xl font-bold text-text mb-2">Ethics Champion!</h3>
          <p className="text-text-secondary">You understand how to build AI that's fair and responsible!</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Key Ethics Principles</h4>
        <ul className="space-y-3 text-text-secondary">
          <li>
            <strong className="text-cyan-400">⚖️ Fairness:</strong> AI should treat everyone fairly, regardless of background
          </li>
          <li>
            <strong className="text-purple-400">🔒 Privacy:</strong> Protect people's personal data and get permission to use it
          </li>
          <li>
            <strong className="text-pink-400">🤝 Responsibility:</strong> Creators must be accountable for their AI's actions
          </li>
          <li>
            <strong className="text-yellow-400">📊 Transparency:</strong> People should understand how AI makes decisions
          </li>
          <li>
            <strong className="text-green-400">✓ Control:</strong> Humans should always be able to override or appeal AI decisions</li>
        </ul>
      </div>
    </div>
  );
}
