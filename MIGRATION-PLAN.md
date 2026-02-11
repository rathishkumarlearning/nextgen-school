# NextGen School — React Migration Plan

## Architecture
```
app/src/
├── main.jsx                    # Entry point
├── App.jsx                     # Router + layout
├── index.css                   # Global styles (ALL CSS from original)
├── context/
│   ├── AppContext.jsx          # Global state (STATE object equivalent)
│   └── AuthContext.jsx         # Session + auth state
├── utils/
│   ├── db.js                   # DB object (localStorage layer)
│   ├── session.js              # Session management
│   ├── constants.js            # COURSES data, PAYMENT_CONFIG, EMAIL_CONFIG
│   ├── gamification.js         # Points, levels, streaks, badges
│   ├── notifications.js        # Notification system
│   └── certificates.js         # jsPDF certificate generation
├── components/
│   ├── Starfield.jsx           # Canvas starfield background
│   ├── Navbar.jsx              # Top nav bar
│   ├── Footer.jsx              # Footer
│   ├── GlassCard.jsx           # Reusable glass card
│   └── ProgressBar.jsx         # Reusable progress bar
├── pages/
│   ├── Landing.jsx             # Hero + metrics + principles + courses + pricing
│   ├── CourseView.jsx          # Sidebar + lesson area + chapter content
│   ├── BadgeGallery.jsx        # All badges display
│   ├── ParentDashboard.jsx     # Parent stats + per-course progress + streak
│   ├── Onboarding.jsx          # Wizard flow
│   └── Admin.jsx               # Full admin panel (6 tabs)
├── modals/
│   ├── AuthModal.jsx           # Login/signup/child-login tabs
│   ├── EngagementSummary.jsx   # Engagement popup
│   └── PaymentModal.jsx        # Payment flow
└── chapters/
    ├── ai/                     # 8 AI chapters (interactive content)
    ├── space/                  # 8 Space chapters
    └── robotics/               # 8 Robotics chapters
```

## Agent Assignments

### Agent 1: Foundation (styles + utils + context)
- Extract ALL CSS → index.css (preserve every rule exactly)
- Create db.js, session.js, constants.js (COURSES data)
- Create AppContext.jsx + AuthContext.jsx
- Create Starfield.jsx component
- Set up App.jsx with hash routing

### Agent 2: Landing + Navigation + Modals
- Landing.jsx (hero, metrics, principles, courses grid, pricing)
- Navbar.jsx, Footer.jsx
- AuthModal.jsx (parent signup/login, child PIN login)
- Onboarding.jsx (wizard flow)
- PaymentModal.jsx

### Agent 3: Course View + Chapters (THE BIG ONE)
- CourseView.jsx (sidebar, lesson area, progress)
- All 24 chapter content components (8 per course)
- Drag-and-drop interactions, quizzes, mazes, puzzles
- Chapter locking logic

### Agent 4: Admin + Parent Dashboard + Features
- Admin.jsx (full 6-tab admin panel with charts)
- ParentDashboard.jsx (stats, streak calendar, conversation prompts)
- BadgeGallery.jsx
- Certificates, notifications, engagement summary
- Gamification (points, levels, streaks)

## Critical Rules
1. PIXEL-PERFECT match to original HTML version
2. Same fonts (Fredoka + Nunito), same colors, same animations
3. Same external libs: GSAP, Chart.js, jsPDF, Stripe, EmailJS
4. Hash-based routing (#home, #courses, #admin, etc.)
5. localStorage keys MUST match original (ngs_db_*, ngs_session)
6. Demo mode, seed data, all interactive elements preserved
7. GitHub Pages compatible (base path: /nextgen-school/)
8. Vite + React 19 + Tailwind CSS v4 (but CSS is mostly custom, keep it)
