import React, { createContext, useState, useEffect, useCallback } from 'react';
import DB from '../lib/db';

export const AuthContext = createContext();

// Session object for managing authentication
class Session {
  constructor() {
    this.load();
  }

  load() {
    try {
      const data = sessionStorage.getItem('ngs_session');
      const session = data ? JSON.parse(data) : null;
      this.user = session?.user || null;
      this.userId = session?.userId || null;
      this.userType = session?.userType || null; // 'parent' or 'child'
      this.parentId = session?.parentId || null;
    } catch (e) {
      this.clear();
    }
  }

  save() {
    sessionStorage.setItem(
      'ngs_session',
      JSON.stringify({
        user: this.user,
        userId: this.userId,
        userType: this.userType,
        parentId: this.parentId,
      })
    );
  }

  clear() {
    sessionStorage.removeItem('ngs_session');
    this.user = null;
    this.userId = null;
    this.userType = null;
    this.parentId = null;
  }

  setUser(user, userType = 'parent') {
    this.user = user;
    this.userId = user.id;
    this.userType = userType;
    if (userType === 'child') {
      this.parentId = user.parentId;
    }
    this.save();
  }

  isLoggedIn() {
    return !!this.userId;
  }
}

export function AuthProvider({ children }) {
  const [session] = useState(() => new Session());
  const [authState, setAuthState] = useState({
    isLoggedIn: session.isLoggedIn(),
    user: session.user,
    userId: session.userId,
    userType: session.userType,
    parentId: session.parentId,
    isLoading: false,
    error: null,
  });

  // Sync state with session on mount
  useEffect(() => {
    setAuthState({
      isLoggedIn: session.isLoggedIn(),
      user: session.user,
      userId: session.userId,
      userType: session.userType,
      parentId: session.parentId,
      isLoading: false,
      error: null,
    });
  }, []);

  // Parent signup
  const signup = useCallback(
    (email, password, name) => {
      return new Promise((resolve, reject) => {
        // Check if email exists
        if (DB.getUserByEmail(email)) {
          const error = 'Email already registered';
          setAuthState((prev) => ({ ...prev, error }));
          reject(new Error(error));
          return;
        }

        // Create user (in real app, this would hash password)
        const user = {
          id: `parent_${Date.now()}`,
          email,
          password, // NOTE: Never store plaintext passwords in real app!
          name,
          createdAt: new Date().toISOString(),
        };

        try {
          DB.addUser(user);
          session.setUser(user, 'parent');
          setAuthState({
            isLoggedIn: true,
            user,
            userId: user.id,
            userType: 'parent',
            parentId: null,
            isLoading: false,
            error: null,
          });
          DB.logEvent('parent_signup', { email });
          resolve(user);
        } catch (e) {
          const error = 'Failed to create account';
          setAuthState((prev) => ({ ...prev, error }));
          reject(new Error(error));
        }
      });
    },
    []
  );

  // Parent login
  const login = useCallback(
    (email, password) => {
      return new Promise((resolve, reject) => {
        const user = DB.getUserByEmail(email);

        if (!user || user.password !== password) {
          const error = 'Invalid email or password';
          setAuthState((prev) => ({ ...prev, error }));
          reject(new Error(error));
          return;
        }

        session.setUser(user, 'parent');
        setAuthState({
          isLoggedIn: true,
          user,
          userId: user.id,
          userType: 'parent',
          parentId: null,
          isLoading: false,
          error: null,
        });
        DB.logEvent('parent_login', { email });
        resolve(user);
      });
    },
    []
  );

  // Child login by PIN
  const loginChild = useCallback(
    (pin) => {
      return new Promise((resolve, reject) => {
        const child = DB.getChildByPin(pin);

        if (!child) {
          const error = 'Invalid PIN';
          setAuthState((prev) => ({ ...prev, error }));
          reject(new Error(error));
          return;
        }

        session.setUser(child, 'child');
        setAuthState({
          isLoggedIn: true,
          user: child,
          userId: child.id,
          userType: 'child',
          parentId: child.parentId,
          isLoading: false,
          error: null,
        });
        DB.logEvent('child_login', { childId: child.id });
        resolve(child);
      });
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    session.clear();
    setAuthState({
      isLoggedIn: false,
      user: null,
      userId: null,
      userType: null,
      parentId: null,
      isLoading: false,
      error: null,
    });
    DB.logEvent('logout', {});
  }, []);

  // Check if logged in
  const isLoggedIn = useCallback(() => {
    return authState.isLoggedIn;
  }, [authState.isLoggedIn]);

  // Check if parent
  const isParent = useCallback(() => {
    return authState.userType === 'parent';
  }, [authState.userType]);

  // Check if child
  const isChild = useCallback(() => {
    return authState.userType === 'child';
  }, [authState.userType]);

  // Update auth UI (e.g., after purchase)
  const updateAuthUI = useCallback(() => {
    // Reload user data from DB if needed
    if (authState.userId && authState.userType === 'parent') {
      const user = DB.getUserByEmail(authState.user?.email);
      if (user) {
        session.setUser(user, 'parent');
        setAuthState((prev) => ({ ...prev, user }));
      }
    }
  }, [authState.userId, authState.userType, authState.user?.email]);

  const value = {
    // State
    authState,
    setAuthState,

    // Methods
    signup,
    login,
    loginChild,
    logout,
    isLoggedIn,
    isParent,
    isChild,
    updateAuthUI,

    // Current user info
    userId: authState.userId,
    user: authState.user,
    userType: authState.userType,
    parentId: authState.parentId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
