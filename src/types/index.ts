// ─────────────────────────────────────────────────────────────
// LIFE//OS v1.0  —  TypeScript Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Sync Metadata (every synced record) ──────────────────────
export interface SyncMeta {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  device_id: string;
  deleted_at: string | null;
  sync_version: number;
}

// ── Profile ──────────────────────────────────────────────────
export interface Profile extends SyncMeta {
  name: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  body_fat_pct: number | null;
  waist_inches: number;
  diet_type: string;
  is_halal: boolean;
  soya_free: boolean;
  level: number;
  xp: number;
}

// ── Assessment (Baseline + Retests) ──────────────────────────
export interface Assessment extends SyncMeta {
  entry_number: number;
  is_baseline: boolean;
  weight_kg: number;
  body_fat_pct: number | null;
  waist_inches: number;
  pushups: number;
  squats: number;
  pullups: number;
  plank_seconds: number;
  jump_rope_seconds: number;
  walking_minutes: number;
  jogging_minutes: number;
  running_status: 'unable' | 'limited' | 'progressing' | 'normal';
  running_notes: string;
  coach_notes: string;
}

// ── Running Attempt (Run-Fix) ────────────────────────────────
export type PainLocation = 'shin' | 'knee' | 'ankle' | 'foot' | 'hip' | 'back';
export type RunSymptom = 'breathlessness' | 'leg_fatigue' | 'sharp_pain' | 'dull_ache' | 'tightness' | 'dizziness';
export type RunSurface = 'tarmac' | 'grass' | 'track' | 'treadmill' | 'dirt';

export interface RunningAttempt extends SyncMeta {
  duration_minutes: number;
  distance_km: number | null;
  surface: RunSurface;
  footwear: string;
  pace: string;
  breathing_rpe: number;
  leg_fatigue_rpe: number;
  pain_score: number;
  pain_locations: PainLocation[];
  symptoms: RunSymptom[];
  coach_feel: string;
  coach_stopped: string;
  coach_unusual: string;
}

// ── Boxing ───────────────────────────────────────────────────
export type SessionType = 'shadowboxing' | 'drill' | 'conditioning' | 'footwork';
export type SkillName = 'jab' | 'cross' | 'lead_hook' | 'rear_hook' | 'lead_uppercut' | 'rear_uppercut' | 'slip' | 'weave' | 'stance' | 'guard' | 'footwork';
export type SkillCategory = 'offense' | 'defense' | 'movement' | 'fundamentals';
export type Proficiency = 'not_started' | 'learning' | 'developing' | 'competent';

export interface BoxingSession extends SyncMeta {
  session_type: SessionType;
  duration_minutes: number;
  rounds_completed: number;
  combos_practiced: string[];
  skills_worked: SkillName[];
  intensity_rpe: number;
  coach_notes: string;
}

export interface BoxingSkill extends SyncMeta {
  skill_name: SkillName;
  category: SkillCategory;
  proficiency: Proficiency;
  notes: string;
}

// ── Timer ────────────────────────────────────────────────────
export interface TimerPreset extends SyncMeta {
  name: string;
  work_seconds: number;
  rest_seconds: number;
  warning_seconds: number;
  total_rounds: number;
  is_default: boolean;
}

// ── Nutrition ────────────────────────────────────────────────
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionFood extends SyncMeta {
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  is_halal: boolean;
  is_low_cost: boolean;
  is_default: boolean;
}

export interface NutritionLog extends SyncMeta {
  log_date: string;
  food_id: string;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  meal_type: MealType;
}

export interface NutritionTarget extends SyncMeta {
  calories_target: number;
  protein_target: number;
  label: string;
}

// ── Phase Progression ────────────────────────────────────────
export type PhaseStatus = 'locked' | 'active' | 'completed';

export interface PhaseProgress extends SyncMeta {
  phase_number: number;
  phase_name: string;
  status: PhaseStatus;
  criteria: Record<string, boolean>;
  unlocked_at: string | null;
  completed_at: string | null;
}

// ── LIFE//OS Skill Graph Definitions ─────────────────────────
export type DomainType = 'body' | 'mind' | 'tech';
export type SkillState = 'unknown' | 'discovered' | 'training' | 'practicing' | 'proficient' | 'mastered' | 'advanced';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SkillNode extends SyncMeta {
  domain: DomainType;
  category: string;             // e.g. 'boxing', 'calisthenics', 'linux', 'networking'
  name: string;
  state: SkillState;
  knowledge_pct: number;
  practical_pct: number;
  experience_pct: number;
  confidence: ConfidenceLevel;
  parent_skill_id: string | null; // Hierarchy Tree parent
  notes: string;
}

export interface SkillPrerequisite {
  id: string;
  skill_id: string;              // Skill being unlocked
  prerequisite_skill_id: string; // Required skill
  required_practical_pct: number;
  created_at: string;
}

export interface KnowledgeAssessment extends SyncMeta {
  domain: DomainType;
  category: string;
  evaluated_skill_ids: string[];
  score_pct: number;
  summary: string;
  gaps_identified: string[];
}

export interface Quest extends SyncMeta {
  title: string;
  domain: DomainType;
  xp_reward: number;
  is_completed: boolean;
  completed_at: string | null;
  target_skill_ids: string[];
}

export interface AISession extends SyncMeta {
  session_type: 'assessment' | 'cyber_mentor' | 'boxing_coach' | 'fitness_coach' | 'weekly_review';
  prompt_summary: string;
  ai_response: string;
  provider_used: 'groq' | 'gemini';
}

// ── App Navigation ───────────────────────────────────────────
export type TabId =
  | 'dashboard'
  | 'skills'
  | 'assessments'
  | 'runfix'
  | 'boxing'
  | 'timer'
  | 'nutrition'
  | 'progression'
  | 'ai_coach'
  | 'settings';

// ── Sync State ───────────────────────────────────────────────
export type SyncStatus = 'online' | 'syncing' | 'offline' | 'synced';
