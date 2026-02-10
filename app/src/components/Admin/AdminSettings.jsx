import { useState, useEffect } from 'react';
import DB from '../../lib/db';

export default function AdminSettings() {
  const [demoMode, setDemoMode] = useState(false);
  const [pricing, setPricing] = useState({
    singleCourse: 29,
    fullAccess: 79,
    familyPlan: 99,
  });
  const [paymentKeys, setPaymentKeys] = useState({
    stripePublicKey: '',
    razorpayKeyId: '',
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const settings = DB.getSettings();
    if (settings) {
      setDemoMode(settings.demoMode || false);
      setPricing(settings.pricing || pricing);
      setPaymentKeys(settings.paymentKeys || paymentKeys);
    }
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      demoMode,
      pricing,
      paymentKeys,
    };
    DB.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetSeedData = () => {
    if (confirm('Are you sure? This will reset all data to seed defaults.')) {
      DB.resetSeedData();
      setShowResetConfirm(false);
      alert('Seed data has been reset');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Success Message */}
      {isSaved && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-400">✓ Settings saved successfully</p>
        </div>
      )}

      {/* Demo Mode */}
      <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text">Demo Mode</h3>
            <p className="text-text2 text-sm mt-1">Enable demo payments for testing</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="w-5 h-5 accent-cyan-400"
            />
          </label>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-text mb-4">Pricing</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Single Course ($)
            </label>
            <input
              type="number"
              value={pricing.singleCourse}
              onChange={(e) =>
                setPricing((prev) => ({
                  ...prev,
                  singleCourse: parseFloat(e.target.value),
                }))
              }
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Full Access ($)
            </label>
            <input
              type="number"
              value={pricing.fullAccess}
              onChange={(e) =>
                setPricing((prev) => ({
                  ...prev,
                  fullAccess: parseFloat(e.target.value),
                }))
              }
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Family Plan ($)
            </label>
            <input
              type="number"
              value={pricing.familyPlan}
              onChange={(e) =>
                setPricing((prev) => ({
                  ...prev,
                  familyPlan: parseFloat(e.target.value),
                }))
              }
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Payment Keys */}
      <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-text mb-4">Payment Keys</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Stripe Public Key
            </label>
            <input
              type="password"
              value={paymentKeys.stripePublicKey}
              onChange={(e) =>
                setPaymentKeys((prev) => ({
                  ...prev,
                  stripePublicKey: e.target.value,
                }))
              }
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Razorpay Key ID
            </label>
            <input
              type="password"
              value={paymentKeys.razorpayKeyId}
              onChange={(e) =>
                setPaymentKeys((prev) => ({
                  ...prev,
                  razorpayKeyId: e.target.value,
                }))
              }
              className="w-full px-4 py-2 rounded-lg bg-bg border border-glass-border text-text focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSaveSettings} className="btn btn-primary w-full">
        Save Settings
      </button>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
        <p className="text-text2 text-sm mb-4">
          Reset all data to seed defaults. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="btn bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
        >
          Reset Seed Data
        </button>

        {/* Confirm Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6 max-w-sm mx-4">
              <h3 className="text-lg font-bold text-text mb-3">Confirm Reset</h3>
              <p className="text-text2 mb-6">
                Are you sure you want to reset all data? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSeedData}
                  className="flex-1 btn bg-red-500/20 text-red-400 border border-red-500/50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
