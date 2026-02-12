import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import DB from '../utils/db.js';
import Session from '../utils/session.js';
import * as authService from '../services/auth.service.js';
import supabase from '../utils/supabase.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const USE_SUPABASE = supabase && !supabaseUrl.includes('YOUR_');

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => USE_SUPABASE ? null : Session.get());
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(USE_SUPABASE);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ngs_demo_mode') || 'false'); } catch { return false; }
  });
  const [authModalType, setAuthModalType] = useState(null);
  const [childSession, setChildSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ngs_child_session') || 'null'); } catch { return null; }
  });
  const subscriptionRef = useRef(null);

  // ---- Supabase auth listener ----
  useEffect(() => {
    if (!USE_SUPABASE) return;

    // Get initial session
    authService.getSession().then(async ({ data: sess }) => {
      if (sess?.user) {
        const userData = { id: sess.user.id, email: sess.user.email, name: sess.user.user_metadata?.name || sess.user.email, role: 'parent' };
        setSession(userData);
        const { data: prof } = await authService.getProfile(sess.user.id);
        if (prof) { setProfile(prof); userData.role = prof.role || 'parent'; userData.name = prof.name || userData.name; setSession({ ...userData }); }
      }
      setLoading(false);
    });

    // Listen for changes
    subscriptionRef.current = authService.onAuthStateChange(async (event, sess) => {
      if (event === 'SIGNED_IN' && sess?.user) {
        const userData = { id: sess.user.id, email: sess.user.email, name: sess.user.user_metadata?.name || sess.user.email, role: 'parent' };
        setSession(userData);
        setChildSession(null);
        localStorage.removeItem('ngs_child_session');
        const { data: prof } = await authService.getProfile(sess.user.id);
        if (prof) { setProfile(prof); userData.role = prof.role || 'parent'; userData.name = prof.name || userData.name; setSession({ ...userData }); }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
      }
    });

    return () => { subscriptionRef.current?.unsubscribe(); };
  }, []);

  // ---- Login ----
  const login = useCallback(async (email, password) => {
    if (!USE_SUPABASE) {
      const user = DB.getUserByEmail(email);
      if (!user || user.password !== password) return { error: 'Invalid email or password' };
      const data = { id: user.id, name: user.name, email: user.email, role: 'parent' };
      Session.set(data); setSession(data); DB.logEvent('login', { userId: user.id });
      return { success: true, user: data };
    }
    const { data, error } = await authService.signIn(email, password);
    if (error) return { error };
    return { success: true, user: data.user };
  }, []);

  // ---- Signup ----
  const signup = useCallback(async (name, email, password, childName, childAge, childPin) => {
    if (!name || !email || !password) return { error: 'Please fill in name, email, and password' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };

    if (!USE_SUPABASE) {
      if (DB.getUserByEmail(email)) return { error: 'Email already registered. Try logging in.' };
      const parent = DB.addUser({ name, email, password, role: 'parent' });
      if (childName && childPin && childPin.length === 4) DB.addChild({ name: childName, age: childAge || 10, pin: childPin, parentId: parent.id });
      const data = { id: parent.id, name: parent.name, email: parent.email, role: 'parent' };
      Session.set(data); setSession(data); DB.logEvent('signup', { userId: parent.id, email });
      return { success: true, user: data, childName };
    }

    const { data, error } = await authService.signUp({ name, email, password, childName, childAge, childPin });
    if (error) return { error };
    return { success: true, user: data.user, childName };
  }, []);

  // ---- Child Login ----
  const childLoginFn = useCallback(async (pin) => {
    if (!USE_SUPABASE) {
      const child = DB.getChildByPin(pin);
      if (!child) return { error: 'Invalid PIN. Try again.' };
      const data = { id: child.id, name: child.name, role: 'child', parentId: child.parentId };
      Session.set(data); setSession(data); DB.logEvent('child_login', { childId: child.id });
      return { success: true, user: data };
    }
    const { data, error } = await authService.childLogin(pin);
    if (error) return { error };
    const childData = { id: data.child.id, name: data.child.name, role: 'child', parentId: data.child.parent_id };
    setChildSession(childData);
    localStorage.setItem('ngs_child_session', JSON.stringify(childData));
    setSession(childData);
    return { success: true, user: childData };
  }, []);

  // ---- Logout ----
  const logout = useCallback(async () => {
    if (USE_SUPABASE) await authService.signOut();
    Session.clear();
    setSession(null);
    setProfile(null);
    setChildSession(null);
    localStorage.removeItem('ngs_child_session');
  }, []);

  // ---- Derived state ----
  const activeSession = childSession || session;
  const isLoggedIn = !!activeSession || isDemoMode;
  const isParent = activeSession?.role === 'parent';
  const isChild = activeSession?.role === 'child';
  const currentUser = activeSession;
  const user = activeSession;

  const isAdminFn = useCallback(async (userId) => {
    if (!USE_SUPABASE) return false;
    return authService.isAdmin(userId);
  }, []);

  const openAuthModal = useCallback((type = 'login') => setAuthModalType(type), []);
  const closeAuthModal = useCallback(() => setAuthModalType(null), []);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    localStorage.setItem('ngs_demo_mode', 'true');
    try { const s = DB.getSettings?.() || {}; s.demoMode = true; DB.saveSettings?.(s); } catch {}
  }, []);

  const doSignup = useCallback(async ({ name, email, password, childName, childAge, childPin }) => {
    const result = await signup(name, email, password, childName, childAge, childPin);
    if (result.error) throw new Error(result.error);
    return result;
  }, [signup]);

  const doLogin = useCallback(async (email, password) => {
    const result = await login(email, password);
    if (result.error) throw new Error(result.error);
    return result;
  }, [login]);

  const doChildLogin = useCallback(async (pin) => {
    const result = await childLoginFn(pin);
    if (result.error) throw new Error(result.error);
    return result;
  }, [childLoginFn]);

  const value = {
    session: activeSession,
    login,
    signup,
    childLogin: childLoginFn,
    logout,
    isLoggedIn,
    isParent,
    isChild,
    currentUser,
    user,
    isDemoMode,
    setDemoMode: setIsDemoMode,
    authModalType,
    openAuthModal,
    closeAuthModal,
    enableDemoMode,
    doSignup,
    doLogin,
    doChildLogin,
    isAdmin: isAdminFn,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
