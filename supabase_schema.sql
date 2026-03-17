-- ═══════════════════════════════════════════════════════════════════
-- ClubTrack — FULL FACTORY RESET & PRODUCTION SCHEMA
-- Run this in Supabase SQL Editor to perform a 100% clean reset.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 0. WIPE ALL EXISTING DATA ─────────────────────────────────────
-- This removes all old tables, ghosts, and broken data schemas.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;
DROP VIEW IF EXISTS public.completions CASCADE;

DROP TABLE IF EXISTS public.task_verifications CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.captain_assignments CASCADE;
DROP TABLE IF EXISTS public.personal_todos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;

-- Delete all existing test accounts/users to start perfectly fresh
DELETE FROM auth.users;

-- ─── Enable UUID extension ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. CLUBS ──────────────────────────────────────────────────────────
CREATE TABLE public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL
);

-- ─── 2. PROFILES (extends Supabase auth.users) ─────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  mobile TEXT UNIQUE,
  city TEXT,
  ssb_board TEXT,
  aspirant_type TEXT DEFAULT 'NDA',  
  role TEXT NOT NULL DEFAULT 'aspirant', 
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,             
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. CAPTAIN ASSIGNMENTS ────────────────────────────────────────────
CREATE TABLE public.captain_assignments (
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (club_id, profile_id)
);

-- ─── 4. TASKS ──────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  pts INTEGER NOT NULL DEFAULT 10,
  date TEXT NOT NULL,               
  active BOOLEAN NOT NULL DEFAULT TRUE,
  requires_proof BOOLEAN NOT NULL DEFAULT TRUE, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. TASK VERIFICATIONS ───────────────────────────
CREATE TABLE public.task_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proof_text TEXT,                   
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,                  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, user_id)          
);

-- ─── 6. PERSONAL TODOS ────────────────────────────────────
CREATE TABLE public.personal_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════
-- REAL-TIME SUBSCRIPTIONS (For instant syncing)
-- ════════════════════════════════════════════════════════════════════
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.tasks, public.task_verifications, public.profiles, public.clubs;

-- ════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.clubs (id, name, icon, description, color) VALUES
  ('strava', 'Strava Squad', '🏃', 'Physical fitness and outdoor activities', '#EF9F27'),
  ('newspaper', 'Newspaper Squad', '📰', 'Current affairs and editorial skills', '#BA7517'),
  ('heroes', 'Heroes of Army', '🎖️', 'Military history and valor stories', '#EF9F27'),
  ('psych', 'Psych Squad', '🧠', 'Psychology and mental resilience', '#BA7517'),
  ('comm', 'Communication Squad', 'CS', 'Public speaking and leadership', '#EF9F27')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (Permissive Mode for Scaling)
-- ════════════════════════════════════════════════════════════════════
-- Everything is completely open to authenticated and anon users to 
-- ensure you face zero syncing blockers while scaling up. You can restrict 
-- these deeply once the core is functioning identically on all laptops/phones.

ALTER TABLE public.clubs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captain_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_verifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_todos       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs_all" ON public.clubs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "captain_all" ON public.captain_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tasks_all" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "verif_all" ON public.task_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todos_all" ON public.personal_todos FOR ALL USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS & TRIGGERS
-- ════════════════════════════════════════════════════════════════════

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
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Handle mobile unique conflicts gracefully
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_mobile_key CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_mobile_key UNIQUE (mobile);

-- ════════════════════════════════════════════════════════════════════
-- BULLETPROOF COMMANDER (ADMIN) GENERATION
-- ════════════════════════════════════════════════════════════════════
DO $$
DECLARE
    admin_uid UUID;
BEGIN
    -- Check if the admin email already exists in Auth
    SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@clubtrack.app' LIMIT 1;
    
    IF admin_uid IS NOT NULL THEN
        -- Safely overwrite the password to guarantee login works
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('admin@ct2025', gen_salt('bf')),
            role = 'authenticated',
            raw_user_meta_data = '{"name":"Admin Commander","role":"admin"}'
        WHERE id = admin_uid;
        
        -- Safely ensure profile is set to admin
        UPDATE public.profiles 
        SET role = 'admin', mobile = 'admin'
        WHERE id = admin_uid;
    ELSE
        -- Admin does not exist, create from absolute scratch
        admin_uid := gen_random_uuid();
        
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            role, confirmation_token, last_sign_in_at
        ) VALUES (
            admin_uid,
            'admin@clubtrack.app', 
            crypt('admin@ct2025', gen_salt('bf')), 
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Admin Commander","role":"admin"}',
            NOW(),
            NOW(),
            'authenticated',
            '',
            NOW()
        );

        -- Insert the profile manually (ON CONFLICT DO UPDATE handles if trigger fires first)
        INSERT INTO public.profiles (id, name, initials, mobile, city, ssb_board, role)
        VALUES (
            admin_uid,
            'Command Headquarters',
            'HQ',
            'admin',
            'Headquarters',
            'Command Center',
            'admin'
        ) ON CONFLICT (id) DO UPDATE 
        SET role = 'admin', mobile = 'admin';
    END IF;
END $$;
