import { z } from 'zod';

export const UserConstraintsSchema = z.object({
  equipment: z.array(z.string()).nullish(),
  daily_minutes: z.number().nullish(),
  budget: z.string().nullish(),
  location: z.string().nullish(),
  cannot_do: z.array(z.string()).nullish(),
});

export const ProfileProposalSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.coerce.number().min(1).max(120),
  height_cm: z.coerce.number().min(50).max(300),
  weight_kg: z.coerce.number().min(20).max(300),
  diet_type: z.string().nullish().transform((v) => v || 'standard'),
  is_halal: z.boolean().nullish().transform((v) => Boolean(v)),
  soya_free: z.boolean().nullish().transform((v) => Boolean(v)),
  enabled_modules: z.array(z.string()).nullish(),
  constraints: UserConstraintsSchema.nullish(),
});

export const SkillProposalSchema = z.object({
  domain: z.enum(['body', 'mind', 'tech']),
  category: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  state: z.enum(['unknown', 'discovered']).nullish().transform((v) => v || 'discovered'),
});

export const QuestProposalSchema = z.object({
  title: z.string().min(2).max(200),
  domain: z.enum(['body', 'mind', 'tech']),
  xp_reward: z.coerce.number().nullish().transform((v) => Math.min(Math.max(v || 50, 5), 200)),
  target_skill_names: z.array(z.string()).nullish().transform((v) => v || []),
  estimated_minutes: z.coerce.number().nullish(),
  evidence_required: z.string().nullish(),
});

export const EvidenceProposalSchema = z.object({
  skill_name: z.string().min(1).max(100),
  source: z.enum(['onboarding', 'assessment', 'session_log', 'self_report']),
  claim: z.string().min(1).max(500),
  value: z.coerce.number().nullish(),
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
  onboarding_complete: z.boolean().nullish(),
  profile: ProfileProposalSchema.nullish(),
  skills: z.array(SkillProposalSchema).nullish(),
  quests: z.array(QuestProposalSchema).nullish(),
  evidence: EvidenceProposalSchema.nullish(),
});

export type CielAction = z.infer<typeof CielActionSchema>;
export type ProfileProposal = z.infer<typeof ProfileProposalSchema>;
export type SkillProposal = z.infer<typeof SkillProposalSchema>;
export type QuestProposal = z.infer<typeof QuestProposalSchema>;
export type EvidenceProposal = z.infer<typeof EvidenceProposalSchema>;
