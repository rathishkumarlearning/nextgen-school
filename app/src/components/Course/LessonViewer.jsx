import React, { useState, Suspense, lazy } from 'react';
import { useGame } from '../../context/GameContext';

// Lazy-load all lesson components for code splitting
const lessonMap = {
  ai: [
    lazy(() => import('./lessons/ai/Ch1WhatIsAI')),
    lazy(() => import('./lessons/ai/Ch2HowAILearns')),
    lazy(() => import('./lessons/ai/Ch3SmartVsWise')),
    lazy(() => import('./lessons/ai/Ch4AIInYourWorld')),
    lazy(() => import('./lessons/ai/Ch5AskingBetterQuestions')),
    lazy(() => import('./lessons/ai/Ch6WhenAIGetsItWrong')),
    lazy(() => import('./lessons/ai/Ch7AIEthics')),
    lazy(() => import('./lessons/ai/Ch8BeTheAIBoss')),
  ],
  space: [
    lazy(() => import('./lessons/space/Ch1SolarSystem')),
    lazy(() => import('./lessons/space/Ch2LifeOfAStar')),
    lazy(() => import('./lessons/space/Ch3RocketsLaunch')),
    lazy(() => import('./lessons/space/Ch4MissionToMars')),
    lazy(() => import('./lessons/space/Ch5GravityOrbits')),
    lazy(() => import('./lessons/space/Ch6SpaceAI')),
    lazy(() => import('./lessons/space/Ch7AstronautTraining')),
    lazy(() => import('./lessons/space/Ch8DesignMission')),
  ],
  robotics: [
    lazy(() => import('./lessons/robotics/Ch1WhatIsARobot')),
    lazy(() => import('./lessons/robotics/Ch2RobotSenses')),
    lazy(() => import('./lessons/robotics/Ch3RobotBrain')),
    lazy(() => import('./lessons/robotics/Ch4RobotMovement')),
    lazy(() => import('./lessons/robotics/Ch5TypesOfRobots')),
    lazy(() => import('./lessons/robotics/Ch6RobotsAndAI')),
    lazy(() => import('./lessons/robotics/Ch7RobotEthics')),
    lazy(() => import('./lessons/robotics/Ch8DesignYourRobot')),
  ],
};

function LessonLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🚀</div>
        <p className="text-text2 text-lg">Loading lesson...</p>
      </div>
    </div>
  );
}

export default function LessonViewer({ course }) {
  const { gameState } = useGame();
  const [showCompletion, setShowCompletion] = useState(false);

  const currentChapter = gameState.currentChapter;
  const courseId = gameState.currentCourse;
  const lessons = lessonMap[courseId];
  const LessonComponent = lessons?.[currentChapter];

  const chapter = course?.chapters?.[currentChapter];

  const handleChapterComplete = () => {
    setShowCompletion(true);
    setTimeout(() => {
      setShowCompletion(false);
    }, 3000);
  };

  if (!LessonComponent || !chapter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>Coming Soon</h2>
          <p className="text-text2">This chapter is being prepared!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-10" style={{ maxWidth: 900 }}>
      {/* Chapter Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {chapter.emoji} {chapter.title}
        </h2>
        <div className="h-1 w-16 bg-gradient-to-r from-cyan to-purple rounded-full" />
      </div>

      {/* Lesson Content (lazy loaded) */}
      <Suspense fallback={<LessonLoadingFallback />}>
        <LessonComponent onComplete={handleChapterComplete} />
      </Suspense>

      {/* Completion Overlay */}
      {showCompletion && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="p-10 text-center max-w-md rounded-3xl" style={{ background: 'rgba(10,10,46,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>Chapter Complete!</h3>
            <p className="text-text2 mb-6">Amazing work! You earned +25 XP!</p>
            <button
              onClick={() => setShowCompletion(false)}
              className="px-8 py-3 text-white font-bold rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', fontFamily: "'Fredoka', sans-serif" }}
            >
              Continue Learning →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
