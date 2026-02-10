import React, { createContext, useState, useEffect, useCallback } from 'react';
import DB from '../lib/db';
import { LEVELS, ENCOURAGEMENTS } from '../lib/constants';

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState({
    name: '',
    points: 0,
    completed: [], // [{ courseId, chapters: [0, 1, 2] }, ...]
    parentEmail: '',
    notifications: [],
    purchases: [],
    activeDays: [], // [dates]
    timeSpent: 0, // minutes
    sessionStart: null,
    currentCourse: null,
    currentChapter: null,
  });

  // Load game state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ngs_game_state');
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading game state:', e);
      }
    }

    // Track session start
    setGameState((prev) => ({
      ...prev,
      sessionStart: new Date().toISOString(),
    }));
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ngs_game_state', JSON.stringify(gameState));
  }, [gameState]);

  // Add points
  const addPoints = useCallback((amount, reason = '') => {
    setGameState((prev) => ({
      ...prev,
      points: prev.points + amount,
    }));
    DB.logEvent('points_earned', { amount, reason });
  }, []);

  // Complete chapter
  const completeChapter = useCallback((courseId, chapterIdx) => {
    setGameState((prev) => {
      const completed = [...prev.completed];
      const courseProgress = completed.find((c) => c.courseId === courseId);

      if (courseProgress) {
        if (!courseProgress.chapters.includes(chapterIdx)) {
          courseProgress.chapters.push(chapterIdx);
        }
      } else {
        completed.push({
          courseId,
          chapters: [chapterIdx],
        });
      }

      return {
        ...prev,
        completed,
      };
    });

    // Track in DB
    DB.logEvent('chapter_completed', { courseId, chapterIdx });
  }, []);

  // Get current level
  const getLevel = useCallback(() => {
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
      if (gameState.points >= level.minXp) {
        currentLevel = level;
      }
    }
    return currentLevel;
  }, [gameState.points]);

  // Get streak (consecutive days of learning)
  const getStreak = useCallback(() => {
    if (gameState.activeDays.length === 0) return 0;

    const sorted = [...gameState.activeDays].sort().reverse();
    let streak = 1;
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length - 1; i++) {
      const thisDate = new Date(sorted[i]);
      const nextDate = new Date(sorted[i + 1]);

      thisDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const diff = (thisDate - nextDate) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [gameState.activeDays]);

  // Track active day
  const trackActiveDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setGameState((prev) => {
      if (!prev.activeDays.includes(today)) {
        return {
          ...prev,
          activeDays: [...prev.activeDays, today],
        };
      }
      return prev;
    });
    DB.logEvent('active_day', { date: today });
  }, []);

  // Add notification
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, message, type, timestamp: new Date() };

    setGameState((prev) => ({
      ...prev,
      notifications: [...prev.notifications, notification],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }

    return id;
  }, []);

  // Check if chapter is unlocked
  const isChapterUnlocked = useCallback(
    (courseId, chapterIdx) => {
      // Chapter 0 is always free
      if (chapterIdx === 0) return true;

      // Check if purchased
      const hasPurchase = gameState.purchases.some(
        (p) => p.courseId === courseId || p.type === 'bundle' || p.type === 'family'
      );

      return hasPurchase || localStorage.getItem('ngs_demo') === 'true';
    },
    [gameState.purchases]
  );

  // Save game state (explicit save)
  const save = useCallback(() => {
    localStorage.setItem('ngs_game_state', JSON.stringify(gameState));
    addNotification('Progress saved! 💾', 'success', 2000);
  }, [gameState, addNotification]);

  const value = {
    // State
    gameState,
    setGameState,

    // Methods
    addPoints,
    completeChapter,
    getLevel,
    getStreak,
    trackActiveDay,
    addNotification,
    isChapterUnlocked,
    save,

    // Helpers
    getRandomEncouragement: () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
    getLevelForPoints: (points) => {
      let level = LEVELS[0];
      for (const l of LEVELS) {
        if (points >= l.minXp) {
          level = l;
        }
      }
      return level;
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
