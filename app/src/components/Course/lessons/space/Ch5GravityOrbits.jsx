import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import OrbitSimulator from '../../activities/OrbitSimulator';
import ChoiceCards from '../../activities/ChoiceCards';

export default function Ch5GravityOrbits({ onComplete }) {
  const { addPoints, completeChapter } = useGame();
  const [simulatorExplored, setSimulatorExplored] = useState(false);
  const [questionsComplete, setQuestionsComplete] = useState(0);

  const questions = [
    {
      question: 'What keeps planets in orbit around the Sun?',
      options: [
        {
          text: 'Gravity pulling them inward and their motion pulling them outward',
          correct: true,
          explanation: 'Perfect! Gravity and momentum balance to keep planets in stable orbits.',
        },
        {
          text: 'The planets are held by invisible strings',
          correct: false,
          explanation: 'No strings involved! It\'s all gravity and motion.',
        },
        {
          text: 'The Sun pushes them away',
          correct: false,
          explanation: 'The Sun actually pulls them inward with gravity!',
        },
      ],
    },
    {
      question: 'If a planet moves closer to the Sun, what happens?',
      options: [
        {
          text: 'It falls into the Sun',
          correct: false,
          explanation: 'Not if it\'s moving fast enough! Gravity and speed create balance.',
        },
        {
          text: 'It orbits faster due to stronger gravity',
          correct: true,
          explanation: 'Correct! Closer orbit = faster motion = stable.',
        },
        {
          text: 'Nothing changes',
          correct: false,
          explanation: 'Gravity is stronger closer to the Sun, so things do change!',
        },
      ],
    },
    {
      question: 'What is escape velocity?',
      options: [
        {
          text: 'The speed needed to break free from a planet\'s gravity',
          correct: true,
          explanation: 'Yes! Earth\'s escape velocity is 11 km/s. Rockets must reach this to leave!',
        },
        {
          text: 'The speed planets travel',
          correct: false,
          explanation: 'Escape velocity is specific to breaking gravity\'s hold.',
        },
        {
          text: 'How fast you run away',
          correct: false,
          explanation: 'This is about gravitational physics, not running!',
        },
      ],
    },
  ];

  const handleSimulatorExplore = () => {
    setSimulatorExplored(true);
    addPoints(20, 'Orbit simulator exploration');
  };

  const handleQuestionComplete = () => {
    const newCount = questionsComplete + 1;
    setQuestionsComplete(newCount);
    addPoints(15, `Gravity question ${newCount}`);

    if (newCount === questions.length && simulatorExplored) {
      completeChapter('space', 4);
      onComplete?.();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          Gravity is the invisible force that keeps everything in orbit. Without it, planets would fly off into space!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 1: Orbit Simulator</h3>
        <p className="text-text-secondary">
          Adjust gravity and distance to keep a planet in a stable orbit!
        </p>
      </div>

      <OrbitSimulator />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Activity 2: Gravity Quiz</h3>
        <p className="text-text-secondary">
          Test your understanding of orbits and gravity. Progress: {questionsComplete} / {questions.length}
        </p>
      </div>

      {questionsComplete < questions.length && (
        <ChoiceCards
          question={questions[questionsComplete].question}
          options={questions[questionsComplete].options}
          onCorrect={handleQuestionComplete}
        />
      )}

      {questionsComplete === questions.length && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400 rounded-xl p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-text mb-2">Gravity Expert!</h3>
          <p className="text-text-secondary">You understand the forces that keep our universe in motion!</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">Newton's Law of Universal Gravitation</h4>
        <p className="text-text-secondary">
          Every object in the universe attracts every other object with a force that depends on their masses and distance. This simple rule explains why planets orbit stars, why we stay on Earth, and why the universe is organized the way it is!
        </p>
      </div>
    </div>
  );
}
