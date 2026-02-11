import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    authModalType, closeAuthModal, openAuthModal,
    doSignup, doLogin, doChildLogin, enableDemoMode
  } = useAuth();

  const [tab, setTab] = useState('parent'); // parent | child
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', childName: '', childAge: '', childPin: ''
  });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const resetState = useCallback(() => {
    setError('');
    setPin('');
    setTab('parent');
  }, []);

  if (!authModalType) return null;

  const handleClose = () => {
    resetState();
    closeAuthModal();
  };

  // ===== SIGNUP =====
  if (authModalType === 'signup') {
    const handleSignup = async () => {
      setError('');
      const { name, email, password, childName, childAge, childPin } = signupData;
      if (!name || !email || !password) {
        setError('Please fill in all required fields');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      try {
        await doSignup({ name, email, password, childName, childAge, childPin });
        handleClose();
      } catch (e) {
        setError(e.message || 'Signup failed');
      }
    };

    return (
      <div className="auth-overlay show">
        <div className="auth-modal">
          <button className="close-btn" onClick={handleClose}>&times;</button>
          <span style={{ fontSize: '3rem', display: 'block', textAlign: 'center', marginBottom: '8px' }}>👨‍👩‍👧</span>
          <h2>Create Parent Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '24px', fontSize: '.95rem' }}>
            Set up your family's learning journey
          </p>
          {error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}
          <input className="auth-input" placeholder="Your full name" maxLength={50}
            value={signupData.name} onChange={e => setSignupData(d => ({ ...d, name: e.target.value }))} />
          <input className="auth-input" placeholder="Email address" type="email"
            value={signupData.email} onChange={e => setSignupData(d => ({ ...d, email: e.target.value }))} />
          <input className="auth-input" placeholder="Password (min 6 chars)" type="password"
            value={signupData.password} onChange={e => setSignupData(d => ({ ...d, password: e.target.value }))} />
          <input className="auth-input" placeholder="Child's name"
            value={signupData.childName} onChange={e => setSignupData(d => ({ ...d, childName: e.target.value }))} />
          <input className="auth-input" placeholder="Child's age (9-13)" type="number" min={9} max={13}
            value={signupData.childAge} onChange={e => setSignupData(d => ({ ...d, childAge: e.target.value }))} />
          <input className="auth-input" placeholder="Child's 4-digit PIN (for child login)" type="password" maxLength={4}
            value={signupData.childPin} onChange={e => setSignupData(d => ({ ...d, childPin: e.target.value }))} />
          <button className="btn btn-primary" onClick={handleSignup} style={{ width: '100%' }}>
            Create Account 🚀
          </button>
          <div className="auth-switch">
            Already have an account? <a onClick={() => { resetState(); openAuthModal('login'); }}>Log in</a>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOGIN =====
  if (authModalType === 'login') {
    const handleLogin = async () => {
      setError('');
      if (!loginData.email || !loginData.password) {
        setError('Please fill in all fields');
        return;
      }
      try {
        await doLogin(loginData.email, loginData.password);
        handleClose();
      } catch (e) {
        setError(e.message || 'Login failed');
      }
    };

    const handlePinEntry = (digit) => {
      if (pin.length >= 4) return;
      setPin(prev => prev + digit);
    };

    const handlePinClear = () => {
      setPin(prev => prev.slice(0, -1));
    };

    const handlePinSubmit = async () => {
      if (pin.length !== 4) return;
      setError('');
      try {
        await doChildLogin(pin);
        handleClose();
      } catch (e) {
        setError(e.message || 'Invalid PIN');
        setPin('');
      }
    };

    const handleDemo = () => {
      if (enableDemoMode) enableDemoMode();
      handleClose();
    };

    return (
      <div className="auth-overlay show">
        <div className="auth-modal">
          <button className="close-btn" onClick={handleClose}>&times;</button>
          <span style={{ fontSize: '3rem', display: 'block', textAlign: 'center', marginBottom: '8px' }}>🔐</span>
          <h2>Welcome Back</h2>
          <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '24px', fontSize: '.95rem' }}>
            Log in to your account
          </p>

          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === 'parent' ? ' active' : ''}`}
              onClick={() => { setTab('parent'); setError(''); }}
            >
              👨‍👩‍👧 Parent
            </button>
            <button
              className={`auth-tab${tab === 'child' ? ' active' : ''}`}
              onClick={() => { setTab('child'); setError(''); setPin(''); }}
            >
              🧒 Child PIN
            </button>
          </div>

          {error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}

          {tab === 'parent' && (
            <div>
              <input className="auth-input" placeholder="Email address" type="email"
                value={loginData.email} onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))} />
              <input className="auth-input" placeholder="Password" type="password"
                value={loginData.password} onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))} />
              <button className="btn btn-primary" onClick={handleLogin} style={{ width: '100%' }}>
                Log In →
              </button>
            </div>
          )}

          {tab === 'child' && (
            <div>
              <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '.9rem', marginBottom: '8px' }}>
                Enter your 4-digit PIN
              </p>
              <div className="pin-dots">
                {[0, 1, 2, 3].map(i => (
                  <div className={`pin-dot${i < pin.length ? ' filled' : ''}`} key={i} />
                ))}
              </div>
              <div className="child-pin-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button className="child-pin-btn" key={n} onClick={() => handlePinEntry(String(n))}>{n}</button>
                ))}
                <button className="child-pin-btn" onClick={handlePinClear}>⌫</button>
                <button className="child-pin-btn" onClick={() => handlePinEntry('0')}>0</button>
                <button className="child-pin-btn" onClick={handlePinSubmit}>✓</button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <button
              className="btn btn-back"
              onClick={handleDemo}
              style={{ fontSize: '.85rem' }}
            >
              🎮 Try Demo Mode
            </button>
          </div>

          <div className="auth-switch">
            Don't have an account? <a onClick={() => { resetState(); openAuthModal('signup'); }}>Sign up</a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
