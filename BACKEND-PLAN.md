# NextGen School — Backend Migration Plan

## Stack
- **Supabase** (Auth + PostgreSQL + Edge Functions)
- **React** frontend connects via `@supabase/supabase-js`
- **GitHub Pages** still hosts the frontend (zero cost)

## Database Schema (PostgreSQL)

### Tables
```sql
-- profiles (extends Supabase auth.users)
profiles: id (uuid, FK auth.users), name, email, role (parent|admin), avatar_url, created_at, active

-- children
children: id (uuid), parent_id (FK profiles), name, age, pin (4-digit), avatar, created_at

-- courses (static but admin-editable)
courses: id (text: ai|space|robotics), title, description, color, emoji, chapter_count, created_at

-- chapters
chapters: id (uuid), course_id (FK courses), index, title, emoji, created_at

-- enrollments (family enrollment)
enrollments: id (uuid), user_id (FK profiles), created_at

-- purchases
purchases: id (uuid), user_id (FK profiles), plan (singleCourse|fullAccess|familyPlan), course_id, amount, currency, method (stripe|razorpay), status (success|failed|pending|refunded), coupon_id, stripe_session_id, created_at

-- progress
progress: id (uuid), child_id (FK children), course_id (FK courses), chapter_index (int), completed_at

-- course_access (admin-granted)
course_access: id (uuid), user_id (FK profiles), course_id, granted_by, reason, active, granted_at, revoked_at

-- coupons
coupons: id (uuid), code (unique), course_id (null = all courses), type (percentage|fixed), value (numeric), max_uses, current_uses, expires_at, active, created_by, created_at

-- admin_events
admin_events: id (uuid), type, data (jsonb), created_at
```

### RLS Policies
- Users can only read their own profile + children + purchases + progress
- Admin role can read/write all tables
- Public can read courses/chapters
- Coupon validation via edge function (prevents client-side manipulation)

## File Structure (new/modified)
```
src/
  utils/
    supabase.js          — Supabase client init
    db.js                — REWRITE: Supabase queries (same API surface)
  services/
    auth.service.js      — Supabase Auth (signup, login, child pin, magic link)
    courses.service.js   — Course CRUD, progress tracking
    admin.service.js     — Admin queries, analytics, bulk ops
    coupon.service.js    — Coupon CRUD, validation, generation
    payment.service.js   — Payment recording, Stripe/Razorpay integration
  context/
    AuthContext.jsx       — REWRITE: Supabase auth state
  pages/
    Admin.jsx             — REWRITE: Pro grid, pagination, 9 tabs
  components/
    DataGrid.jsx          — Reusable data grid (pagination, sort, search, bulk select)
    CouponManager.jsx     — Coupon generation/management UI
  admin/
    DashboardTab.jsx      — Dashboard with real DB queries
    EnrollmentsTab.jsx    — Enrollments with pagination
    PaymentsTab.jsx       — Payments with pagination
    AnalyticsTab.jsx      — Analytics with real data
    CoursesTab.jsx        — Course management
    UsersTab.jsx          — User CRUD with pagination
    StudentsTab.jsx       — Student progress
    CouponsTab.jsx        — NEW: Coupon management
    SettingsTab.jsx       — Settings
```

## Agent Assignment
1. **Schema Agent**: supabase.js, SQL schema, RLS, seed SQL, services/*.js
2. **Auth Agent**: AuthContext.jsx rewrite, auth.service.js, db.js rewrite
3. **Admin UI Agent**: DataGrid.jsx, admin/*.jsx (all 9 tabs), CouponManager.jsx
4. **Integration Agent**: Update Admin.jsx, App.jsx, build & deploy
