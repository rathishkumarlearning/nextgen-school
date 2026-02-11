import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => ({
    name: localStorage.getItem('ngs_name') || '',
    points: parseInt(localStorage.getItem('ngs_points')) || 0,
    completed: JSON.parse(localStorage.getItem('ngs_completed') || '{}'),
    parentEmail: localStorage.getItem('ngs_parent_email') || '',
    notifications: JSON.parse(localStorage.getItem('ngs_notifications') || '[]'),
    purchases: JSON.parse(localStorage.getItem('ngs_purchases') || '{}'),
    activeDays: JSON.parse(localStorage.getItem('ngs_active_days') || '[]'),
    sessionStart: Date.now(),
    timeSpent: parseInt(localStorage.getItem('ngs_time_spent')) || 0,
    currentCourse: null,
    currentChapter: 0,
    currentView: 'home', // home, courses, badges, parent, admin, onboarding
  }));

  const save = useCallback(() => {
    localStorage.setItem('ngs_name', state.name);
    localStorage.setItem('ngs_points', state.points);
    localStorage.setItem('ngs_completed', JSON.stringify(state.completed));
    localStorage.setItem('ngs_parent_email', state.parentEmail);
    localStorage.setItem('ngs_notifications', JSON.stringify(state.notifications));
    localStorage.setItem('ngs_purchases', JSON.stringify(state.purchases));
    localStorage.setItem('ngs_active_days', JSON.stringify(state.activeDays));
    localStorage.setItem('ngs_time_spent', state.timeSpent);
  }, [state]);

  // Auto-save on state change
  useEffect(() => {
    save();
  }, [state.name, state.points, state.completed, state.parentEmail, state.notifications, state.purchases, state.activeDays, state.timeSpent]);

  // Time tracking on unload
  useEffect(() => {
    const handleUnload = () => {
      const elapsed = Date.now() - state.sessionStart;
      localStorage.setItem('ngs_time_spent', state.timeSpent + elapsed);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [state.sessionStart, state.timeSpent]);

  const setName = useCallback((name) => {
    setState(prev => ({ ...prev, name }));
  }, []);

  const setParentEmail = useCallback((email) => {
    setState(prev => ({ ...prev, parentEmail: email }));
  }, []);

  const addPoints = useCallback((n) => {
    setState(prev => ({ ...prev, points: prev.points + n }));
  }, []);

  const completeChapter = useCallback((courseId, chapterIdx) => {
    setState(prev => {
      const key = `${courseId}_${chapterIdx}`;
      if (prev.completed[key]) return prev;
      return {
        ...prev,
        completed: { ...prev.completed, [key]: true },
        points: prev.points + 25
      };
    });
  }, []);

  const setCurrentCourse = useCallback((courseId) => {
    setState(prev => ({ ...prev, currentCourse: courseId, currentChapter: 0 }));
  }, []);

  const setCurrentChapter = useCallback((idx) => {
    setState(prev => ({ ...prev, currentChapter: idx }));
  }, []);

  const setCurrentView = useCallback((view) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const setNotifications = useCallback((notifications) => {
    setState(prev => ({ ...prev, notifications }));
  }, []);

  const setPurchases = useCallback((purchases) => {
    setState(prev => ({ ...prev, purchases }));
  }, []);

  const setActiveDays = useCallback((activeDays) => {
    setState(prev => ({ ...prev, activeDays }));
  }, []);

  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const navigate = useCallback((view, hash) => {
    setState(prev => ({ ...prev, currentView: view }));
    window.location.hash = hash || view;
  }, []);

  const openCourse = useCallback((courseId) => {
    setState(prev => ({ ...prev, currentCourse: courseId, currentChapter: 0, currentView: 'courses' }));
    window.location.hash = 'courses';
  }, []);

  const handlePayment = useCallback((plan) => {
    const msg = `Hi! I'd like to purchase the ${plan === 'singleCourse' ? 'Single Course ($19)' : plan === 'fullAccess' ? 'Full Access Bundle ($39)' : 'Family Plan ($59)'} for NextGen School.`;
    window.open(`mailto:hello@nextgenschool.aiupskills.com?subject=NextGen School Purchase&body=${encodeURIComponent(msg)}`);
  }, []);

  const handlePurchase = useCallback((plan) => {
    setState(prev => {
      const purchases = { ...prev.purchases };
      if (plan === 'fullAccess' || plan === 'familyPlan') {
        purchases.fullAccess = true;
      } else if (plan === 'singleCourse') {
        purchases[prev.currentCourse || 'ai'] = true;
      }
      return { ...prev, purchases };
    });
  }, []);

  const getMetrics = useCallback(() => {
    const completedCount = Object.keys(state.completed).length;
    return {
      students: 247,
      chapters: completedCount || 24,
      badges: completedCount || 50
    };
  }, [state.completed]);

  const toggleNotifPanel = useCallback(() => {
    setShowNotifPanel(prev => !prev);
  }, []);

  const value = {
    state,
    setState,
    save,
    setName,
    setParentEmail,
    addPoints,
    completeChapter,
    setCurrentCourse,
    setCurrentChapter,
    setCurrentView,
    setNotifications,
    setPurchases,
    setActiveDays,
    navigate,
    openCourse,
    handlePayment,
    handlePurchase,
    getMetrics,
    toggleNotifPanel,
    showNotifPanel,
    notifications: state.notifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
