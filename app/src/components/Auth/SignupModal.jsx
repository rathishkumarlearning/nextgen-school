import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SignupModal({ onClose, onSwitchToLogin }) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    childName: '',
    childAge: '',
    childPin: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (formData.childName && !formData.childAge)
      newErrors.childAge = 'Child age is required if adding a child';
    if (formData.childAge && !formData.childName)
      newErrors.childName = 'Child name is required if adding a child';
    if (formData.childAge && (formData.childAge < 9 || formData.childAge > 13))
      newErrors.childAge = 'Child age must be between 9 and 13';

    if (formData.childName && !formData.childPin)
      newErrors.childPin = 'Child PIN is required';
    if (formData.childPin && formData.childPin.length !== 4)
      newErrors.childPin = 'PIN must be exactly 4 digits';
    if (formData.childPin && !/^\d{4}$/.test(formData.childPin))
      newErrors.childPin = 'PIN must contain only digits';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.childName || undefined,
        formData.childAge ? parseInt(formData.childAge) : undefined,
        formData.childPin || undefined
      );

      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.message || 'Signup failed' });
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

        {/* Header */}
        <div className="mb-6">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <h2 className="text-2xl font-bold text-text">Create Parent Account</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Child Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Child's Name (Optional)
            </label>
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              placeholder="Child's name"
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
            />
            {errors.childName && (
              <p className="text-red-500 text-sm mt-1">{errors.childName}</p>
            )}
          </div>

          {/* Child Age (Optional) */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Child's Age (Optional)
            </label>
            <input
              type="number"
              name="childAge"
              value={formData.childAge}
              onChange={handleChange}
              placeholder="9-13"
              min="9"
              max="13"
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
            />
            {errors.childAge && (
              <p className="text-red-500 text-sm mt-1">{errors.childAge}</p>
            )}
          </div>

          {/* Child PIN (Optional) */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Child's 4-digit PIN (Optional)
            </label>
            <input
              type="text"
              name="childPin"
              value={formData.childPin}
              onChange={handleChange}
              placeholder="0000"
              maxLength="4"
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
            />
            {errors.childPin && (
              <p className="text-red-500 text-sm mt-1">{errors.childPin}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-500 text-sm text-center">{errors.submit}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full mt-6"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account 🚀'}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="text-center text-text2 text-sm mt-4">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
