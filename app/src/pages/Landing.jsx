import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { COURSES } from '../utils/constants';
import Footer from '../components/Footer';

const PRINCIPLES = [
  { emoji: '🧠', title: 'Think Critically', desc: "Question everything, including AI. Be the boss, not the follower." },
  { emoji: '🎨', title: 'Create & Build', desc: 'Hands-on, visual, drag-and-drop. Learn by doing, not memorizing.' },
  { emoji: '🤝', title: 'Ethics First', desc: 'Technology should be fair, kind, and helpful for everyone.' },
  { emoji: '🚀', title: 'Dream Big', desc: 'From AI to space to robots — the future belongs to curious kids.' },
  { emoji: '🔬', title: 'Stay Curious', desc: 'Ask questions, explore answers, never stop wondering why.' },
  { emoji: '🌍', title: 'Think Global', desc: 'Learn how technology connects and impacts the whole world.' },
];

const PRICING = [
  {
    title: '🆓 Free Trial', price: '$0', priceSub: 'Forever free', priceClass: 'price-free',
    features: ['Chapter 1 of all 3 courses', '3 interactive activities', 'Basic badge collection'],
    btnClass: 'btn btn-primary', btnText: 'Start Free →', action: 'showCourses'
  },
  {
    title: '📘 Single Course', price: '$19', priceSub: 'per course', priceClass: 'price-paid',
    features: ['All 8 chapters in one course', '50+ interactive activities', 'Course certificate', 'Badge collection'],
    btnClass: 'btn btn-primary', btnText: 'Unlock Course →', action: 'singleCourse'
  },
  {
    title: '🚀 Full Access', price: '$39', priceSub: 'all courses', priceClass: 'price-paid',
    popular: true,
    features: ['All 3 courses (24 chapters)', '150+ interactive activities', 'All certificates', 'Priority support'],
    btnClass: 'btn btn-gold', btnText: 'Best Value →', action: 'fullAccess'
  },
  {
    title: '👨‍👩‍👧‍👦 Family Plan', price: '$59', priceSub: 'up to 3 kids', priceClass: 'price-paid',
    features: ['Everything in Full Access', 'Up to 3 child profiles', 'Parent dashboard', 'Progress reports'],
    btnClass: 'btn btn-primary', btnText: 'Get Family Plan →', action: 'familyPlan'
  },
];

export default function Landing() {
  const { navigate, openCourse, handlePayment, getMetrics } = useApp();
  const landingRef = useRef(null);
  const metrics = getMetrics ? getMetrics() : { students: 0, chapters: 0, badges: 0 };

  // GSAP scroll animations
  useEffect(() => {
    if (typeof window.gsap === 'undefined') return;
    const gsap = window.gsap;

    const elements = landingRef.current?.querySelectorAll('.gsap-reveal');
    if (!elements) return;

    elements.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // Animate metric numbers
    const animateNum = (id, target) => {
      const el = document.getElementById(id);
      if (!el) return;
      gsap.to({ val: 0 }, {
        val: target, duration: 2, ease: 'power2.out',
        onUpdate() { el.textContent = Math.round(this.targets()[0].val); }
      });
    };
    animateNum('metric-students', metrics.students || 247);
    animateNum('metric-chapters', metrics.chapters || 24);
    animateNum('metric-badges', metrics.badges || 50);
  }, []);

  const courseEntries = Object.entries(COURSES || {});

  return (
    <div id="landing" ref={landingRef}>
      {/* Hero */}
      <section id="hero">
        <div className="hero-content">
          <div className="hero-badges">
            <span className="hero-badge"><span>🎯</span> Ages 9-13</span>
            <span className="hero-badge"><span>🧠</span> Visual Learning</span>
            <span className="hero-badge"><span>🎮</span> Interactive</span>
          </div>
          <h1>Mind Over Machines</h1>
          <p>The futuristic school where kids master AI, explore space, and build robots — all through drag-and-drop adventures. No coding required!</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => {
              document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
            }}>🚀 Start Learning</button>
            <button className="btn btn-gold" onClick={() => navigate('badges')}>🏆 My Badges</button>
            <button className="btn btn-back" onClick={() => navigate('parent-dashboard')} style={{ borderColor: 'var(--purple)' }}>
              👨‍👩‍👧 Parent Portal
            </button>
            <a
              href="#admin"
              onClick={(e) => { e.preventDefault(); navigate('admin'); }}
              className="btn btn-back"
              style={{ borderColor: 'var(--cyan)', fontSize: '.9rem', display: 'inline-block', textDecoration: 'none', cursor: 'pointer', position: 'relative', zIndex: 50 }}
            >
              🔐 Admin Panel
            </a>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section id="metrics" className="gsap-reveal">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-num" id="metric-students">0</div>
              <div className="metric-label">Students Learning</div>
            </div>
            <div className="metric-card">
              <div className="metric-num" id="metric-chapters">0</div>
              <div className="metric-label">Chapters Completed</div>
            </div>
            <div className="metric-card">
              <div className="metric-num" id="metric-badges">0</div>
              <div className="metric-label">Badges Earned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section id="principles" className="gsap-reveal">
        <div className="container">
          <h2>🌟 Our Core Principles</h2>
          <div className="principles-grid">
            {PRINCIPLES.map((p, i) => (
              <div className="principle-card glass" key={i}>
                <span className="emoji">{p.emoji}</span>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="gsap-reveal">
        <div className="container">
          <h2>Choose Your Adventure</h2>
          <p className="subtitle">3 courses • 24 chapters • Hundreds of interactive activities</p>
          <div className="courses-grid">
            {courseEntries.map(([id, course]) => (
              <div
                className="course-card glass"
                data-course={id}
                key={id}
                onClick={() => openCourse(id)}
              >
                <span className="emoji">{course.chapters?.[0]?.emoji || (id === 'ai' ? '🤖' : id === 'space' ? '🚀' : '🔧')}</span>
                <h3>{course.title}</h3>
                <p>
                  {id === 'ai' && 'Discover how artificial intelligence works — visually! Drag, drop, and explore the world of smart machines.'}
                  {id === 'space' && 'Launch rockets, plan missions to Mars, explore the solar system. Become a space scientist through interactive adventures!'}
                  {id === 'robotics' && 'Build robots with visual blocks, navigate mazes, add sensors and AI. Design your own robot from scratch!'}
                </p>
                <span className="chapters-count">{course.chapters?.length || 8} Chapters • 50+ Activities</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="gsap-reveal">
        <div className="container">
          <h2>💎 Choose Your Plan</h2>
          <p className="subtitle">Start free — upgrade anytime. Chapter 1 of every course is always free!</p>
          <div className="pricing-grid">
            {PRICING.map((plan, i) => (
              <div className={`pricing-card${plan.popular ? ' popular' : ''}`} key={i}>
                <h3>{plan.title}</h3>
                <div className={`price ${plan.priceClass}`}>{plan.price}</div>
                <div className="price-sub">{plan.priceSub}</div>
                <ul>
                  {plan.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <button
                  className={plan.btnClass}
                  onClick={() => {
                    if (plan.action === 'showCourses') {
                      document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (handlePayment) {
                      handlePayment(plan.action);
                    }
                  }}
                >
                  {plan.btnText}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '.85rem', color: 'var(--text3)' }}>
            🇮🇳 Indian parents: Razorpay also available.{' '}
            <a href="mailto:hello@nextgenschool.aiupskills.com" style={{ color: 'var(--cyan)' }}>Contact us</a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
