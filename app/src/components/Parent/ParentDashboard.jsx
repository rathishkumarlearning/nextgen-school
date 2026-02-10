import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { generateCertificate } from '../../lib/certificates';

export default function ParentDashboard() {
  const { state } = useGame();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = () => {
    if (emailInput) {
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  };

  // Calculate stats
  const totalChapters = state.completed ? state.completed.length : 0;
  const totalBadges = totalChapters;
  const totalTime = state.totalTime || 0;
  const streak = state.streak || 0;
  const totalXP = state.points || 0;

  // Course progress (out of 8 chapters each)
  const courseProgress = {
    AI: Math.ceil((state.aiCompleted || 0) / 8 * 100),
    Space: Math.ceil((state.spaceCompleted || 0) / 8 * 100),
    Robotics: Math.ceil((state.roboticsCompleted || 0) / 8 * 100),
  };

  const getConversationPrompt = () => {
    const prompts = [
      "Ask about what they learned in their last chapter!",
      "Quiz them on AI concepts from their course",
      "Discuss how coding can solve real-world problems",
      "Ask what they want to learn next",
      "Encourage them to share their achievements",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  // Calendar - last 28 days
  const getLast28Days = () => {
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last28Days = getLast28Days();
  const today = new Date().toISOString().split('T')[0];

  // Mock activity data - in real app, would come from progress
  const activeDays = new Set();

  const handleDownloadCertificate = (courseName) => {
    const doc = generateCertificate(state.name, courseName);
    doc.save(`${state.name}-${courseName}-Certificate.pdf`);
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-text mb-6">Parent Dashboard</h2>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
            />
            <button onClick={handleLogin} className="btn btn-primary px-6">
              Access →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Welcome back! 👋</h1>
          <p className="text-text2">{state.name}'s learning dashboard</p>
        </div>
        <button
          onClick={() => {
            setIsLoggedIn(false);
            setEmailInput('');
          }}
          className="btn btn-secondary"
        >
          Logout
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-4">
          <p className="text-text2 text-sm">Chapters</p>
          <p className="text-3xl font-bold text-cyan-400 mt-1">{totalChapters}/24</p>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-4">
          <p className="text-text2 text-sm">Badges</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{totalBadges}</p>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-4">
          <p className="text-text2 text-sm">Time</p>
          <p className="text-3xl font-bold text-text mt-1">{Math.round(totalTime / 60)}h</p>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-4">
          <p className="text-text2 text-sm">Streak</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">🔥 {streak}</p>
        </div>
        <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-4">
          <p className="text-text2 text-sm">XP</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{totalXP}</p>
        </div>
      </div>

      {/* Course Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {['AI', 'Space', 'Robotics'].map((course) => {
          const emoji = course === 'AI' ? '🤖' : course === 'Space' ? '🚀' : '🛠️';
          const progress = courseProgress[course];
          const isComplete = progress === 100;

          return (
            <div
              key={course}
              className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text">
                  {emoji} {course}
                </h3>
                <span className="text-2xl font-bold text-cyan-400">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-bg rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Certificate Button */}
              {isComplete && (
                <button
                  onClick={() => handleDownloadCertificate(course)}
                  className="btn btn-primary w-full text-sm"
                >
                  📜 Download Certificate
                </button>
              )}
              {!isComplete && (
                <p className="text-text2 text-sm text-center">
                  Complete all chapters to earn certificate
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Streak Calendar */}
      <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-text mb-4">Last 28 Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {last28Days.map((day) => {
            const isToday = day === today;
            const isActive = activeDays.has(day);

            return (
              <div
                key={day}
                className={`h-8 rounded-lg transition ${
                  isActive
                    ? 'bg-green-500/60'
                    : isToday
                      ? 'border-2 border-cyan-400 bg-bg'
                      : 'bg-bg'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Conversation Prompt */}
      <div className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-text mb-3">💬 Conversation Starter</h3>
        <p className="text-text2">{getConversationPrompt()}</p>
      </div>
    </div>
  );
}
