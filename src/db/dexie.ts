import Dexie, { type EntityTable } from 'dexie';
import type {
  Profile,
  Assessment,
  RunningAttempt,
  BoxingSession,
  BoxingSkill,
  TimerPreset,
  NutritionFood,
  NutritionLog,
  NutritionTarget,
  PhaseProgress,
  SkillNode,
  SkillPrerequisite,
  KnowledgeAssessment,
  Quest,
  AISession,
  AIAction,
} from '../types';

export interface SyncQueueItem {
  id?: number;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export class BoxerOSDatabase extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  assessments!: EntityTable<Assessment, 'id'>;
  running_attempts!: EntityTable<RunningAttempt, 'id'>;
  boxing_sessions!: EntityTable<BoxingSession, 'id'>;
  boxing_skills!: EntityTable<BoxingSkill, 'id'>;
  timer_presets!: EntityTable<TimerPreset, 'id'>;
  nutrition_foods!: EntityTable<NutritionFood, 'id'>;
  nutrition_logs!: EntityTable<NutritionLog, 'id'>;
  nutrition_targets!: EntityTable<NutritionTarget, 'id'>;
  phase_progress!: EntityTable<PhaseProgress, 'id'>;
  skills!: EntityTable<SkillNode, 'id'>;
  skill_prerequisites!: EntityTable<SkillPrerequisite, 'id'>;
  knowledge_assessments!: EntityTable<KnowledgeAssessment, 'id'>;
  quests!: EntityTable<Quest, 'id'>;
  ai_sessions!: EntityTable<AISession, 'id'>;
  ai_actions!: EntityTable<AIAction, 'id'>;
  sync_queue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('BoxerOSDB');
    this.version(1).stores({
      profiles: 'id, user_id, updated_at',
      assessments: 'id, user_id, entry_number, is_baseline, updated_at',
      running_attempts: 'id, user_id, created_at, updated_at',
      boxing_sessions: 'id, user_id, created_at, updated_at',
      boxing_skills: 'id, user_id, skill_name, updated_at',
      timer_presets: 'id, user_id, is_default, updated_at',
      nutrition_foods: 'id, user_id, is_default, updated_at',
      nutrition_logs: 'id, user_id, log_date, meal_type, updated_at',
      nutrition_targets: 'id, user_id, updated_at',
      phase_progress: 'id, user_id, phase_number, status, updated_at',
      sync_queue: '++id, table_name, record_id, created_at',
    });

    this.version(2).stores({
      profiles: 'id, user_id, level, updated_at',
      assessments: 'id, user_id, entry_number, is_baseline, updated_at',
      running_attempts: 'id, user_id, created_at, updated_at',
      boxing_sessions: 'id, user_id, created_at, updated_at',
      boxing_skills: 'id, user_id, skill_name, updated_at',
      timer_presets: 'id, user_id, is_default, updated_at',
      nutrition_foods: 'id, user_id, is_default, updated_at',
      nutrition_logs: 'id, user_id, log_date, meal_type, updated_at',
      nutrition_targets: 'id, user_id, updated_at',
      phase_progress: 'id, user_id, phase_number, status, updated_at',
      skills: 'id, user_id, domain, category, state, parent_skill_id, updated_at',
      skill_prerequisites: 'id, skill_id, prerequisite_skill_id',
      knowledge_assessments: 'id, user_id, domain, category, updated_at',
      quests: 'id, user_id, domain, is_completed, updated_at',
      ai_sessions: 'id, user_id, session_type, updated_at',
      sync_queue: '++id, table_name, record_id, created_at',
    });

    this.version(3).stores({
      profiles: 'id, user_id, level, updated_at',
      assessments: 'id, user_id, entry_number, is_baseline, updated_at',
      running_attempts: 'id, user_id, created_at, updated_at',
      boxing_sessions: 'id, user_id, created_at, updated_at',
      boxing_skills: 'id, user_id, skill_name, updated_at',
      timer_presets: 'id, user_id, is_default, updated_at',
      nutrition_foods: 'id, user_id, is_default, updated_at',
      nutrition_logs: 'id, user_id, log_date, meal_type, updated_at',
      nutrition_targets: 'id, user_id, updated_at',
      phase_progress: 'id, user_id, phase_number, status, updated_at',
      skills: 'id, user_id, domain, category, state, parent_skill_id, updated_at',
      skill_prerequisites: 'id, skill_id, prerequisite_skill_id',
      knowledge_assessments: 'id, user_id, domain, category, updated_at',
      quests: 'id, user_id, domain, is_completed, updated_at',
      ai_sessions: 'id, user_id, session_type, updated_at',
      ai_actions: 'id, user_id, session_id, action_type, created_at',
      sync_queue: '++id, table_name, record_id, created_at',
    });
  }
}

export const db = new BoxerOSDatabase();

