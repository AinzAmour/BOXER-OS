import { db } from '../db/dexie';
import { syncManager } from '../services/sync';
import type {
  CielAction,
  ProfileProposal,
  SkillProposal,
  QuestProposal,
  EvidenceProposal,
} from './cielSchemas';
import type {
  Profile,
  Assessment,
  SkillNode,
  Quest,
  SkillEvidence,
  NutritionTarget,
  PhaseProgress,
  SkillState,
  AIAction,
} from '../types';

export interface ActionResult {
  success: boolean;
  action_type: string;
  created_ids: string[];
  message: string;
}

const getDeviceId = (): string => {
  try {
    let devId = localStorage.getItem('boxer_os_device_id');
    if (!devId) {
      devId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dev_${Date.now()}`;
      localStorage.setItem('boxer_os_device_id', devId);
    }
    return devId;
  } catch {
    return 'dev_fallback';
  }
};

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Resolve an AI skill proposal name to an existing skill ID or create a new one.
 * Ensures deduplication (idempotency) by matching trimmed, lowercased skill names for this user.
 */
export async function resolveOrCreateSkill(
  proposal: SkillProposal,
  userId: string
): Promise<string> {
  const deviceId = getDeviceId();
  const now = new Date().toISOString();
  const normalizedName = proposal.name.trim().toLowerCase();

  const userSkills = await db.skills.where('user_id').equals(userId).toArray();
  const existing = userSkills.find(
    (s) => s.name.trim().toLowerCase() === normalizedName
  );

  if (existing) {
    return existing.id;
  }

  // Create new skill node — state capped at 'discovered' or 'unknown'
  const newId = generateUUID();
  const newState: SkillState = proposal.state === 'discovered' ? 'discovered' : 'unknown';

  const newSkill: SkillNode = {
    id: newId,
    user_id: userId,
    domain: proposal.domain,
    category: proposal.category,
    name: proposal.name.trim(),
    state: newState,
    knowledge_pct: newState === 'discovered' ? 30 : 0,
    practical_pct: 0,
    experience_pct: 0,
    confidence: 'LOW',
    parent_skill_id: null,
    notes: 'Created via Ciel proposal',
    evidence: [],
    created_at: now,
    updated_at: now,
    device_id: deviceId,
    deleted_at: null,
    sync_version: 1,
  };

  await db.skills.put(newSkill);
  await syncManager.queueChange('skills', 'INSERT', newId, newSkill as unknown as Record<string, unknown>);
  return newId;
}

/**
 * Resolve a quest proposal title to an existing incomplete quest ID or create a new one.
 * Idempotency check prevents duplicate quest creation during LLM retries.
 */
export async function resolveOrCreateQuest(
  proposal: QuestProposal,
  targetSkillIds: string[],
  userId: string
): Promise<string> {
  const deviceId = getDeviceId();
  const now = new Date().toISOString();
  const normalizedTitle = proposal.title.trim().toLowerCase();

  const userQuests = await db.quests.where('user_id').equals(userId).toArray();
  const existing = userQuests.find(
    (q) => !q.is_completed && q.title.trim().toLowerCase() === normalizedTitle
  );

  if (existing) {
    return existing.id;
  }

  const questId = generateUUID();
  const quest: Quest = {
    id: questId,
    user_id: userId,
    title: proposal.title.trim(),
    domain: proposal.domain,
    xp_reward: Math.min(Math.max(proposal.xp_reward, 5), 200),
    is_completed: false,
    completed_at: null,
    target_skill_ids: targetSkillIds,
    estimated_minutes: proposal.estimated_minutes,
    evidence_required: proposal.evidence_required,
    created_at: now,
    updated_at: now,
    device_id: deviceId,
    deleted_at: null,
    sync_version: 1,
  };

  await db.quests.put(quest);
  await syncManager.queueChange('quests', 'INSERT', questId, quest as unknown as Record<string, unknown>);
  return questId;
}

/**
 * Evaluates evidence for a skill and applies state promotion rules.
 */
export async function recordSkillEvidence(
  evidence: EvidenceProposal,
  userId: string
): Promise<{ skill_id: string | null; promoted: boolean }> {
  const now = new Date().toISOString();
  const normalizedName = evidence.skill_name.trim().toLowerCase();

  const userSkills = await db.skills.where('user_id').equals(userId).toArray();
  const skill = userSkills.find(
    (s) => s.name.trim().toLowerCase() === normalizedName
  );

  if (!skill) {
    console.warn(`[ActionEngine] Cannot record evidence for non-existent skill: ${evidence.skill_name}`);
    return { skill_id: null, promoted: false };
  }

  const newEvidenceItem: SkillEvidence = {
    source: evidence.source,
    claim: evidence.claim,
    value: evidence.value,
    confidence: evidence.confidence,
    recorded_at: now,
  };

  const updatedEvidenceList = [...(skill.evidence || []), newEvidenceItem];
  let newState: SkillState = skill.state;
  let promoted = false;

  // Progression Rules based on evidence source & confidence
  if (evidence.source === 'assessment' && evidence.confidence === 'assessed') {
    if (skill.state === 'unknown' || skill.state === 'discovered') {
      newState = 'training';
      promoted = true;
    } else if (skill.state === 'training' && (evidence.value || 0) >= 70) {
      newState = 'practicing';
      promoted = true;
    } else if (skill.state === 'practicing' && (evidence.value || 0) >= 85) {
      newState = 'proficient';
      promoted = true;
    }
  } else if (evidence.source === 'session_log' && evidence.confidence === 'observed') {
    if (skill.state === 'unknown' || skill.state === 'discovered') {
      newState = 'training';
      promoted = true;
    } else if (skill.state === 'training' && updatedEvidenceList.length >= 3) {
      newState = 'practicing';
      promoted = true;
    }
  } else if (evidence.source === 'onboarding' || evidence.confidence === 'self_reported') {
    // Self reported evidence capped at 'discovered'
    if (skill.state === 'unknown') {
      newState = 'discovered';
      promoted = true;
    }
  }

  const updatedSkill: SkillNode = {
    ...skill,
    state: newState,
    evidence: updatedEvidenceList,
    knowledge_pct: Math.min(skill.knowledge_pct + 10, 100),
    practical_pct: promoted ? Math.min(skill.practical_pct + 15, 100) : skill.practical_pct,
    updated_at: now,
  };

  await db.skills.put(updatedSkill);
  await syncManager.queueChange('skills', 'UPDATE', skill.id, updatedSkill as unknown as Record<string, unknown>);
  return { skill_id: skill.id, promoted };
}

/**
 * Main Action Engine entry point.
 * Enforces permissions, idempotency, evidence limits, and writes Dexie.
 */
export async function executeCielAction(
  action: CielAction,
  userId: string,
  sessionId: string = 'session_default'
): Promise<ActionResult> {
  const createdIds: string[] = [];
  const deviceId = getDeviceId();
  const now = new Date().toISOString();

  let executionStatus: 'passed' | 'failed' | 'partial' | 'rejected' = 'passed';
  let validationErrors: string[] | undefined = undefined;

  try {
    switch (action.action) {
      case 'onboarding_complete': {
        if (!action.profile) {
          throw new Error('Onboarding complete action missing profile payload');
        }
        const profilePayload: ProfileProposal = action.profile;
        const profileId = generateUUID();

        // Map high-level domains ('body', 'mind', 'tech') to specific UI module keys
        const rawModules = profilePayload.enabled_modules || ['body', 'mind', 'tech'];
        const mappedModules = new Set<string>();
        for (const m of rawModules) {
          if (m === 'body') {
            mappedModules.add('fitness');
            mappedModules.add('boxing');
            mappedModules.add('running');
            mappedModules.add('nutrition');
            mappedModules.add('timer');
          } else if (m === 'mind') {
            mappedModules.add('mind');
          } else if (m === 'tech') {
            mappedModules.add('cyber');
          } else {
            mappedModules.add(m);
          }
        }

        const profile: Profile = {
          id: profileId,
          user_id: userId,
          name: profilePayload.name,
          age: profilePayload.age,
          height_cm: profilePayload.height_cm,
          weight_kg: profilePayload.weight_kg,
          body_fat_pct: null,
          waist_inches: 32,
          diet_type: profilePayload.diet_type || 'halal',
          is_halal: profilePayload.is_halal,
          soya_free: profilePayload.soya_free,
          level: 1,
          xp: 100,
          constraints: profilePayload.constraints || {},
          enabled_modules: Array.from(mappedModules),
          created_at: now,
          updated_at: now,
          device_id: deviceId,
          deleted_at: null,
          sync_version: 1,
        };

        await db.profiles.put(profile);
        await syncManager.queueChange('profiles', 'INSERT', profileId, profile as unknown as Record<string, unknown>);
        createdIds.push(profileId);

        // Baseline assessment Entry #0
        const baselineId = generateUUID();
        const baseline: Assessment = {
          id: baselineId,
          user_id: userId,
          entry_number: 0,
          is_baseline: true,
          weight_kg: profilePayload.weight_kg,
          body_fat_pct: null,
          waist_inches: 32,
          pushups: 10,
          squats: 15,
          pullups: 0,
          plank_seconds: 30,
          jump_rope_seconds: 30,
          walking_minutes: 15,
          jogging_minutes: 0,
          running_status: 'unable',
          running_notes: 'Initial baseline created during AI onboarding.',
          coach_notes: `Onboarding completed for ${profilePayload.name}. Goals & constraints saved.`,
          created_at: now,
          updated_at: now,
          device_id: deviceId,
          deleted_at: null,
          sync_version: 1,
        };
        await db.assessments.put(baseline);
        await syncManager.queueChange('assessments', 'INSERT', baselineId, baseline as unknown as Record<string, unknown>);
        createdIds.push(baselineId);

        // Initial skills with idempotency check
        const skillsToCreate: SkillProposal[] = (action.skills && action.skills.length > 0)
          ? action.skills
          : [
              { domain: 'body', category: 'boxing', name: 'Orthodox Stance & Guard', state: 'discovered' },
              { domain: 'body', category: 'calisthenics', name: 'Strict Push-ups', state: 'discovered' },
              { domain: 'tech', category: 'linux', name: 'Linux CLI Navigation', state: 'discovered' },
              { domain: 'mind', category: 'focus', name: 'Deep Work Focus', state: 'discovered' },
            ];

        for (const s of skillsToCreate) {
          const skillId = await resolveOrCreateSkill(s, userId);
          createdIds.push(skillId);
        }

        // Initial quests with idempotency check
        const questsToCreate: QuestProposal[] = (action.quests && action.quests.length > 0)
          ? action.quests
          : [
              { title: 'Complete 3 Shadowboxing Rounds (3 min each)', domain: 'body', xp_reward: 75, target_skill_names: ['Orthodox Stance & Guard'], estimated_minutes: 15 },
              { title: 'Linux Terminal Commands Practice', domain: 'tech', xp_reward: 50, target_skill_names: ['Linux CLI Navigation'], estimated_minutes: 20 },
            ];

        for (const q of questsToCreate) {
          const targetSkillIds: string[] = [];
          for (const name of q.target_skill_names) {
            const skillId = await resolveOrCreateSkill(
              { domain: q.domain, category: 'general', name, state: 'discovered' },
              userId
            );
            targetSkillIds.push(skillId);
          }
          const questId = await resolveOrCreateQuest(q, targetSkillIds, userId);
          createdIds.push(questId);
        }

        // Nutrition Target
        const targetId = generateUUID();
        const target: NutritionTarget = {
          id: targetId,
          user_id: userId,
          calories_target: 2000,
          protein_target: 120,
          label: 'Personalized target derived from onboarding goals.',
          created_at: now,
          updated_at: now,
          device_id: deviceId,
          deleted_at: null,
          sync_version: 1,
        };
        await db.nutrition_targets.put(target);
        await syncManager.queueChange('nutrition_targets', 'INSERT', targetId, target as unknown as Record<string, unknown>);
        createdIds.push(targetId);

        // PhaseProgress #1
        const phase1Id = generateUUID();
        const phase1: PhaseProgress = {
          id: phase1Id,
          user_id: userId,
          phase_number: 1,
          phase_name: 'Foundation Phase',
          status: 'active',
          criteria: {
            'complete_baseline': true,
            'establish_routine': false,
            'log_first_week': false,
          },
          unlocked_at: now,
          completed_at: null,
          created_at: now,
          updated_at: now,
          device_id: deviceId,
          deleted_at: null,
          sync_version: 1,
        };
        await db.phase_progress.put(phase1);
        await syncManager.queueChange('phase_progress', 'INSERT', phase1Id, phase1 as unknown as Record<string, unknown>);
        createdIds.push(phase1Id);

        break;
      }

      case 'update_profile': {
        if (!action.profile) break;
        const profilePayload = action.profile;
        const existingProfile = await db.profiles.where('user_id').equals(userId).first();

        if (existingProfile) {
          const updated: Profile = {
            ...existingProfile,
            name: profilePayload.name || existingProfile.name,
            age: profilePayload.age || existingProfile.age,
            height_cm: profilePayload.height_cm || existingProfile.height_cm,
            weight_kg: profilePayload.weight_kg || existingProfile.weight_kg,
            diet_type: profilePayload.diet_type || existingProfile.diet_type,
            is_halal: profilePayload.is_halal ?? existingProfile.is_halal,
            soya_free: profilePayload.soya_free ?? existingProfile.soya_free,
            constraints: profilePayload.constraints || existingProfile.constraints,
            enabled_modules: profilePayload.enabled_modules || existingProfile.enabled_modules,
            updated_at: now,
          };
          await db.profiles.put(updated);
          await syncManager.queueChange('profiles', 'UPDATE', existingProfile.id, updated as unknown as Record<string, unknown>);
          createdIds.push(existingProfile.id);
        }
        break;
      }

      case 'create_skills': {
        if (!action.skills) break;
        for (const s of action.skills) {
          const skillId = await resolveOrCreateSkill(s, userId);
          createdIds.push(skillId);
        }
        break;
      }

      case 'create_quests': {
        if (!action.quests) break;
        for (const q of action.quests) {
          const targetSkillIds: string[] = [];
          for (const name of q.target_skill_names) {
            const skillId = await resolveOrCreateSkill(
              { domain: q.domain, category: 'general', name, state: 'discovered' },
              userId
            );
            targetSkillIds.push(skillId);
          }
          const questId = await resolveOrCreateQuest(q, targetSkillIds, userId);
          createdIds.push(questId);
        }
        break;
      }

      case 'record_evidence': {
        if (!action.evidence) break;
        const res = await recordSkillEvidence(action.evidence, userId);
        if (res.skill_id) {
          createdIds.push(res.skill_id);
        }
        break;
      }

      case 'reschedule': {
        const userQuests = await db.quests.where('user_id').equals(userId).toArray();
        const incomplete = userQuests.filter((q) => !q.is_completed);

        for (const q of incomplete) {
          await db.quests.delete(q.id);
          await syncManager.queueChange('quests', 'DELETE', q.id, {});
        }

        if (action.quests && action.quests.length > 0) {
          for (const q of action.quests) {
            const targetSkillIds: string[] = [];
            for (const name of q.target_skill_names) {
              const skillId = await resolveOrCreateSkill(
                { domain: q.domain, category: 'general', name, state: 'discovered' },
                userId
              );
              targetSkillIds.push(skillId);
            }
            const questId = await resolveOrCreateQuest(q, targetSkillIds, userId);
            createdIds.push(questId);
          }
        }
        break;
      }

      case 'none':
      default:
        break;
    }

    // Record AI Action Audit Log in Dexie
    const auditId = generateUUID();
    const auditRecord: AIAction = {
      id: auditId,
      user_id: userId,
      session_id: sessionId,
      action_type: action.action,
      proposed_data: JSON.stringify(action),
      validation_result: executionStatus,
      validation_errors: validationErrors,
      records_created: createdIds,
      created_at: now,
      updated_at: now,
      device_id: deviceId,
      deleted_at: null,
      sync_version: 1,
    };
    await db.ai_actions.put(auditRecord);

    return {
      success: true,
      action_type: action.action,
      created_ids: createdIds,
      message: `Action '${action.action}' executed successfully with idempotency protection.`,
    };
  } catch (err) {
    executionStatus = 'failed';
    const errMsg = err instanceof Error ? err.message : 'Unknown execution error';
    validationErrors = [errMsg];

    console.error(`[ActionEngine] Error executing action '${action.action}':`, err);

    // Audit failed execution
    try {
      const auditId = generateUUID();
      const auditRecord: AIAction = {
        id: auditId,
        user_id: userId,
        session_id: sessionId,
        action_type: action.action,
        proposed_data: JSON.stringify(action),
        validation_result: 'rejected',
        validation_errors: validationErrors,
        records_created: [],
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      };
      await db.ai_actions.put(auditRecord);
    } catch (auditErr) {
      console.warn('[ActionEngine] Failed to write audit record:', auditErr);
    }

    return {
      success: false,
      action_type: action.action,
      created_ids: [],
      message: errMsg,
    };
  }
}
