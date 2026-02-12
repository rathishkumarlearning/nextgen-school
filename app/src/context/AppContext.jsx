import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import DB from '../utils/db.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { session, isLoggedIn, isChild, childSession, loading: authLoading } = useAuth();

  const [state, setState] = useState({
    points: 0,
    completed: {},
    purchases: {},
    notifications: [],
    currentCourse: null,
    currentChapter: 0,
    currentView: 'home',
    dataLoading: true,
  });

  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Load data from Supabase when session changes
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setState(prev => ({ ...prev, completed: {}, purchases: {}, points: 0, dataLoading: false }));
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        const completed = {};
        let points = 0;

        // Load progress
        if (isChild && childSession) {
          const progress = await DB.getProgressByChild(childSession.id);
          progress.forEach(p => {
            completed[`${p.course_id}_${p.chapter_index}`] = true;
          });
          points = Object.keys(completed).length * 25;
        } else if (session?.id) {
          // For parent, load progress of all their children
          const kids = await DB.getChildrenByParent(session.id);
          for (const kid of kids) {
            const progress = await DB.getProgressByChild(kid.id);
            progress.forEach(p => {
              completed[`${p.course_id}_${p.chapter_index}`] = true;
            });
          }
          points = Object.keys(completed).length * 25;
        }

        // Load purchases
        const purchases = {};
        if (session?.id) {
          try {
            const purchaseData = await DB.getPurchases();
            const myPurchases = purchaseData.filter(p =>
              p.user_id === session.id && (p.status === 'completed' || p.status === 'success')
            );
            myPurchases.forEach(p => {
              if (p.plan === 'fullAccess' || p.plan === 'familyPlan') {
                purchases.fullAccess = true;
              } else if (p.plan === 'singleCourse' && p.course_id) {
                purchases[p.course_id] = true;
              }
            });
          } catch {}
        }

        if (!cancelled) {
          setState(prev => ({ ...prev, completed, purchases, points, dataLoading: false }));
        }
      } catch (err) {
        console.error('Error loading app data:', err);
        if (!cancelled) setState(prev => ({ ...prev, dataLoading: false }));
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [session?.id, authLoading, isChild, childSession?.id]);

  const completeChapter = useCallback(async (courseId, chapterIdx) => {
    const key = `${courseId}_${chapterIdx}`;
    setState(prev => {
      if (prev.completed[key]) return prev;
      return {
        ...prev,
        completed: { ...prev.completed, [key]: true },
        points: prev.points + 25
      };
    });

    // Write to Supabase
    const childId = childSession?.id;
    if (childId) {
      try {
        await DB.addProgress({ childId, courseId: courseId, chapterIndex: chapterIdx });
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }
  }, [childSession?.id]);

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

  const navigate = useCallback((view, hash) => {
    setState(prev => ({ ...prev, currentView: view }));
    window.location.hash = hash || view;
  }, []);

  const openCourse = useCallback((courseId) => {
    setState(prev => ({ ...prev, currentCourse: courseId, currentChapter: 0, currentView: 'courses' }));
    window.location.hash = 'courses';
  }, []);

  const handlePayment = useCallback(async (plan) => {
    // Create purchase record in Supabase
    if (session?.id) {
      const amounts = { singleCourse: 19, fullAccess: 39, familyPlan: 59 };
      try {
        await DB.addPurchase({
          userId: session.id,
          plan,
          amount: amounts[plan] || 0,
          currency: 'USD',
          status: 'pending',
          method: 'email',
          courseId: plan === 'singleCourse' ? state.currentCourse : null,
        });
      } catch {}
    }

    const msg = `Hi! I'd like to purchase the ${plan === 'singleCourse' ? 'Single Course ($19)' : plan === 'fullAccess' ? 'Full Access Bundle ($39)' : 'Family Plan ($59)'} for NextGen School.`;
    window.open(`mailto:hello@nextgenschool.aiupskills.com?subject=NextGen School Purchase&body=${encodeURIComponent(msg)}`);
  }, [session?.id, state.currentCourse]);

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

  const getMetrics = useCallback(async () => {
    try {
      const stats = await DB.getStats();
      return {
        students: stats.totalChildren || 0,
        chapters: stats.chaptersCompleted || 0,
        badges: stats.chaptersCompleted || 0,
      };
    } catch {
      return { students: 0, chapters: 0, badges: 0 };
    }
  }, []);

  const addPoints = useCallback((n) => {
    setState(prev => ({ ...prev, points: prev.points + n }));
  }, []);

  const toggleNotifPanel = useCallback(() => {
    setShowNotifPanel(prev => !prev);
  }, []);

  const value = {
    state,
    setState,
    addPoints,
    completeChapter,
    setCurrentCourse,
    setCurrentChapter,
    setCurrentView,
    setNotifications,
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
