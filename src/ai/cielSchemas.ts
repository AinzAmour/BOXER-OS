import { z } from 'zod';

export const UserConstraintsSchema = z.object({
  equipment: z.array(z.string()).optional(),
  daily_minutes: z.number().min(5).max(480).optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  cannot_do: z.array(z.string()).optional(),
});

export const ProfileProposalSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(10).max(120),
  height_cm: z.number().min(100).max(250),
  weight_kg: z.number().min(30).max(300),
  diet_type: z.string().default('standard'),
  is_halal: z.boolean().default(false),
  soya_free: z.boolean().default(false),
  enabled_modules: z.array(z.string()).optional(),
  constraints: UserConstraintsSchema.optional(),
});

export const SkillProposalSchema = z.object({
  domain: z.enum(['body', 'mind', 'tech']),
  category: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  state: z.enum(['unknown', 'discovered']), // Ciel can only propose unknown or discovered!
});

export const QuestProposalSchema = z.object({
  title: z.string().min(3).max(200),
  domain: z.enum(['body', 'mind', 'tech']),
  xp_reward: z.number().int().min(5).max(200), // Capped XP reward
  target_skill_names: z.array(z.string()).default([]),
  estimated_minutes: z.number().int().min(5).max(180).optional(),
  evidence_required: z.string().optional(),
});

export const EvidenceProposalSchema = z.object({
  skill_name: z.string().min(1).max(100),
  source: z.enum(['onboarding', 'assessment', 'session_log', 'self_report']),
  claim: z.string().min(1).max(500),
  value: z.number().optional(),
  confidence: z.enum(['self_reported', 'observed', 'assessed']),
});

export const CielActionSchema = z.object({
  action: z.enum([
    'onboarding_complete',
    'update_profile',
    'create_skills',
    'create_quests',
    'record_evidence',
    'reschedule',
    'none',
  ]),
  onboarding_complete: z.boolean().optional(),
  profile: ProfileProposalSchema.nullable().optional(),
  skills: z.array(SkillProposalSchema).nullable().optional(),
  quests: z.array(QuestProposalSchema).nullable().optional(),
  evidence: EvidenceProposalSchema.nullable().optional(),
});

export type CielAction = z.infer<typeof CielActionSchema>;
export type ProfileProposal = z.infer<typeof ProfileProposalSchema>;
export type SkillProposal = z.infer<typeof SkillProposalSchema>;
export type QuestProposal = z.infer<typeof QuestProposalSchema>;
export type EvidenceProposal = z.infer<typeof EvidenceProposalSchema>;
