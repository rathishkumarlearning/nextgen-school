import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Starfield from './components/Starfield.jsx';
import Sidebar from './components/Sidebar.jsx';
import Landing from './pages/Landing.jsx';
import CourseView from './pages/CourseView.jsx';
import BadgeGallery from './pages/BadgeGallery.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import Admin from './pages/Admin.jsx';
import Onboarding from './pages/Onboarding.jsx';
import AuthModal from './modals/AuthModal.jsx';

function AppRouter() {
  const { state, setCurrentView } = useApp();

  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.replace('#', '') || 'home';
      const validViews = ['home', 'courses', 'badges', 'parent', 'admin', 'onboarding'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      } else {
        setCurrentView('home');
      }
    }
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setCurrentView]);

  const { currentView } = state;

  return (
    <>
      <Starfield />
      <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', maxWidth: '100vw' }}>
        <Sidebar />
        <main className="main-content">
          {currentView === 'home' && <Landing />}
          {currentView === 'courses' && <CourseView />}
          {currentView === 'badges' && <BadgeGallery />}
          {currentView === 'parent' && <ParentDashboard />}
          {currentView === 'admin' && <Admin />}
          {currentView === 'onboarding' && <Onboarding />}
        </main>
      </div>
      <AuthModal />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AuthProvider>
  );
}
