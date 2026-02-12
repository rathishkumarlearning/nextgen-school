import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    authModalType, closeAuthModal, openAuthModal,
    doSignup, doLogin, doChildLogin, enableDemoMode, resetPassword
  } = useAuth();

  const [tab, setTab] = useState('parent');
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', childName: '', childAge: '', childPin: ''
  });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const resetState = useCallback(() => {
    setError('');
    setPin('');
    setTab('parent');
    setSubmitting(false);
    setForgotMode(false);
    setForgotSent(false);
    setForgotEmail('');
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
      if (!name || !email || !password) { setError('Please fill in all required fields'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      setSubmitting(true);
      try {
        await doSignup({ name, email, password, childName, childAge, childPin });
        handleClose();
      } catch (e) {
        setError(e.message || 'Signup failed');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="auth-overlay show" onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div className="auth-modal">
          <button className="close-btn" onClick={handleClose}>&times;</button>
          <span style={{ fontSize: '3rem', display: 'block', textAlign: 'center', marginBottom: '8px' }}>👨‍👩‍👧</span>
          <h2>Create Parent Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '24px', fontSize: '.95rem' }}>
            Set up your family's learning journey
          </p>
          {error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}
          <input className="auth-input" placeholder="Your full name *" maxLength={50}
            value={signupData.name} onChange={e => setSignupData(d => ({ ...d, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSignup()} />
          <input className="auth-input" placeholder="Email address *" type="email"
            value={signupData.email} onChange={e => setSignupData(d => ({ ...d, email: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSignup()} />
          <input className="auth-input" placeholder="Password (min 6 chars) *" type="password"
            value={signupData.password} onChange={e => setSignupData(d => ({ ...d, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSignup()} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0', paddingTop: '12px' }}>
            <p style={{ fontSize: '.85rem', color: 'var(--text3)', marginBottom: '8px' }}>Optional: Add your child</p>
          </div>
          <input className="auth-input" placeholder="Child's name"
            value={signupData.childName} onChange={e => setSignupData(d => ({ ...d, childName: e.target.value }))} />
          <input className="auth-input" placeholder="Child's age (9-13)" type="number" min={9} max={13}
            value={signupData.childAge} onChange={e => setSignupData(d => ({ ...d, childAge: e.target.value }))} />
          <input className="auth-input" placeholder="Child's 4-digit PIN" type="password" maxLength={4}
            value={signupData.childPin} onChange={e => setSignupData(d => ({ ...d, childPin: e.target.value.replace(/\D/g, '') }))} />
          <button className="btn btn-primary" onClick={handleSignup} disabled={submitting} style={{ width: '100%' }}>
            {submitting ? <span className="auth-spinner" /> : 'Create Account 🚀'}
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
      if (!loginData.email || !loginData.password) { setError('Please fill in all fields'); return; }
      setSubmitting(true);
      try {
        await doLogin(loginData.email, loginData.password);
        handleClose();
      } catch (e) {
        setError(e.message || 'Login failed');
      } finally {
        setSubmitting(false);
      }
    };

    const handlePinEntry = (digit) => {
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);
      // Auto-submit on 4 digits
      if (newPin.length === 4) {
        setTimeout(async () => {
          setError('');
          setSubmitting(true);
          try {
            await doChildLogin(newPin);
            handleClose();
          } catch (e) {
            setError(e.message || 'Invalid PIN');
            setPin('');
          } finally {
            setSubmitting(false);
          }
        }, 200);
      }
    };

    const handlePinClear = () => setPin(prev => prev.slice(0, -1));

    const handleForgotPassword = async () => {
      if (!forgotEmail) { setError('Please enter your email'); return; }
      setSubmitting(true);
      setError('');
      try {
        const result = await resetPassword(forgotEmail);
        if (result.error) { setError(result.error); }
        else { setForgotSent(true); }
      } catch (e) {
        setError(e.message || 'Failed to send reset email');
      } finally {
        setSubmitting(false);
      }
    };

    const handleDemo = () => {
      if (enableDemoMode) enableDemoMode();
      handleClose();
    };

    // Forgot password view
    if (forgotMode) {
      return (
        <div className="auth-overlay show" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="auth-modal">
            <button className="close-btn" onClick={handleClose}>&times;</button>
            <span style={{ fontSize: '3rem', display: 'block', textAlign: 'center', marginBottom: '8px' }}>📧</span>
            <h2>Reset Password</h2>
            {forgotSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--green)', marginBottom: '16px' }}>✅ Reset link sent! Check your email.</p>
                <button className="btn btn-back" onClick={() => { setForgotMode(false); setForgotSent(false); }}>← Back to Login</button>
              </div>
            ) : (
              <>
                <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '24px', fontSize: '.95rem' }}>
                  Enter your email and we'll send a reset link
                </p>
                {error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}
                <input className="auth-input" placeholder="Email address" type="email"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} />
                <button className="btn btn-primary" onClick={handleForgotPassword} disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? <span className="auth-spinner" /> : 'Send Reset Link'}
                </button>
                <div className="auth-switch">
                  <a onClick={() => { setForgotMode(false); setError(''); }}>← Back to Login</a>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="auth-overlay show" onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div className="auth-modal">
          <button className="close-btn" onClick={handleClose}>&times;</button>
          <span style={{ fontSize: '3rem', display: 'block', textAlign: 'center', marginBottom: '8px' }}>🔐</span>
          <h2>Welcome Back</h2>
          <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '24px', fontSize: '.95rem' }}>
            Log in to your account
          </p>

          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'parent' ? ' active' : ''}`}
              onClick={() => { setTab('parent'); setError(''); }}>
              👨‍👩‍👧 Parent
            </button>
            <button className={`auth-tab${tab === 'child' ? ' active' : ''}`}
              onClick={() => { setTab('child'); setError(''); setPin(''); }}>
              🧒 Child PIN
            </button>
          </div>

          {error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}

          {tab === 'parent' && (
            <div>
              <input className="auth-input" placeholder="Email address" type="email"
                value={loginData.email} onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <input className="auth-input" placeholder="Password" type="password"
                value={loginData.password} onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <button className="btn btn-primary" onClick={handleLogin} disabled={submitting} style={{ width: '100%' }}>
                {submitting ? <span className="auth-spinner" /> : 'Log In →'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <a onClick={() => { setForgotMode(true); setError(''); setForgotEmail(loginData.email); }}
                  style={{ color: 'var(--cyan)', cursor: 'pointer', fontSize: '.85rem' }}>
                  Forgot password?
                </a>
              </div>
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
              {submitting && <div style={{ textAlign: 'center', margin: '8px 0' }}><span className="auth-spinner" /></div>}
              <div className="child-pin-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button className="child-pin-btn" key={n} onClick={() => handlePinEntry(String(n))} disabled={submitting}>{n}</button>
                ))}
                <button className="child-pin-btn" onClick={handlePinClear} disabled={submitting}>⌫</button>
                <button className="child-pin-btn" onClick={() => handlePinEntry('0')} disabled={submitting}>0</button>
                <button className="child-pin-btn" disabled style={{ opacity: 0.3 }}>✓</button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <button className="btn btn-back" onClick={handleDemo} style={{ fontSize: '.85rem' }}>
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
