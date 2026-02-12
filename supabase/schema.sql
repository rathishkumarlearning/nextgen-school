-- NextGen School - Supabase Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- HELPER FUNCTION: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  email text,
  role text DEFAULT 'parent',
  avatar_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Children
CREATE TABLE IF NOT EXISTS public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age int,
  pin text,
  avatar text,
  created_at timestamptz DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  color text,
  emoji text,
  chapter_count int DEFAULT 8,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Chapters
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text REFERENCES public.courses ON DELETE CASCADE NOT NULL,
  idx int NOT NULL,
  title text NOT NULL,
  emoji text
);

-- Coupons (before purchases, since purchases FK coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  course_id text REFERENCES public.courses ON DELETE SET NULL,
  type text CHECK (type IN ('percentage', 'fixed')) NOT NULL,
  value numeric NOT NULL,
  max_uses int DEFAULT 1,
  current_uses int DEFAULT 0,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Purchases
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  plan text,
  course_id text,
  amount numeric,
  currency text DEFAULT 'USD',
  method text,
  status text DEFAULT 'pending',
  coupon_id uuid REFERENCES public.coupons ON DELETE SET NULL,
  coupon_discount numeric DEFAULT 0,
  stripe_session_id text,
  razorpay_payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Progress
CREATE TABLE IF NOT EXISTS public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES public.children ON DELETE CASCADE NOT NULL,
  course_id text REFERENCES public.courses ON DELETE CASCADE NOT NULL,
  chapter_index int NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE (child_id, course_id, chapter_index)
);

-- Course Access (admin-granted)
CREATE TABLE IF NOT EXISTS public.course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  course_id text NOT NULL,
  granted_by uuid REFERENCES public.profiles ON DELETE SET NULL,
  reason text,
  active boolean DEFAULT true,
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- Admin Events
CREATE TABLE IF NOT EXISTS public.admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_children_parent ON public.children (parent_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases (status);
CREATE INDEX IF NOT EXISTS idx_progress_child ON public.progress (child_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON public.progress (course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_user ON public.course_access (user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);
CREATE INDEX IF NOT EXISTS idx_chapters_course ON public.chapters (course_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (is_admin());

-- CHILDREN
CREATE POLICY "Users read own children" ON public.children FOR SELECT USING (parent_id = auth.uid() OR is_admin());
CREATE POLICY "Users manage own children" ON public.children FOR INSERT WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Users update own children" ON public.children FOR UPDATE USING (parent_id = auth.uid());
CREATE POLICY "Users delete own children" ON public.children FOR DELETE USING (parent_id = auth.uid());
CREATE POLICY "Admin full access children" ON public.children FOR ALL USING (is_admin());

-- COURSES (public read)
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admin write courses" ON public.courses FOR ALL USING (is_admin());

-- CHAPTERS (public read)
CREATE POLICY "Public read chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Admin write chapters" ON public.chapters FOR ALL USING (is_admin());

-- PURCHASES
CREATE POLICY "Users read own purchases" ON public.purchases FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users insert own purchases" ON public.purchases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access purchases" ON public.purchases FOR ALL USING (is_admin());

-- PROGRESS
CREATE POLICY "Users read own children progress" ON public.progress FOR SELECT
  USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()) OR is_admin());
CREATE POLICY "Users insert own children progress" ON public.progress FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));
CREATE POLICY "Admin full access progress" ON public.progress FOR ALL USING (is_admin());

-- COUPONS (admin only CRUD)
CREATE POLICY "Admin full access coupons" ON public.coupons FOR ALL USING (is_admin());

-- COURSE ACCESS (admin only)
CREATE POLICY "Admin full access course_access" ON public.course_access FOR ALL USING (is_admin());
CREATE POLICY "Users read own access" ON public.course_access FOR SELECT USING (user_id = auth.uid());

-- ADMIN EVENTS (admin only)
CREATE POLICY "Admin full access admin_events" ON public.admin_events FOR ALL USING (is_admin());

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'parent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Courses
INSERT INTO public.courses (id, title, description, color, emoji, chapter_count) VALUES
  ('ai', '🤖 AI Adventures', 'Learn how artificial intelligence works and how to use it wisely', 'var(--cyan)', '🤖', 8),
  ('space', '🚀 Space Explorers', 'Explore the universe from our solar system to distant galaxies', 'var(--purple)', '🚀', 8),
  ('robotics', '🔧 Robotics Lab', 'Build, program, and understand robots from scratch', 'var(--green)', '🔧', 8)
ON CONFLICT (id) DO NOTHING;

-- Chapters: AI Adventures
INSERT INTO public.chapters (course_id, idx, title, emoji) VALUES
  ('ai', 0, 'What is AI?', '🤔'),
  ('ai', 1, 'How AI Learns', '📚'),
  ('ai', 2, 'Smart vs Wise', '🧠'),
  ('ai', 3, 'AI in Your World', '🌍'),
  ('ai', 4, 'Asking Better Questions', '❓'),
  ('ai', 5, 'When AI Gets It Wrong', '❌'),
  ('ai', 6, 'AI Ethics & Fairness', '⚖️'),
  ('ai', 7, 'Be the AI Boss', '👑')
ON CONFLICT DO NOTHING;

-- Chapters: Space Explorers
INSERT INTO public.chapters (course_id, idx, title, emoji) VALUES
  ('space', 0, 'Our Solar System', '🪐'),
  ('space', 1, 'Life of a Star', '⭐'),
  ('space', 2, 'Rockets & Launch Science', '🚀'),
  ('space', 3, 'Mission to Mars', '🔴'),
  ('space', 4, 'Gravity & Orbits', '🌀'),
  ('space', 5, 'Space AI', '🛸'),
  ('space', 6, 'Astronaut Training', '👨‍🚀'),
  ('space', 7, 'Design Your Space Mission', '📋')
ON CONFLICT DO NOTHING;

-- Chapters: Robotics Lab
INSERT INTO public.chapters (course_id, idx, title, emoji) VALUES
  ('robotics', 0, 'What is a Robot?', '🤖'),
  ('robotics', 1, 'Robot Senses', '👁️'),
  ('robotics', 2, 'Robot Brain', '🧠'),
  ('robotics', 3, 'Robot Movement', '🕹️'),
  ('robotics', 4, 'Types of Robots', '🦾'),
  ('robotics', 5, 'Robots & AI Together', '🤝'),
  ('robotics', 6, 'Robot Ethics', '⚖️'),
  ('robotics', 7, 'Design Your Robot', '🏗️')
ON CONFLICT DO NOTHING;
