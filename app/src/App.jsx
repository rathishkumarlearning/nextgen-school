import { Routes, Route } from 'react-router-dom';
import Starfield from './components/Common/Starfield';
import AuthBar from './components/Common/AuthBar';
import EngagementPopup from './components/Common/EngagementPopup';
import LandingPage from './components/Landing/LandingPage';
import CourseView from './components/Course/CourseView';
import BadgeGallery from './components/Badges/BadgeGallery';
import ParentDashboard from './components/Parent/ParentDashboard';
import AdminPanel from './components/Admin/AdminPanel';
import SignupModal from './components/Auth/SignupModal';
import LoginModal from './components/Auth/LoginModal';
import { useState } from 'react';

function App() {
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null

  return (
    <div className="relative min-h-screen bg-bg text-text overflow-x-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Starfield background */}
      <Starfield />

      {/* Auth bar */}
      <AuthBar onOpenLogin={() => setAuthModal('login')} onOpenSignup={() => setAuthModal('signup')} />

      {/* Main content */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage onOpenSignup={() => setAuthModal('signup')} />} />
          <Route path="/course/:courseId" element={<CourseView />} />
          <Route path="/badges" element={<BadgeGallery />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>

      {/* Auth modals */}
      {authModal === 'signup' && (
        <SignupModal
          onClose={() => setAuthModal(null)}
          onSwitchToLogin={() => setAuthModal('login')}
        />
      )}
      {authModal === 'login' && (
        <LoginModal
          onClose={() => setAuthModal(null)}
          onSwitchToSignup={() => setAuthModal('signup')}
        />
      )}

      {/* Engagement popup */}
      <EngagementPopup />
    </div>
  );
}

export default App;
