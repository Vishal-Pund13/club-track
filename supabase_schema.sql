-- ═══════════════════════════════════════════════════════════════════
-- ClubTrack — Production Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── CLUBS ──────────────────────────────────────────────────────────
CREATE TABLE public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL
);

-- ─── PROFILES (extends Supabase auth.users) ─────────────────────────
-- Stores aspirant data synced from auth + manual fields
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  mobile TEXT UNIQUE,
  city TEXT,
  ssb_board TEXT,
  aspirant_type TEXT DEFAULT 'NDA',  -- NDA, CDS, TGC, SSC Tech, etc.
  role TEXT NOT NULL DEFAULT 'aspirant', -- 'aspirant' | 'admin'
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,             -- ISO date "YYYY-MM-DD"; used to compute streak
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CAPTAIN ASSIGNMENTS ────────────────────────────────────────────
-- Each club can have one captain (a profile).
CREATE TABLE public.captain_assignments (
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (club_id, profile_id)
);

-- ─── TASKS ──────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  pts INTEGER NOT NULL DEFAULT 10,
  date TEXT NOT NULL,               -- "YYYY-MM-DD"
  active BOOLEAN NOT NULL DEFAULT TRUE,
  requires_proof BOOLEAN NOT NULL DEFAULT TRUE, -- If true, aspirant must submit proof
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TASK VERIFICATIONS (Anti-Fraud Core) ───────────────────────────
-- Every task completion goes through this pipeline:
--   submitted (pending) → approved (points credited) or rejected
--
-- Status: 'pending' | 'approved' | 'rejected'
CREATE TABLE public.task_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proof_text TEXT,                   -- Description / activity link submitted by aspirant
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,                  -- Captain can leave a note (e.g. "Video link invalid")
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, user_id)          -- One submission per task per user
);

-- ─── PERSONAL TODOS (not scored) ────────────────────────────────────
CREATE TABLE public.personal_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.clubs (id, name, icon, description, color) VALUES
  ('strava',    'Strava Squad',       '🏃',  'Physical fitness and outdoor activities',  '#EF9F27'),
  ('newspaper', 'Newspaper Squad',    '📰',  'Current affairs and editorial skills',     '#BA7517'),
  ('heroes',    'Heroes of Army',     '🎖️', 'Military history and valor stories',       '#EF9F27'),
  ('psych',     'Psych Squad',        '🧠',  'Psychology and mental resilience',         '#BA7517'),
  ('comm',      'Communication Squad','💬',  'Public speaking and leadership',           '#EF9F27');

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.clubs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captain_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_verifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_todos       ENABLE ROW LEVEL SECURITY;

-- ── Clubs: everyone reads ────────────────────────────────────────────
CREATE POLICY "clubs_read_all"    ON public.clubs FOR SELECT USING (true);
CREATE POLICY "clubs_admin_write" ON public.clubs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Profiles: anyone can read; owner updates their own ───────────────
CREATE POLICY "profiles_read_all"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"  ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Captain assignments: anyone reads, admin writes ──────────────────
CREATE POLICY "captain_read_all"   ON public.captain_assignments FOR SELECT USING (true);
CREATE POLICY "captain_admin_write" ON public.captain_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Tasks: all read; admin + captains write ──────────────────────────
CREATE POLICY "tasks_read_all"     ON public.tasks FOR SELECT USING (true);
CREATE POLICY "tasks_admin_write"  ON public.tasks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM public.captain_assignments ca
      WHERE ca.club_id = tasks.club_id AND ca.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM public.captain_assignments ca
      WHERE ca.club_id = tasks.club_id AND ca.profile_id = auth.uid()
    )
  );

-- ── Task Verifications ───────────────────────────────────────────────
-- Aspirants insert their own; captains/admins can read all + update status
CREATE POLICY "verif_read_own"    ON public.task_verifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.captain_assignments ca
      JOIN public.tasks t ON t.id = task_verifications.task_id
      WHERE ca.club_id = t.club_id AND ca.profile_id = auth.uid()
    )
  );
CREATE POLICY "verif_insert_own"  ON public.task_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "verif_update_captain" ON public.task_verifications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.captain_assignments ca
      JOIN public.tasks t ON t.id = task_verifications.task_id
      WHERE ca.club_id = t.club_id AND ca.profile_id = auth.uid()
    )
  );

-- ── Personal todos: owner only ───────────────────────────────────────
CREATE POLICY "todos_own"  ON public.personal_todos FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════════════════

-- Reads approved verifications as a "completions" view
CREATE OR REPLACE VIEW public.completions AS
  SELECT
    user_id,
    task_id,
    submitted_at AS completed_at
  FROM public.task_verifications
  WHERE status = 'approved';

-- Function: auto-create profile after sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, initials, mobile, city, aspirant_type, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Aspirant'),
    COALESCE(NEW.raw_user_meta_data->>'initials', 'XX'),
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'city',
    COALESCE(NEW.raw_user_meta_data->>'aspirant_type', 'NDA'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'aspirant')
  );
  RETURN NEW;
END;
$$;

-- Trigger: fires on every new auth.users row
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════
-- NOTES FOR PRODUCTION
-- ════════════════════════════════════════════════════════════════════
-- 1. In Supabase Dashboard > Auth > Settings, disable "Confirm email"
--    OR set up a custom SMTP if you want email verification.
-- 2. The first admin must be manually set:
--    UPDATE public.profiles SET role = 'admin' WHERE mobile = 'YOUR_MOBILE';
-- 3. Assign captains:
--    INSERT INTO public.captain_assignments (club_id, profile_id)
--    VALUES ('strava', 'UUID_OF_CAPTAIN');
-- 4. For analytics, a Supabase Edge Fn (or dashboard) can query:
--    - task_verifications grouped by club_id / date / aspirant_type
--    - profiles grouped by city / aspirant_type
-- ════════════════════════════════════════════════════════════════════
