import React, { useState, useCallback } from 'react';
import Feedback from '../../Common/Feedback';

export default function MultiStepWizard({ steps, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [feedback, setFeedback] = useState({ show: false, type: 'info', message: '' });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleSelectOption = useCallback((optionValue) => {
    setResponses((prev) => ({
      ...prev,
      [step.id]: optionValue,
    }));

    if (step.onSelect) {
      step.onSelect(optionValue);
    }

    // Auto-advance to next step
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
    }
  }, [step, currentStep, steps.length]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete?.();
    }
  }, [currentStep, steps.length, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  return (
    <div className="space-y-6">
      <Feedback {...feedback} />

      {/* Progress Bar */}
      <div className="flex gap-2">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-all ${
              idx <= currentStep
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                : 'bg-bg3'
            }`}
          />
        ))}
      </div>

      {/* Current Step */}
      <div className="bg-gradient-to-br from-bg2 to-bg3 border border-glass-border rounded-xl p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-text mb-2">
            Step {currentStep + 1}: {step.title}
          </h3>
          <p className="text-text-secondary">{step.description}</p>
        </div>

        {/* Step Content */}
        {step.type === 'choice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {step.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                  responses[step.id] === option.value
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30'
                    : 'bg-bg3 border-glass-border hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{option.emoji}</div>
                  <div>
                    <div className="font-semibold text-text">{option.label}</div>
                    {option.desc && <div className="text-xs text-text-secondary">{option.desc}</div>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step.type === 'input' && (
          <input
            type="text"
            placeholder={step.placeholder}
            value={responses[step.id] || ''}
            onChange={(e) => setResponses((prev) => ({
              ...prev,
              [step.id]: e.target.value,
            }))}
            className="w-full px-4 py-3 bg-bg3 border border-glass-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-cyan-400"
          />
        )}

        {step.type === 'summary' && (
          <div className="space-y-4">
            {step.items?.map((item, idx) => (
              <div key={idx} className="bg-bg1 border border-glass-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-text">{item.label}</h4>
                    <p className="text-sm text-text-secondary mt-1">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex-1 px-4 py-3 bg-gray-500/20 border border-gray-400 text-text font-bold rounded-lg hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all active:scale-95"
        >
          {isLastStep ? '✓ Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
