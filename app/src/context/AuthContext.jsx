import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import DB from '../utils/db.js';
import * as authService from '../services/auth.service.js';
import supabase from '../utils/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authModalType, setAuthModalType] = useState(null);
  const [childSession, setChildSession] = useState(null);
  const subscriptionRef = useRef(null);

  // ---- Supabase auth listener ----
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    authService.getSession().then(async ({ data: sess }) => {
      if (sess?.user) {
        const userData = { id: sess.user.id, email: sess.user.email, name: sess.user.user_metadata?.name || sess.user.email, role: 'parent' };
        setSession(userData);
        try {
          const { data: prof } = await authService.getProfile(sess.user.id);
          if (prof) {
            setProfile(prof);
            userData.role = prof.role || 'parent';
            userData.name = prof.name || userData.name;
            setSession({ ...userData });
          }
        } catch {}
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    subscriptionRef.current = authService.onAuthStateChange(async (event, sess) => {
      if (event === 'SIGNED_IN' && sess?.user) {
        const userData = { id: sess.user.id, email: sess.user.email, name: sess.user.user_metadata?.name || sess.user.email, role: 'parent' };
        setSession(userData);
        setChildSession(null);
        try {
          const { data: prof } = await authService.getProfile(sess.user.id);
          if (prof) {
            setProfile(prof);
            userData.role = prof.role || 'parent';
            userData.name = prof.name || userData.name;
            setSession({ ...userData });
          }
        } catch {}
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setChildSession(null);
      }
    });

    return () => { subscriptionRef.current?.unsubscribe(); };
  }, []);

  // ---- Login ----
  const login = useCallback(async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    if (error) return { error };
    return { success: true, user: data.user };
  }, []);

  // ---- Signup ----
  const signup = useCallback(async (name, email, password, childName, childAge, childPin) => {
    if (!name || !email || !password) return { error: 'Please fill in name, email, and password' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };
    const { data, error } = await authService.signUp({ name, email, password, childName, childAge, childPin });
    if (error) return { error };
    return { success: true, user: data.user, childName };
  }, []);

  // ---- Child Login ----
  const childLoginFn = useCallback(async (pin) => {
    const { data, error } = await authService.childLogin(pin);
    if (error) return { error };
    const childData = { id: data.child.id, name: data.child.name, role: 'child', parentId: data.child.parent_id };
    setChildSession(childData);
    return { success: true, user: childData };
  }, []);

  // ---- Logout ----
  const logout = useCallback(async () => {
    if (supabase) await authService.signOut();
    setSession(null);
    setProfile(null);
    setChildSession(null);
    setIsDemoMode(false);
  }, []);

  // ---- Forgot password ----
  const resetPassword = useCallback(async (email) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { success: true };
  }, []);

  // ---- Derived state ----
  const activeSession = childSession || session;
  const isLoggedIn = !!activeSession || isDemoMode;
  const isParent = activeSession?.role === 'parent';
  const isChild = activeSession?.role === 'child';
  const isAdmin = profile?.role === 'admin' || activeSession?.role === 'admin';
  const currentUser = activeSession;
  const user = activeSession;

  const isAdminFn = useCallback(async (userId) => {
    if (!supabase) return false;
    return authService.isAdmin(userId);
  }, []);

  const openAuthModal = useCallback((type = 'login') => setAuthModalType(type), []);
  const closeAuthModal = useCallback(() => setAuthModalType(null), []);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
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
    profile,
    login,
    signup,
    childLogin: childLoginFn,
    logout,
    resetPassword,
    isLoggedIn,
    isParent,
    isChild,
    isAdmin,
    checkIsAdmin: isAdminFn,
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
    loading,
    childSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
