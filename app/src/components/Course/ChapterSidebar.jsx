import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { COURSES } from '../../lib/constants';

export default function ChapterSidebar({ course, currentChapter, onChapterSelect }) {
  const { gameState, getLevel, isChapterUnlocked } = useGame();
  const [mobileOpen, setMobileOpen] = useState(false);

  const level = getLevel();
  const progress = gameState.completed.find((c) => c.courseId === course.id);
  const completedChapters = progress?.chapters || [];

  const sidebarContent = (
    <>
      {/* Level Info */}
      <div className="px-4 py-4 border-b border-glass-border">
        <div className="text-center">
          <div className="text-4xl mb-2">{level.emoji}</div>
          <h3 className="font-bold text-sm">{level.name}</h3>
          <p className="text-xs text-text-secondary mt-1">{gameState.points} XP</p>
        </div>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {course.chapters.map((chapter) => {
          const isCompleted = completedChapters.includes(chapter.idx);
          const isActive = chapter.idx === currentChapter;
          const isLocked = !isChapterUnlocked(course.id, chapter.idx);

          return (
            <button
              key={chapter.idx}
              onClick={() => {
                if (!isLocked) {
                  onChapterSelect(chapter.idx);
                  setMobileOpen(false);
                }
              }}
              disabled={isLocked}
              className={`w-full px-3 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'hover:bg-bg3'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Chapter Number Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'bg-bg3 text-text'
                }`}
              >
                {chapter.idx + 1}
              </div>

              {/* Chapter Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{chapter.emoji}</span>
                  <span className="font-semibold text-sm truncate">{chapter.title}</span>
                </div>
              </div>

              {/* Completion or Lock Icon */}
              {isLocked ? (
                <span className="text-lg">🔒</span>
              ) : isCompleted ? (
                <span className="text-lg text-green-400">✓</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-56 bg-bg2 border-r border-glass-border">
        {sidebarContent}
      </div>

      {/* Mobile Header Toggle */}
      <div className="md:hidden absolute top-20 left-4 z-30">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-bg2 border border-glass-border rounded-lg hover:bg-bg3 transition-colors"
          aria-label="Toggle chapters"
        >
          <span className="text-xl">📚</span>
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-20 bg-black/50 backdrop-blur-sm z-20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed top-20 left-0 w-56 h-[calc(100vh-5rem)] bg-bg2 border-r border-glass-border z-20 flex flex-col">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
