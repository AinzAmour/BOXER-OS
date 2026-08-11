import { db } from '../db/dexie';

export async function buildUserContext(userId: string): Promise<string> {
  try {
    const profile = await db.profiles.where('user_id').equals(userId).first();
    const skills = await db.skills.where('user_id').equals(userId).toArray();
    const baseline = await db.assessments
      .where({ user_id: userId, is_baseline: 1 })
      .first();
    const recentQuests = await db.quests
      .where('user_id')
      .equals(userId)
      .limit(10)
      .toArray();
    const recentRuns = await db.running_attempts
      .where('user_id')
      .equals(userId)
      .limit(5)
      .toArray();
    const phases = await db.phase_progress
      .where('user_id')
      .equals(userId)
      .toArray();

    const activePhase = phases.find((p) => p.status === 'active');

    const contextObj = {
      profile: profile
        ? {
            name: profile.name,
            age: profile.age,
            height_cm: profile.height_cm,
            weight_kg: profile.weight_kg,
            level: profile.level,
            xp: profile.xp,
            enabled_modules: profile.enabled_modules || [],
            constraints: profile.constraints || {},
          }
        : null,
      skills_summary: {
        total_skills: skills.length,
        skills_list: skills.map((s) => ({
          domain: s.domain,
          category: s.category,
          name: s.name,
          state: s.state,
        })),
      },
      baseline_assessment: baseline
        ? {
            weight_kg: baseline.weight_kg,
            pushups: baseline.pushups,
            pullups: baseline.pullups,
            squats: baseline.squats,
            plank_seconds: baseline.plank_seconds,
            running_status: baseline.running_status,
          }
        : null,
      recent_quests: recentQuests.map((q) => ({
        title: q.title,
        domain: q.domain,
        is_completed: q.is_completed,
        xp_reward: q.xp_reward,
      })),
      recent_running_attempts: recentRuns.map((r) => ({
        duration_minutes: r.duration_minutes,
        surface: r.surface,
        pain_score: r.pain_score,
        pain_locations: r.pain_locations,
      })),
      active_phase: activePhase
        ? {
            number: activePhase.phase_number,
            name: activePhase.phase_name,
            criteria: activePhase.criteria,
          }
        : null,
    };

    return JSON.stringify(contextObj, null, 2);
  } catch (err) {
    console.warn('[ContextBuilder] Error generating user context:', err);
    return JSON.stringify({ note: 'User context uninitialized' });
  }
}
