import React, { useState } from 'react';

const COURSES = {
  ai: { title: '🤖 AI Adventures', chapters: [{ title: 'What is AI?' },{ title: 'How AI Learns' },{ title: 'Smart vs Wise' },{ title: 'AI in Your World' },{ title: 'Asking Better Questions' },{ title: 'When AI Gets It Wrong' },{ title: 'AI Ethics & Fairness' },{ title: 'Be the AI Boss' }] },
  space: { title: '🚀 Space Explorers', chapters: [{ title: 'Our Solar System' },{ title: 'Life of a Star' },{ title: 'Rockets & Launch Science' },{ title: 'Mission to Mars' },{ title: 'Gravity & Orbits' },{ title: 'Space AI' },{ title: 'Astronaut Training' },{ title: 'Design Your Space Mission' }] },
  robotics: { title: '🔧 Robotics Lab', chapters: [{ title: 'What is a Robot?' },{ title: 'Robot Senses' },{ title: 'Robot Brain' },{ title: 'Robot Movement' },{ title: 'Types of Robots' },{ title: 'Robots & AI Together' },{ title: 'Robot Ethics' },{ title: 'Design Your Robot' }] }
};

const CONVERSATION_PROMPTS = {
  'What is AI?': 'Ask: "Can you explain what AI is to me? Where do we use AI at home?"',
  'How AI Learns': 'Ask: "How does AI learn new things? Is it like how you learn?"',
  'Smart vs Wise': 'Ask: "What\'s the difference between being smart and being wise?"',
  'Our Solar System': 'Ask: "Which planet is your favorite and why?"',
  'Rockets & Launch Science': 'Ask: "What does it take to launch a rocket into space?"',
  'What is a Robot?': 'Ask: "What makes something a robot vs just a machine?"',
  'Robot Ethics': 'Ask: "Should robots make important decisions for us? Why or why not?"'
};

function getState() {
  return {
    name: localStorage.getItem('ngs_name') || '',
    points: parseInt(localStorage.getItem('ngs_points')) || 0,
    completed: JSON.parse(localStorage.getItem('ngs_completed') || '{}'),
    parentEmail: localStorage.getItem('ngs_parent_email') || '',
    activeDays: JSON.parse(localStorage.getItem('ngs_active_days') || '[]'),
    timeSpent: parseInt(localStorage.getItem('ngs_time_spent')) || 0,
  };
}

function getStreak(activeDays) {
  const sorted = [...activeDays].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (sorted.includes(ds)) streak++;
    else break;
  }
  return streak;
}

function generateCertificate(courseTitle) {
  const name = localStorage.getItem('ngs_name') || 'Student';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
    const doc = new window.jspdf.jsPDF('landscape');
    doc.setFillColor(10, 10, 46); doc.rect(0, 0, 297, 210, 'F');
    doc.setDrawColor(6, 182, 212); doc.setLineWidth(3); doc.rect(10, 10, 277, 190, 'S');
    doc.setDrawColor(139, 92, 246); doc.setLineWidth(1); doc.rect(15, 15, 267, 180, 'S');
    doc.setTextColor(251, 191, 36); doc.setFontSize(36); doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });
    doc.setTextColor(226, 232, 240); doc.setFontSize(16); doc.text('This certifies that', 148.5, 75, { align: 'center' });
    doc.setTextColor(6, 182, 212); doc.setFontSize(28); doc.text(name, 148.5, 95, { align: 'center' });
    doc.setTextColor(226, 232, 240); doc.setFontSize(16); doc.text('has successfully completed', 148.5, 115, { align: 'center' });
    doc.setTextColor(139, 92, 246); doc.setFontSize(22); doc.text(courseTitle, 148.5, 135, { align: 'center' });
    doc.setTextColor(226, 232, 240); doc.setFontSize(14); doc.text('at NextGen School — Mind Over Machines', 148.5, 155, { align: 'center' });
    doc.setTextColor(148, 163, 184); doc.setFontSize(12); doc.text(date, 148.5, 175, { align: 'center' });
    doc.save(`NextGenSchool_Certificate_${name.replace(/\s/g, '_')}.pdf`);
  } else {
    // Dynamic import jsPDF
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF('landscape');
      doc.setFillColor(10, 10, 46); doc.rect(0, 0, 297, 210, 'F');
      doc.setDrawColor(6, 182, 212); doc.setLineWidth(3); doc.rect(10, 10, 277, 190, 'S');
      doc.setDrawColor(139, 92, 246); doc.setLineWidth(1); doc.rect(15, 15, 267, 180, 'S');
      doc.setTextColor(251, 191, 36); doc.setFontSize(36); doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });
      doc.setTextColor(226, 232, 240); doc.setFontSize(16); doc.text('This certifies that', 148.5, 75, { align: 'center' });
      doc.setTextColor(6, 182, 212); doc.setFontSize(28); doc.text(name, 148.5, 95, { align: 'center' });
      doc.setTextColor(226, 232, 240); doc.setFontSize(16); doc.text('has successfully completed', 148.5, 115, { align: 'center' });
      doc.setTextColor(139, 92, 246); doc.setFontSize(22); doc.text(courseTitle, 148.5, 135, { align: 'center' });
      doc.setTextColor(226, 232, 240); doc.setFontSize(14); doc.text('at NextGen School — Mind Over Machines', 148.5, 155, { align: 'center' });
      doc.setTextColor(148, 163, 184); doc.setFontSize(12); doc.text(date, 148.5, 175, { align: 'center' });
      doc.save(`NextGenSchool_Certificate_${name.replace(/\s/g, '_')}.pdf`);
    }).catch(() => {
      alert('Certificate generation requires jsPDF. Please try again.');
    });
  }
}

export default function ParentDashboard({ onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem('ngs_parent_email') || '');
  const [state, setState] = useState(null);
  const [sending, setSending] = useState(false);

  const handleLogin = () => {
    const storedEmail = localStorage.getItem('ngs_parent_email') || '';
    if (!email.trim()) return;
    if (email === storedEmail || storedEmail === '') {
      localStorage.setItem('ngs_parent_email', email);
      setState(getState());
      setLoggedIn(true);
    } else {
      alert('Email does not match. Please use the email from signup.');
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else window.location.hash = '#home';
  };

  const handleSendReport = () => {
    setSending(true);
    // EmailJS integration
    const serviceId = 'YOUR_EMAILJS_SERVICE_ID';
    if (serviceId.startsWith('YOUR_')) {
      alert('EmailJS not configured. Set up your service ID to send reports.');
      setSending(false);
      return;
    }
    // Would call emailjs.send() here
    setSending(false);
  };

  if (!loggedIn) {
    return (
      <div id="parent-dashboard">
        <div className="container">
          <div className="pd-header">
            <button className="btn btn-back" onClick={handleBack}>← Back Home</button>
            <h2 style={{ flex: 1, fontSize: '1.4rem' }}>👨‍👩‍👧 Parent Dashboard</h2>
          </div>
          <div id="pd-login" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: 16 }}>🔐</span>
            <h3 style={{ marginBottom: 12 }}>Parent Portal</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Enter the email you provided during signup</p>
            <input
              className="wizard-input"
              placeholder="parent@email.com"
              type="email"
              style={{ maxWidth: 400, margin: '0 auto 16px' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <br />
            <button className="btn btn-primary" onClick={handleLogin}>Access Dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  const { name, points, completed, activeDays, timeSpent } = state;
  const completedCount = Object.keys(completed).length;
  const hours = Math.round((timeSpent + (Date.now() - Date.now())) / 3600000 * 10) / 10 || Math.round(timeSpent / 3600000 * 10) / 10;
  const streak = getStreak(activeDays);

  // Conversation prompt
  const lastCompleted = Object.keys(completed).pop();
  let conversationPrompt = 'Ask your child what they learned today!';
  if (lastCompleted) {
    const [c, idx] = lastCompleted.split('_');
    const ch = COURSES[c]?.chapters[parseInt(idx)];
    if (ch) {
      conversationPrompt = CONVERSATION_PROMPTS[ch.title] || `Ask your child about "${ch.title}" — what did they learn?`;
    }
  }

  // Streak calendar (28 days)
  const today = new Date();
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    days.push({ date: ds, active: activeDays.includes(ds), isToday: i === 0 });
  }

  return (
    <div id="parent-dashboard">
      <div className="container">
        <div className="pd-header">
          <button className="btn btn-back" onClick={handleBack}>← Back Home</button>
          <h2 style={{ flex: 1, fontSize: '1.4rem' }}>👨‍👩‍👧 Parent Dashboard</h2>
        </div>

        <div id="pd-content">
          {/* Stats */}
          <div className="pd-stats">
            <div className="pd-stat"><div className="stat-value">{name || 'Explorer'}</div><div className="stat-label">Student</div></div>
            <div className="pd-stat"><div className="stat-value">{completedCount}/24</div><div className="stat-label">Chapters Done</div></div>
            <div className="pd-stat"><div className="stat-value">{completedCount}</div><div className="stat-label">Badges Earned</div></div>
            <div className="pd-stat"><div className="stat-value">{hours}h</div><div className="stat-label">Time Learning</div></div>
            <div className="pd-stat"><div className="stat-value">{streak}🔥</div><div className="stat-label">Day Streak</div></div>
            <div className="pd-stat"><div className="stat-value">{points}⭐</div><div className="stat-label">Total XP</div></div>
          </div>

          {/* Per-course progress */}
          <div id="pd-courses">
            {['ai', 'space', 'robotics'].map(c => {
              const course = COURSES[c];
              let done = 0;
              for (let i = 0; i < 8; i++) { if (completed[`${c}_${i}`]) done++; }
              const pct = Math.round(done / 8 * 100);
              return (
                <div className="pd-course-card" key={c}>
                  <h4>{course.title}</h4>
                  <div className="progress-bar" style={{ maxWidth: '100%', margin: '8px 0' }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: 'var(--text2)' }}>
                    <span>{done}/8 chapters</span><span>{pct}%</span>
                  </div>
                  {done === 8 && (
                    <button className="cert-btn" style={{ marginTop: 12 }} onClick={() => generateCertificate(course.title)}>
                      📜 Download Certificate
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Streak calendar */}
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <h3 style={{ marginBottom: 12 }}>📅 Learning Streak</h3>
            <div className="pd-streak-cal">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, fontSize: '.6rem', color: 'var(--text3)', marginBottom: 4 }}>
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              {days.map(({ date, active, isToday }) => (
                <div
                  key={date}
                  className={`pd-streak-day ${active ? 'active' : ''} ${isToday ? 'today' : ''}`}
                  title={date}
                />
              ))}
            </div>
          </div>

          {/* Conversation prompts */}
          <div className="pd-conversation">
            <h4>💬 Talk to Your Child About...</h4>
            <p>{conversationPrompt}</p>
          </div>

          {/* Send report */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button className="btn btn-primary" onClick={handleSendReport} disabled={sending}>
              {sending ? 'Sending...' : '📧 Send Progress Report'}
            </button>
          </div>

          {/* Certificates */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>📜 Certificates</h3>
            {['ai', 'space', 'robotics'].map(c => {
              let done = 0;
              for (let i = 0; i < 8; i++) { if (completed[`${c}_${i}`]) done++; }
              if (done !== 8) return null;
              return (
                <button key={c} className="cert-btn" onClick={() => generateCertificate(COURSES[c].title)}>
                  📜 {COURSES[c].title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
