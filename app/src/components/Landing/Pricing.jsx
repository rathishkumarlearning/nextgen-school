import { useState } from 'react';

function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: '$',
      period: 'forever',
      popular: false,
      features: [
        'Access to 2 free courses',
        'Basic badges',
        'Community forum',
        'No analytics',
      ],
    },
    {
      id: 'single',
      name: 'Single Course',
      price: 19,
      currency: '$',
      period: 'one-time',
      popular: false,
      features: [
        'Unlock 1 full course',
        'All course badges',
        'Certificates',
        'Lifetime access',
      ],
    },
    {
      id: 'full',
      name: 'Full Access',
      price: 39,
      currency: '$',
      period: 'one-time',
      popular: true,
      features: [
        'All 20+ courses',
        'All badges',
        'Certificates & achievements',
        'Lifetime access',
        'Priority support',
        'Exclusive content',
      ],
    },
    {
      id: 'family',
      name: 'Family Plan',
      price: 59,
      currency: '$',
      period: 'one-time',
      popular: false,
      features: [
        'Access for 4 kids',
        'All courses for each',
        'Parental dashboard',
        'Progress tracking',
        'Family badges',
        'Lifetime access',
      ],
    },
  ];

  const handlePayment = (planId) => {
    setSelectedPlan(planId);
    // Integration with Razorpay for payment
    console.log(`Processing payment for plan: ${planId}`);
    // Payment logic would go here
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold font-fredoka text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Flexible Pricing
        </h2>
        <p className="text-center text-gray-400 mb-16 font-fredoka">
          Choose the plan that works best for you. All plans include lifetime access.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-slate-900 shadow-2xl shadow-purple-500/30'
                  : 'border-cyan-400/30 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-cyan-400/60'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-fredoka font-bold whitespace-nowrap">
                  BEST VALUE
                </div>
              )}

              <h3 className="text-2xl font-bold font-fredoka text-white mb-2">
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-cyan-400 font-fredoka">
                  {plan.currency}{plan.price}
                </span>
                <span className="text-gray-400 text-sm font-fredoka">
                  {plan.period}
                </span>
              </div>

              <button
                onClick={() => handlePayment(plan.id)}
                className={`w-full py-3 rounded-lg font-fredoka font-bold mb-6 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                    : 'border border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10'
                }`}
              >
                {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-gray-300 font-fredoka"
                  >
                    <span className="text-green-400 text-lg">✅</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6 text-center">
          <p className="text-blue-300 font-fredoka">
            💳 We accept Razorpay payments. Perfect for Indian parents and students.
            Secure, fast, and convenient.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
