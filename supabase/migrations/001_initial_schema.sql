-- ─────────────────────────────────────────────────────────────
-- BOXER//OS — Supabase Database Migration (001_initial_schema.sql)
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  height_cm NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL,
  body_fat_pct NUMERIC,
  waist_inches NUMERIC NOT NULL,
  diet_type TEXT DEFAULT 'indian',
  is_halal BOOLEAN DEFAULT true,
  soya_free BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 2. ASSESSMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_number INTEGER NOT NULL,
  is_baseline BOOLEAN DEFAULT false,
  weight_kg NUMERIC NOT NULL,
  body_fat_pct NUMERIC,
  waist_inches NUMERIC NOT NULL,
  pushups INTEGER NOT NULL,
  squats INTEGER NOT NULL,
  pullups INTEGER NOT NULL,
  plank_seconds INTEGER NOT NULL,
  jump_rope_seconds INTEGER NOT NULL,
  walking_minutes NUMERIC NOT NULL,
  jogging_minutes NUMERIC NOT NULL,
  running_status TEXT NOT NULL,
  running_notes TEXT,
  coach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 3. RUNNING ATTEMPTS (RUN-FIX) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.running_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration_minutes NUMERIC NOT NULL,
  distance_km NUMERIC,
  surface TEXT NOT NULL,
  footwear TEXT,
  pace TEXT,
  breathing_rpe INTEGER NOT NULL,
  leg_fatigue_rpe INTEGER NOT NULL,
  pain_score INTEGER NOT NULL,
  pain_locations TEXT[] DEFAULT '{}',
  symptoms TEXT[] DEFAULT '{}',
  coach_feel TEXT,
  coach_stopped TEXT,
  coach_unusual TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 4. BOXING SESSIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.boxing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL,
  duration_minutes NUMERIC NOT NULL,
  rounds_completed INTEGER NOT NULL,
  combos_practiced TEXT[] DEFAULT '{}',
  skills_worked TEXT[] DEFAULT '{}',
  intensity_rpe INTEGER NOT NULL,
  coach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 5. BOXING SKILLS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.boxing_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 6. TIMER PRESETS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timer_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  work_seconds INTEGER NOT NULL,
  rest_seconds INTEGER NOT NULL,
  warning_seconds INTEGER NOT NULL,
  total_rounds INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 7. NUTRITION FOODS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nutrition_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  calories_per_100g NUMERIC NOT NULL,
  protein_per_100g NUMERIC NOT NULL,
  carbs_per_100g NUMERIC NOT NULL,
  fat_per_100g NUMERIC NOT NULL,
  is_halal BOOLEAN DEFAULT true,
  is_low_cost BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 8. NUTRITION LOGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  food_id UUID,
  food_name TEXT NOT NULL,
  quantity_grams NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  meal_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 9. NUTRITION TARGETS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nutrition_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  calories_target NUMERIC NOT NULL,
  protein_target NUMERIC NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 10. PHASE PROGRESS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.phase_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  status TEXT NOT NULL,
  criteria JSONB NOT NULL,
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boxing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boxing_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_progress ENABLE ROW LEVEL SECURITY;

-- Helper to apply RLS policy to all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Users access own %I" ON public.%I;
      CREATE POLICY "Users access own %I" ON public.%I
        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    ', t, t, t, t);
  END LOOP;
END $$;
