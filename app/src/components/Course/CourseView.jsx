import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { COURSES } from '../../lib/constants';
import ChapterSidebar from './ChapterSidebar';
import LessonViewer from './LessonViewer';
import DragDropProvider from '../../hooks/useDragDrop';

export default function CourseView() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { gameState, setGameState, getLevel } = useGame();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const course = COURSES[courseId];

  useEffect(() => {
    if (!course) {
      navigate('/dashboard');
      return;
    }

    // Set current course
    setGameState((prev) => ({
      ...prev,
      currentCourse: courseId,
      currentChapter: gameState.currentChapter ?? 0,
    }));
  }, [courseId, course, navigate, setGameState, gameState.currentChapter]);

  if (!course) {
    return null;
  }

  const level = getLevel();
  const progress = gameState.completed.find((c) => c.courseId === courseId);
  const completedCount = progress?.chapters.length || 0;
  const progressPercent = (completedCount / course.chapters.length) * 100;

  const handleChapterSelect = (chapterIdx) => {
    setGameState((prev) => ({
      ...prev,
      currentChapter: chapterIdx,
    }));
  };

  return (
    <DragDropProvider>
      <div className="h-screen w-full flex flex-col bg-bg1 text-text">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-bg2/95 to-bg3/95 backdrop-blur-sm border-b border-glass-border px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-bg3 rounded-lg transition-colors"
              aria-label="Back to dashboard"
            >
              <span className="text-2xl">←</span>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {course.emoji} {course.title}
              </h1>
              <p className="text-xs md:text-sm text-text-secondary">
                {level.emoji} {level.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Progress Bar */}
            <div className="hidden sm:flex flex-col gap-1">
              <div className="text-xs text-text-secondary">{completedCount} / {course.chapters.length}</div>
              <div className="w-32 h-2 bg-bg3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* XP Display */}
            <div className="bg-bg3 px-3 py-2 rounded-lg text-center">
              <div className="text-xs text-text-secondary">XP</div>
              <div className="text-lg font-bold text-cyan-400">{gameState.points}</div>
            </div>

            {/* Notifications Bell */}
            <button className="relative p-2 hover:bg-bg3 rounded-lg transition-colors">
              <span className="text-2xl">🔔</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <ChapterSidebar
            course={course}
            currentChapter={gameState.currentChapter}
            onChapterSelect={handleChapterSelect}
          />

          {/* Lesson Viewer */}
          <LessonViewer course={course} />
        </div>
      </div>
    </DragDropProvider>
  );
}
