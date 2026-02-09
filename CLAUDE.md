# NextGen School — Project Rules & Context

## 🎯 What Is This?
NextGen School is a **kids AI literacy platform** (ages 9-13) — a real startup being productionized for launch.
- **Website:** https://rathishkumarlearning.github.io/nextgen-school/
- **Domain (coming):** nextgenschool.aiupskills.com
- **GitHub:** https://github.com/rathishkumarlearning/nextgen-school
- **Notion:** https://www.notion.so/NextGen-School-Mind-Over-Machines-301703945f6a811189c0cb6492a6d27b

## 👥 Founders
- **Sathish** 🇮🇳 — Co-founder & Education Lead (India). Father of a 7th grader interested in Space + Python.
- **Rathish** 🇺🇸 — Lead Software Engineer, Identity/IAM (USA). Father of 3 kids.

## 🧠 Core Philosophy — "Mind Over Machines"
- **Humans > Machines** — Children stay in the driver's seat
- **Systems Thinking > Coding Syntax** — Understanding "Why" before "How"  
- **Awareness Before Complexity** — Age-appropriate AI literacy
- **Zero Code Snippets** — ALL activities are visual, drag-and-drop, building blocks
- **No Exams, No Grades** — Curiosity over competition
- **Gamification** — Levels, badges, XP for effort/consistency, NOT leaderboards

## 📚 Current Courses (24 chapters total, all interactive)
### 🤖 AI Adventures (8 chapters)
1. What is AI? — Drag items to "Uses AI" / "No AI" buckets
2. How AI Learns — Pattern matching, training data concepts
3. Smart vs Wise — Decision quality activities
4. AI in Your World — Spot AI in daily life
5. Asking Better Questions — Prompt crafting for kids
6. When AI Gets It Wrong — Bias and errors
7. AI Ethics & Fairness — Right vs wrong scenarios
8. Be the AI Boss — Control and responsibility

### 🚀 Space Explorers (8 chapters)
1. Our Solar System — Planet sorting, drag-and-drop
2. The Moon — Phases, Chandrayaan-3
3. Stars & Constellations — Pattern recognition
4. Rockets & Launches — ISRO missions
5. Life in Space — ISS activities
6. Mars Mission — Planning exercise
7. Space Technology — Satellites, GPS
8. Future Explorer — Design your mission

### 🔧 Robotics Lab (8 chapters)  
1. What is a Robot? — Sorting robots vs machines
2. Sensors — Input/output matching
3. Programming Basics — Visual sequence building
4. Build a Bot — Drag components together
5. Robot Navigation — Maze solving
6. Smart Robots — AI + robotics
7. Robots in Real Life — Industry matching
8. Design Challenge — Build your robot

## 🏗️ Current Tech Stack
- **Single HTML file** (~2500+ lines)
- **No build tools** — vanilla HTML/CSS/JS
- **Hosting:** GitHub Pages (free)
- **Fonts:** Fredoka (headings), Nunito (body), JetBrains Mono (code)
- **Design:** Dark navy #0a0a2e, glassmorphism cards, gradients
- **Storage:** localStorage for progress/state
- **No backend** — all client-side

## 🎯 CURRENT GOAL — PRODUCTIONIZE FOR LAUNCH
We're building a full end-to-end platform so parents can pay and kids can learn. This is a **real side business** — needs to generate revenue.

### What Needs to Be Built:

#### 1. Authentication System
- Parent signup (email + password)
- Parent login with session management
- Child login (simple PIN set by parent)
- Password reset flow
- Profile management (parent + children)

#### 2. Payment Integration
- **Stripe Checkout** (USA/international) — test mode first, real keys later
- **Razorpay** (India) — test mode first
- Pricing: Free Trial (Ch1), Single Course $19, Bundle (3 courses) $39, Family Plan $59
- Payment failure handling & retry
- Receipt/invoice generation
- **Demo Mode** toggle — bypass payment for testing

#### 3. Course Access Control
- Chapter 1: Always FREE (no payment)
- Chapters 2-8: Locked behind payment
- Visual lock icons on unpurchased content
- Unlock all chapters after payment
- Per-child progress tracking

#### 4. Admin Panel
- Secret access (click logo 5x or #admin URL)
- Enrollment management (families, children, CRUD)
- Payment tracking (all transactions, failed alerts, refunds)
- Course analytics (completion rates, popular chapters, drop-off)
- Engagement metrics (streaks, badges, session times)
- Student progress (per-child detailed view)
- Revenue dashboard with charts
- Announcements system
- Settings (pricing, payment keys, email config)
- CSV export

#### 5. Engagement Features
- Streak tracking (consecutive days)
- Badge system (effort, curiosity, completion)
- XP points per activity
- Certificate generation (jsPDF) on course completion
- Browser push notifications (optional)
- Parent weekly progress emails (EmailJS, placeholder keys)

### Future Phase (After Launch):
- Move from localStorage to Supabase/Firebase
- Real authentication (Supabase Auth or Firebase Auth)
- Live Virtual Classes integration (Zoom/Meet API)
- Instructor dashboard
- Cohort management
- Mobile app (React Native)

## 🎨 Design System — MUST FOLLOW
- **Background:** #0a0a2e (deep navy)
- **Cards:** Glassmorphism — backdrop-blur, border rgba(255,255,255,0.1), rounded-2xl
- **Colors:** Gold #fbbf24, Purple #8b5cf6, Cyan #06b6d4, Pink #ec4899, Green #10b981
- **Fonts:** Fredoka (headings), Nunito (body), JetBrains Mono (code)
- **Effects:** Grid pattern bg, gradient orbs, hover lift + glow
- **Mobile:** Touch targets 44px+, responsive breakpoints

## ⚠️ CRITICAL RULES
1. **ZERO CODE SNIPPETS** in kids content — all visual, drag-and-drop, building blocks
2. **Keep existing courses intact** — don't break the 24 chapters of interactive content
3. **Dark theme ONLY** — no light mode
4. **Single HTML file** architecture (for now)
5. **No surprise costs** — use free tiers, test modes, placeholder keys
6. **Performance** — must load fast on mobile (many users in India)
7. **Accessibility** — proper ARIA labels, keyboard navigation
8. **Data schema** — structure localStorage like a real DB for easy migration later

## 📂 File Structure
```
/nextgen-school/
├── index.html          # Main app (everything)
├── CLAUDE.md           # This file — project rules
├── README.md           # Public readme
└── (future: assets/, src/, etc. when we add build tools)
```

## 🔗 Related Projects (Same GitHub Org)
- Course Hub: /course-hub/ — central directory of all 25+ courses
- NextGen Hub: /nextgen-hub/ — startup showcase page (Sathish first, Rathish second)
- Gemini for Teachers: /gemini-teachers/ — teacher AI training
- Gemini for TN Teachers: /gemini-tn-teachers/ — Tamil Nadu specific
- Moon Explorer: /moon-explorer/ — 3D interactive moon
- Robotics Kit: /robotics-kit/ — kit shop + assembly guides
- Python Adventures: /python-adventures/ — story-based Python for kids
- 20+ more learning courses

## 💰 Revenue Model
- **Freemium:** Chapter 1 free, rest paid
- **Pricing:** $19 single / $39 bundle / $59 family
- **Target:** Parents in USA + India
- **Payment:** Stripe (USA) + Razorpay (India)
- **Goal:** Side income → scale to full business

## 🚀 Deployment
- **Current:** GitHub Pages (free, static)
- **Future:** Vercel or Netlify (for serverless functions if needed)
- **Domain:** nextgenschool.aiupskills.com (to be configured)
- **Push to deploy:** `git push origin main` → auto-deploys

## 📝 How to Contribute
1. Read this file first
2. Don't break existing course content
3. Follow the design system
4. Test on mobile
5. Use localStorage with structured JSON
6. Commit with clear messages
7. Keep it a single HTML file (for now)
