import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import DB from '../utils/db.js';
import Session from '../utils/session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => Session.get());
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try { return DB.getSettings?.()?.demoMode || false; } catch(e) { return false; }
  });
  const [authModalType, setAuthModalType] = useState(null);

  const login = useCallback((email, password) => {
    const user = DB.getUserByEmail(email);
    if (!user || user.password !== password) {
      return { error: 'Invalid email or password' };
    }
    const data = { id: user.id, name: user.name, email: user.email, role: 'parent' };
    Session.set(data);
    setSession(data);
    DB.logEvent('login', { userId: user.id });
    return { success: true, user: data };
  }, []);

  const signup = useCallback((name, email, password, childName, childAge, childPin) => {
    if (!name || !email || !password) return { error: 'Please fill in name, email, and password' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };
    if (DB.getUserByEmail(email)) return { error: 'Email already registered. Try logging in.' };

    const parent = DB.addUser({ name, email, password, role: 'parent' });
    if (childName && childPin && childPin.length === 4) {
      DB.addChild({ name: childName, age: childAge || 10, pin: childPin, parentId: parent.id });
    }
    const data = { id: parent.id, name: parent.name, email: parent.email, role: 'parent' };
    Session.set(data);
    setSession(data);
    DB.logEvent('signup', { userId: parent.id, email });
    return { success: true, user: data, childName };
  }, []);

  const childLogin = useCallback((pin) => {
    const child = DB.getChildByPin(pin);
    if (!child) return { error: 'Invalid PIN. Try again.' };
    const data = { id: child.id, name: child.name, role: 'child', parentId: child.parentId };
    Session.set(data);
    setSession(data);
    DB.logEvent('child_login', { childId: child.id });
    return { success: true, user: data };
  }, []);

  const logout = useCallback(() => {
    Session.clear();
    setSession(null);
  }, []);

  const isLoggedIn = !!session;
  const isParent = session?.role === 'parent';
  const isChild = session?.role === 'child';
  const currentUser = session;
  const user = session;

  const openAuthModal = useCallback((type = 'login') => {
    setAuthModalType(type);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalType(null);
  }, []);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    try { const s = DB.getSettings?.() || {}; s.demoMode = true; DB.saveSettings?.(s); } catch(e) {}
  }, []);

  const doSignup = useCallback(async ({ name, email, password, childName, childAge, childPin }) => {
    const result = signup(name, email, password, childName, childAge, childPin);
    if (result.error) throw new Error(result.error);
    return result;
  }, [signup]);

  const doLogin = useCallback(async (email, password) => {
    const result = login(email, password);
    if (result.error) throw new Error(result.error);
    return result;
  }, [login]);

  const doChildLogin = useCallback(async (pin) => {
    const result = childLogin(pin);
    if (result.error) throw new Error(result.error);
    return result;
  }, [childLogin]);

  const value = {
    session,
    login,
    signup,
    childLogin,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
