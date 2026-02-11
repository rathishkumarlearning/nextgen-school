import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Onboarding({ onComplete }) {
  const { state, setState, save } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState(false);

  const handleNext = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFinish = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (setState) {
      setState(prev => ({
        ...prev,
        name: trimmed,
        parentEmail: email.trim() || prev.parentEmail
      }));
    }
    if (save) save();
    if (onComplete) onComplete(trimmed, email.trim());
  };

  return (
    <div id="onboarding" className="show" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(5,5,16,0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="wizard-card glass" style={{ maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center' }}>
        {step === 1 && (
          <div>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>👋</span>
            <h2>Welcome to NextGen School!</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '24px' }}>
              Ready to explore AI, space, and robotics? Let's set up your profile!
            </p>
            <input
              className="wizard-input"
              placeholder="What's your name, explorer?"
              maxLength={20}
              value={name}
              onChange={e => { setName(e.target.value); setNameError(false); }}
              style={nameError ? { borderColor: 'var(--red)' } : {}}
            />
            <div className="wizard-dots">
              <span className="wizard-dot active" />
              <span className="wizard-dot" />
            </div>
            <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%' }}>
              Next →
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>📧</span>
            <h2>Parent's Email (Optional)</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '24px' }}>
              We'll send progress reports and certificates to your parent!
            </p>
            <input
              className="wizard-input"
              placeholder="parent@email.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="wizard-dots">
              <span className="wizard-dot" />
              <span className="wizard-dot active" />
            </div>
            <button className="btn btn-primary" onClick={handleFinish} style={{ width: '100%' }}>
              Let's Go! 🚀
            </button>
            <button className="btn btn-back" onClick={handleBack} style={{ width: '100%', marginTop: '8px' }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
