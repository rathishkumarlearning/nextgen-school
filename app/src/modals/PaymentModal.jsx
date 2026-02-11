import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PAYMENT_CONFIG } from '../utils/constants';

const PLANS = {
  singleCourse: { name: '📘 Single Course', price: '$19', desc: 'All 8 chapters in one course' },
  fullAccess: { name: '🚀 Full Access', price: '$39', desc: 'All 3 courses (24 chapters)' },
  familyPlan: { name: '👨‍👩‍👧‍👦 Family Plan', price: '$59', desc: 'Up to 3 kids, all courses' },
};

export default function PaymentModal({ plan, onClose }) {
  const { state, handlePurchase } = useApp();
  const [method, setMethod] = useState('stripe'); // stripe | razorpay
  const [processing, setProcessing] = useState(false);

  if (!plan) return null;

  const planInfo = PLANS[plan] || { name: plan, price: '?', desc: '' };

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (handlePurchase) {
        await handlePurchase(plan, method);
      }
      onClose?.();
    } catch (e) {
      console.error('Payment failed:', e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="auth-overlay show">
      <div className="auth-modal" style={{ maxWidth: '480px' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <span style={{ fontSize: '3rem', display: 'block', textAlign: 'center', marginBottom: '8px' }}>💳</span>
        <h2 style={{ textAlign: 'center' }}>Complete Purchase</h2>
        <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '24px', fontSize: '.95rem' }}>
          {planInfo.name} — {planInfo.price}
        </p>

        <div style={{
          padding: '20px', borderRadius: '16px',
          background: 'var(--glass)', border: '1px solid var(--glass-border)',
          marginBottom: '20px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: 'var(--cyan)' }}>
            {planInfo.price}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: '.9rem', marginTop: '4px' }}>
            {planInfo.desc}
          </div>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '12px' }}>Select payment method:</p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            className={`auth-tab${method === 'stripe' ? ' active' : ''}`}
            onClick={() => setMethod('stripe')}
            style={{ flex: 1 }}
          >
            💳 Stripe
          </button>
          <button
            className={`auth-tab${method === 'razorpay' ? ' active' : ''}`}
            onClick={() => setMethod('razorpay')}
            style={{ flex: 1 }}
          >
            🇮🇳 Razorpay
          </button>
        </div>

        <button
          className="btn btn-gold"
          onClick={handlePay}
          disabled={processing}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {processing ? '⏳ Processing...' : `Pay ${planInfo.price} →`}
        </button>

        <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text3)', marginTop: '12px' }}>
          🔒 Secure payment. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
