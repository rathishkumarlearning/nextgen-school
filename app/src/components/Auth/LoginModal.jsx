import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PinPad from './PinPad';

export default function LoginModal({ onClose, onSwitchToSignup }) {
  const { login, loginChild } = useAuth();
  const [activeTab, setActiveTab] = useState('parent'); // 'parent' or 'child'
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleParentLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!parentEmail.trim()) newErrors.email = 'Email is required';
    if (!parentPassword) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(parentEmail, parentPassword);
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChildLogin = async (pin) => {
    setIsSubmitting(true);
    try {
      const result = await loginChild(pin);
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.message || 'Invalid PIN' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text2 hover:text-text transition"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-glass-border">
          <button
            onClick={() => {
              setActiveTab('parent');
              setErrors({});
            }}
            className={`pb-3 px-2 font-medium transition ${
              activeTab === 'parent'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-text2 hover:text-text'
            }`}
          >
            👨‍👩‍👧 Parent
          </button>
          <button
            onClick={() => {
              setActiveTab('child');
              setErrors({});
            }}
            className={`pb-3 px-2 font-medium transition ${
              activeTab === 'child'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-text2 hover:text-text'
            }`}
          >
            🧒 Child PIN
          </button>
        </div>

        {/* Parent Login Tab */}
        {activeTab === 'parent' && (
          <form onSubmit={handleParentLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => {
                  setParentEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                value={parentPassword}
                onChange={(e) => {
                  setParentPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-red-500 text-sm text-center">{errors.submit}</p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full mt-6"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

        {/* Child PIN Tab */}
        {activeTab === 'child' && (
          <div className="space-y-4">
            {errors.submit && (
              <p className="text-red-500 text-sm text-center">{errors.submit}</p>
            )}
            <PinPad onSubmit={handleChildLogin} disabled={isSubmitting} />
          </div>
        )}

        {/* Switch to Signup */}
        <p className="text-center text-text2 text-sm mt-6">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
