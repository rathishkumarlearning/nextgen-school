import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import MultiStepWizard from '../../activities/MultiStepWizard';

export default function Ch8BeTheAIBoss({ onComplete }) {
  const { addPoints, completeChapter } = useGame();

  const steps = [
    {
      id: 'job',
      title: 'Choose Your Job',
      description: 'What should your AI do?',
      type: 'choice',
      options: [
        { value: 'tutor', label: 'AI Tutor', emoji: '👨‍🏫', desc: 'Helps students learn' },
        { value: 'helper', label: 'AI Helper', emoji: '🤖', desc: 'Answers questions' },
        { value: 'creator', label: 'AI Creator', emoji: '🎨', desc: 'Makes art/music' },
      ],
    },
    {
      id: 'rules',
      title: 'Set the Rules',
      description: 'What rules should your AI follow?',
      type: 'choice',
      options: [
        { value: 'honest', label: 'Always Tell the Truth', emoji: '✓', desc: 'Never make up facts' },
        { value: 'safe', label: 'Be Safe', emoji: '🛡️', desc: 'Refuse harmful requests' },
        { value: 'respectful', label: 'Be Respectful', emoji: '🤝', desc: 'Never be mean' },
      ],
    },
    {
      id: 'boundaries',
      title: 'Set Boundaries',
      description: 'What should your AI NOT do?',
      type: 'choice',
      options: [
        { value: 'privacy', label: 'Protect Privacy', emoji: '🔒', desc: 'Keep data secret' },
        { value: 'independence', label: 'Check Decisions', emoji: '🔍', desc: 'Let humans decide' },
        { value: 'improvement', label: 'Ask for Feedback', emoji: '📝', desc: 'Always improve' },
      ],
    },
    {
      id: 'summary',
      title: 'Your AI System',
      description: 'Here\'s the AI you\'ve designed!',
      type: 'summary',
      items: [
        {
          emoji: '🎯',
          label: 'Job',
          value: 'Your AI will help people learn and grow',
        },
        {
          emoji: '⚖️',
          label: 'Core Rules',
          value: 'Always honest, safe, and respectful',
        },
        {
          emoji: '🛑',
          label: 'Boundaries',
          value: 'Protects privacy, humans make final decisions, continuously improves',
        },
      ],
    },
  ];

  const handleComplete = () => {
    addPoints(75, 'Chapter 8 capstone completion');
    completeChapter('ai', 7);
    onComplete?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg text-text-secondary mb-4">
          You've learned a lot about AI! Now it's time to design your own AI system. What kind of AI boss would you be?
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text">Capstone: Design Your AI</h3>
        <p className="text-text-secondary">
          Make decisions about what your AI should do and how it should behave.
        </p>
      </div>

      <MultiStepWizard
        steps={steps}
        onComplete={handleComplete}
      />

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <h4 className="font-bold text-text mb-3">You're an AI Boss Now!</h4>
        <p className="text-text-secondary mb-3">
          By designing your AI system, you've learned that:
        </p>
        <ul className="space-y-2 text-text-secondary">
          <li>✓ AI systems need clear purposes and rules</li>
          <li>✓ Ethics must be built in from the start</li>
          <li>✓ Humans need to stay in control</li>
          <li>✓ Different jobs need different boundaries</li>
          <li>✓ Building good AI is a responsibility</li>
        </ul>
      </div>
    </div>
  );
}
