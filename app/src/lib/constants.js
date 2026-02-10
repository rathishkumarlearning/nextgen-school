// Course and configuration constants for NextGen School

export const COURSES = {
  ai: {
    id: 'ai',
    title: 'AI Adventures',
    emoji: '🤖',
    color: '#06b6d4',
    subtitle: 'Explore artificial intelligence and machine learning',
    chapters: [
      { idx: 0, title: 'What is AI?', emoji: '🤔' },
      { idx: 1, title: 'How AI Learns', emoji: '🧠' },
      { idx: 2, title: 'Smart vs Wise', emoji: '⚖️' },
      { idx: 3, title: 'AI in Your World', emoji: '🌍' },
      { idx: 4, title: 'Asking Better Questions', emoji: '❓' },
      { idx: 5, title: 'When AI Gets It Wrong', emoji: '⚠️' },
      { idx: 6, title: 'AI Ethics & Fairness', emoji: '⚡' },
      { idx: 7, title: 'Be the AI Boss', emoji: '👑' },
    ],
  },
  space: {
    id: 'space',
    title: 'Space Explorers',
    emoji: '🚀',
    color: '#8b5cf6',
    subtitle: 'Discover the wonders of our solar system',
    chapters: [
      { idx: 0, title: 'Our Solar System', emoji: '☀️' },
      { idx: 1, title: 'The Moon', emoji: '🌙' },
      { idx: 2, title: 'Stars & Constellations', emoji: '⭐' },
      { idx: 3, title: 'Rockets & Launches', emoji: '🛸' },
      { idx: 4, title: 'Life in Space', emoji: '🛰️' },
      { idx: 5, title: 'Mars Mission', emoji: '🔴' },
      { idx: 6, title: 'Space Technology', emoji: '🔬' },
      { idx: 7, title: 'Future Explorer', emoji: '🌌' },
    ],
  },
  robotics: {
    id: 'robotics',
    title: 'Robotics Lab',
    emoji: '🦾',
    color: '#22c55e',
    subtitle: 'Build, program, and control robots',
    chapters: [
      { idx: 0, title: 'What is a Robot?', emoji: '🤖' },
      { idx: 1, title: 'Sensors & Inputs', emoji: '👀' },
      { idx: 2, title: 'Programming Basics', emoji: '⚙️' },
      { idx: 3, title: 'Build a Bot', emoji: '🔧' },
      { idx: 4, title: 'Robot Navigation', emoji: '🧭' },
      { idx: 5, title: 'Smart Robots', emoji: '💡' },
      { idx: 6, title: 'Robots in Real Life', emoji: '🏭' },
      { idx: 7, title: 'Design Challenge', emoji: '🎯' },
    ],
  },
};

// Generate badge data from courses
export const BADGE_DATA = (() => {
  const badges = {};
  Object.entries(COURSES).forEach(([courseId, course]) => {
    badges[courseId] = {
      id: `badge_${courseId}`,
      name: `${course.title} Master`,
      emoji: course.emoji,
      description: `Complete all chapters in ${course.title}`,
      color: course.color,
    };
  });
  // Add achievement badges
  badges.speedster = {
    id: 'badge_speedster',
    name: 'Speedster',
    emoji: '⚡',
    description: 'Complete 5 chapters in one day',
    color: '#fbbf24',
  };
  badges.consistency = {
    id: 'badge_consistency',
    name: 'Consistent Learner',
    emoji: '🔥',
    description: 'Maintain a 7-day learning streak',
    color: '#ef4444',
  };
  badges.curious = {
    id: 'badge_curious',
    name: 'Curious Mind',
    emoji: '🧐',
    description: 'Explore all 3 courses',
    color: '#06b6d4',
  };
  return badges;
})();

// Email configuration (placeholder keys)
export const EMAIL_CONFIG = {
  serviceId: process.env.VITE_EMAILJS_SERVICE_ID || 'service_demo',
  templateId: process.env.VITE_EMAILJS_TEMPLATE_ID || 'template_demo',
  publicKey: process.env.VITE_EMAILJS_PUBLIC_KEY || 'public_demo',
  fromEmail: 'hello@nextgenschool.com',
  fromName: 'NextGen School',
};

// Payment configuration (placeholder keys)
export const PAYMENT_CONFIG = {
  stripe: {
    publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_demo',
    testMode: true,
  },
  razorpay: {
    keyId: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
    testMode: true,
  },
};

// Pricing plans
export const PRICING_PLANS = {
  free: {
    name: 'Free Trial',
    price: 0,
    currency: 'USD',
    description: 'Chapter 1 of all courses',
    features: [
      'Access Chapter 1 (AI, Space, Robotics)',
      'Basic progress tracking',
      'Certificate for each chapter',
    ],
    courseIds: [],
    buttonText: 'Get Started',
  },
  single: {
    name: 'Single Course',
    price: 19,
    currency: 'USD',
    description: 'Full access to one course',
    features: [
      'All 8 chapters (one course)',
      'Progress tracking & analytics',
      'Achievement badges',
      'Course completion certificate',
    ],
    courseIds: ['ai'],
    buttonText: 'Buy Now',
  },
  bundle: {
    name: 'Bundle',
    price: 39,
    currency: 'USD',
    description: 'All 3 courses',
    features: [
      'All 24 chapters (3 courses)',
      'Progress tracking & analytics',
      'Achievement badges',
      'Course completion certificates',
      'Early access to new content',
    ],
    courseIds: ['ai', 'space', 'robotics'],
    buttonText: 'Buy Bundle',
    popular: true,
  },
  family: {
    name: 'Family Plan',
    price: 59,
    currency: 'USD',
    description: 'Up to 5 children',
    features: [
      'All 24 chapters (3 courses)',
      'Unlimited children (same family)',
      'Family dashboard',
      'Progress tracking & analytics',
      'Achievement badges',
      'Priority email support',
    ],
    courseIds: ['ai', 'space', 'robotics'],
    buttonText: 'Buy Family Plan',
    popular: false,
  },
};

// Encouragement messages for activities
export const ENCOURAGEMENTS = [
  '🌟 Awesome job! Keep going!',
  '💪 You\'re doing great!',
  '🎉 Fantastic effort!',
  '✨ Great thinking!',
  '🚀 You\'re on fire!',
  '🧠 Smart choice!',
  '⭐ Excellent work!',
  '🎯 Nailed it!',
  '💯 Perfect approach!',
  '🏆 Champion mindset!',
  '🌈 Keep exploring!',
  '🔥 Amazing effort!',
  '👏 Well done!',
  '🎨 Creative thinking!',
  '🧩 Problem solved!',
];

// Level progression
export const LEVELS = [
  { level: 1, minXp: 0, name: 'Novice Explorer', emoji: '🌱' },
  { level: 2, minXp: 50, name: 'Junior Scientist', emoji: '👨‍🔬' },
  { level: 3, minXp: 100, name: 'Tech Enthusiast', emoji: '💻' },
  { level: 4, minXp: 200, name: 'Problem Solver', emoji: '🧩' },
  { level: 5, minXp: 350, name: 'Master Thinker', emoji: '🧠' },
  { level: 6, minXp: 500, name: 'AI Pioneer', emoji: '🤖' },
  { level: 7, minXp: 750, name: 'Space Adventurer', emoji: '🚀' },
  { level: 8, minXp: 1000, name: 'Robotics Expert', emoji: '🦾' },
  { level: 9, minXp: 1500, name: 'Innovation Leader', emoji: '⭐' },
  { level: 10, minXp: 2000, name: 'Legend', emoji: '👑' },
];
