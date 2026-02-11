// ===== CONFIG =====
export const EMAIL_CONFIG = {
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',
  templateWelcome: 'YOUR_WELCOME_TEMPLATE_ID',
  templateProgress: 'YOUR_PROGRESS_TEMPLATE_ID',
  templateCertificate: 'YOUR_CERTIFICATE_TEMPLATE_ID',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
};

export const PAYMENT_CONFIG = {
  stripePublicKey: 'YOUR_STRIPE_PUBLIC_KEY',
  razorpayKeyId: 'YOUR_RAZORPAY_KEY_ID',
  prices: {
    singleCourse: 'YOUR_STRIPE_PRICE_ID_SINGLE',
    fullAccess: 'YOUR_STRIPE_PRICE_ID_BUNDLE',
    familyPlan: 'YOUR_STRIPE_PRICE_ID_FAMILY'
  }
};

// ===== COURSE DATA =====
export const COURSES = {
  ai: {
    title: '🤖 AI Adventures',
    color: 'var(--cyan)',
    chapters: [
      {title: 'What is AI?', emoji: '🤔'},
      {title: 'How AI Learns', emoji: '📚'},
      {title: 'Smart vs Wise', emoji: '🧠'},
      {title: 'AI in Your World', emoji: '🌍'},
      {title: 'Asking Better Questions', emoji: '❓'},
      {title: 'When AI Gets It Wrong', emoji: '❌'},
      {title: 'AI Ethics & Fairness', emoji: '⚖️'},
      {title: 'Be the AI Boss', emoji: '👑'}
    ]
  },
  space: {
    title: '🚀 Space Explorers',
    color: 'var(--purple)',
    chapters: [
      {title: 'Our Solar System', emoji: '🪐'},
      {title: 'Life of a Star', emoji: '⭐'},
      {title: 'Rockets & Launch Science', emoji: '🚀'},
      {title: 'Mission to Mars', emoji: '🔴'},
      {title: 'Gravity & Orbits', emoji: '🌀'},
      {title: 'Space AI', emoji: '🛸'},
      {title: 'Astronaut Training', emoji: '👨‍🚀'},
      {title: 'Design Your Space Mission', emoji: '📋'}
    ]
  },
  robotics: {
    title: '🔧 Robotics Lab',
    color: 'var(--green)',
    chapters: [
      {title: 'What is a Robot?', emoji: '🤖'},
      {title: 'Robot Senses', emoji: '👁️'},
      {title: 'Robot Brain', emoji: '🧠'},
      {title: 'Robot Movement', emoji: '🕹️'},
      {title: 'Types of Robots', emoji: '🦾'},
      {title: 'Robots & AI Together', emoji: '🤝'},
      {title: 'Robot Ethics', emoji: '⚖️'},
      {title: 'Design Your Robot', emoji: '🏗️'}
    ]
  }
};

// Badge data derived from courses
export const BADGE_DATA = [
  ...['ai','space','robotics'].flatMap((c) =>
    COURSES[c].chapters.map((ch, i) => ({
      id: `${c}_${i}`, emoji: ch.emoji,
      name: ch.title, course: c
    }))
  )
];
