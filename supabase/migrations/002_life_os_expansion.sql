-- ─────────────────────────────────────────────────────────────
-- LIFE//OS v1.0 — Database Expansion Migration (002_life_os_expansion.sql)
-- ─────────────────────────────────────────────────────────────

-- Add Level & XP to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- ── 1. SKILLS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,          -- 'body', 'mind', 'tech'
  category TEXT NOT NULL,        -- 'boxing', 'calisthenics', 'cybersecurity', 'linux', etc.
  name TEXT NOT NULL,
  state TEXT NOT NULL,           -- 'unknown', 'discovered', 'training', 'practicing', 'proficient', 'mastered', 'advanced'
  knowledge_pct INTEGER DEFAULT 0,
  practical_pct INTEGER DEFAULT 0,
  experience_pct INTEGER DEFAULT 0,
  confidence TEXT DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'HIGH'
  parent_skill_id UUID REFERENCES public.skills(id), -- Organizational tree
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 2. SKILL PREREQUISITES (Unlock DAG Join Table) ───────────
CREATE TABLE IF NOT EXISTS public.skill_prerequisites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  prerequisite_skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  required_practical_pct INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. KNOWLEDGE & ADAPTIVE ASSESSMENTS ──────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  category TEXT NOT NULL,
  evaluated_skill_ids UUID[] DEFAULT '{}',
  score_pct INTEGER NOT NULL,
  summary TEXT,
  gaps_identified TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 4. QUESTS (Daily Multi-Skill Missions) ───────────────────
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,          -- 'body', 'mind', 'tech'
  xp_reward INTEGER DEFAULT 50,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  target_skill_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- ── 5. AI SESSIONS & WEEKLY REVIEWS ──────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL,    -- 'assessment', 'cyber_mentor', 'boxing_coach', 'fitness_coach', 'weekly_review'
  prompt_summary TEXT,
  ai_response TEXT NOT NULL,
  provider_used TEXT NOT NULL,   -- 'groq' | 'gemini'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  sync_version INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

-- Apply RLS policies to user-owned tables
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['skills', 'knowledge_assessments', 'quests', 'ai_sessions']) LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Users access own %I" ON public.%I;
      CREATE POLICY "Users access own %I" ON public.%I
        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    ', t, t, t, t);
  END LOOP;
END $$;

-- Policy for join table skill_prerequisites (checks user_id via parent skill)
DROP POLICY IF EXISTS "Users access own skill_prerequisites" ON public.skill_prerequisites;
CREATE POLICY "Users access own skill_prerequisites" ON public.skill_prerequisites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.skills s WHERE s.id = skill_id AND s.user_id = auth.uid()
    )
  );
