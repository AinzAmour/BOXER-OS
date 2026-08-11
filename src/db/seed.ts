import { db } from './dexie';
import type {
  Profile,
  Assessment,
  NutritionFood,
  NutritionTarget,
  TimerPreset,
  PhaseProgress,
  SkillNode,
  Quest,
} from '../types';

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

export const seedInitialData = async (userId: string = 'local_user') => {
  try {
    const deviceId = getDeviceId();
    const now = new Date().toISOString();

    // 1. Profile
    const existingProfile = await db.profiles.count();
    if (existingProfile === 0) {
      const profile: Profile = {
        id: 'profile_default',
        user_id: userId,
        name: 'Mohammed Habibur Rahman',
        age: 21,
        height_cm: 178, // 5'10"
        weight_kg: 85,
        body_fat_pct: 30, // estimated >30%
        waist_inches: 34,
        diet_type: 'indian',
        is_halal: true,
        soya_free: true,
        level: 1,
        xp: 150,
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      };
      await db.profiles.put(profile);
    }

    // 2. Baseline Assessment Entry #0
    const existingBaseline = await db.assessments.where('entry_number').equals(0).first();
    if (!existingBaseline) {
      const baseline: Assessment = {
        id: 'assessment_baseline_0',
        user_id: userId,
        entry_number: 0,
        is_baseline: true,
        weight_kg: 85,
        body_fat_pct: 30,
        waist_inches: 34,
        pushups: 15,
        squats: 20,
        pullups: 5,
        plank_seconds: 60,
        jump_rope_seconds: 60,
        walking_minutes: 10,
        jogging_minutes: 15,
        running_status: 'unable',
        running_notes: 'Currently unable. Reason not yet identified. To be investigated through Run-Fix baseline assessment.',
        coach_notes: 'Day 0 baseline. No boxing experience. ~1 year gym background. Previous badminton during school.',
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      };
      await db.assessments.put(baseline);
    }

    // 3. Nutrition Foods (Soya-free Halal Indian)
    const existingFoods = await db.nutrition_foods.count();
    if (existingFoods === 0) {
      const foods: NutritionFood[] = [
        { id: 'food_1', user_id: userId, name: 'Eggs', calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_2', user_id: userId, name: 'Chicken Breast', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_3', user_id: userId, name: 'Dal (Moong)', calories_per_100g: 105, protein_per_100g: 7.5, carbs_per_100g: 18, fat_per_100g: 0.4, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_4', user_id: userId, name: 'Dal (Masoor)', calories_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_5', user_id: userId, name: 'Chana (Chickpeas)', calories_per_100g: 164, protein_per_100g: 8.9, carbs_per_100g: 27, fat_per_100g: 2.6, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_6', user_id: userId, name: 'Rajma (Kidney Beans)', calories_per_100g: 127, protein_per_100g: 8.7, carbs_per_100g: 22, fat_per_100g: 0.5, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_7', user_id: userId, name: 'Milk (Full Fat)', calories_per_100g: 62, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_8', user_id: userId, name: 'Curd / Dahi', calories_per_100g: 60, protein_per_100g: 3.5, carbs_per_100g: 4.7, fat_per_100g: 3.3, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_9', user_id: userId, name: 'Paneer', calories_per_100g: 265, protein_per_100g: 18, carbs_per_100g: 1.2, fat_per_100g: 20, is_halal: true, is_low_cost: false, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_10', user_id: userId, name: 'Peanuts', calories_per_100g: 567, protein_per_100g: 26, carbs_per_100g: 16, fat_per_100g: 49, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_11', user_id: userId, name: 'Rice (Cooked)', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_12', user_id: userId, name: 'Roti / Chapati', calories_per_100g: 120, protein_per_100g: 3.5, carbs_per_100g: 20, fat_per_100g: 3.5, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_13', user_id: userId, name: 'Oats', calories_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 7, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_14', user_id: userId, name: 'Potato', calories_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_15', user_id: userId, name: 'Banana', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'food_16', user_id: userId, name: 'Seasonal Vegetables', calories_per_100g: 35, protein_per_100g: 2, carbs_per_100g: 7, fat_per_100g: 0.2, is_halal: true, is_low_cost: true, is_default: true, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
      ];
      await db.nutrition_foods.bulkPut(foods);
    }

    // 4. Nutrition Target
    const existingTargets = await db.nutrition_targets.count();
    if (existingTargets === 0) {
      const target: NutritionTarget = {
        id: 'target_default',
        user_id: userId,
        calories_target: 2000,
        protein_target: 150,
        label: 'Starting target — adjustable based on progress, hunger, training load and future assessment.',
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      };
      await db.nutrition_targets.put(target);
    }

    // 5. Timer Preset
    const existingTimer = await db.timer_presets.count();
    if (existingTimer === 0) {
      const timer: TimerPreset = {
        id: 'timer_default',
        user_id: userId,
        name: 'Standard Boxing',
        work_seconds: 180,
        rest_seconds: 60,
        warning_seconds: 10,
        total_rounds: 3,
        is_default: true,
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      };
      await db.timer_presets.put(timer);
    }

    // 6. Phase Progress
    const existingPhases = await db.phase_progress.count();
    if (existingPhases === 0) {
      const phases: PhaseProgress[] = [
        { id: 'phase_1', user_id: userId, phase_number: 1, phase_name: 'Beginner Fitness', status: 'active', criteria: { '20_pushups': false, '30_squats': false, '8_pullups': false, '2m_plank': false, '3m_rope': false, '20m_jog': false, 'sub_25_bf': false, 'know_punches': false, '10_shadowboxing': false, '5_runfix': false }, unlocked_at: now, completed_at: null, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'phase_2', user_id: userId, phase_number: 2, phase_name: 'Recreational Boxer', status: 'locked', criteria: { '30_pushups': false, '10_pullups': false, '5k_run': false, '5m_rope': false, '6r_shadowboxing': false, 'sub_20_bf': false, 'join_gym': false }, unlocked_at: null, completed_at: null, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'phase_3', user_id: userId, phase_number: 3, phase_name: 'Serious Training', status: 'locked', criteria: { '50_pushups': false, '10k_run': false, '10m_rope': false, '12r_shadowboxing': false, 'sub_15_bf': false, 'sparring': false }, unlocked_at: null, completed_at: null, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'phase_4', user_id: userId, phase_number: 4, phase_name: 'Long-Term — "D" Goal', status: 'locked', criteria: { 'define_d_goal': false }, unlocked_at: null, completed_at: null, created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
      ];
      await db.phase_progress.bulkPut(phases);
    }

    // 7. Seed LIFE//OS Skills (BODY, MIND, TECH)
    const existingSkills = await db.skills.count();
    if (existingSkills === 0) {
      const initialSkills: SkillNode[] = [
        // ── BODY ──
        { id: 'skill_box_stance', user_id: userId, domain: 'body', category: 'boxing', name: 'Orthodox Stance & Guard', state: 'training', knowledge_pct: 60, practical_pct: 40, experience_pct: 30, confidence: 'MEDIUM', parent_skill_id: null, notes: 'Keep 50/50 balance, hands up, chin tucked.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_box_jab', user_id: userId, domain: 'body', category: 'boxing', name: '1 — Straight Jab', state: 'training', knowledge_pct: 70, practical_pct: 50, experience_pct: 40, confidence: 'MEDIUM', parent_skill_id: 'skill_box_stance', notes: 'Extend lead hand, rotate fist, snap back.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_box_cross', user_id: userId, domain: 'body', category: 'boxing', name: '2 — Rear Cross', state: 'training', knowledge_pct: 65, practical_pct: 45, experience_pct: 35, confidence: 'MEDIUM', parent_skill_id: 'skill_box_stance', notes: 'Rotate hips and pivot rear foot.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_cal_pushup', user_id: userId, domain: 'body', category: 'calisthenics', name: 'Strict Push-up (15 reps)', state: 'practicing', knowledge_pct: 85, practical_pct: 75, experience_pct: 80, confidence: 'HIGH', parent_skill_id: null, notes: 'Baseline: 15 reps achieved.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_cal_pullup', user_id: userId, domain: 'body', category: 'calisthenics', name: 'Strict Pull-up (5 reps)', state: 'practicing', knowledge_pct: 75, practical_pct: 60, experience_pct: 65, confidence: 'MEDIUM', parent_skill_id: null, notes: 'Baseline: 5 reps achieved. Target: 8 reps.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_run_walk', user_id: userId, domain: 'body', category: 'running', name: 'Brisk Walk (10 min)', state: 'proficient', knowledge_pct: 90, practical_pct: 85, experience_pct: 90, confidence: 'HIGH', parent_skill_id: null, notes: 'Comfortable 10 min walking.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },

        // ── MIND ──
        { id: 'skill_mind_focus', user_id: userId, domain: 'mind', category: 'focus', name: 'Deep Work (25 min block)', state: 'training', knowledge_pct: 70, practical_pct: 60, experience_pct: 50, confidence: 'MEDIUM', parent_skill_id: null, notes: 'Pomodoro focus blocks.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_mind_study', user_id: userId, domain: 'mind', category: 'study', name: 'Active Recall & Spaced Repetition', state: 'discovered', knowledge_pct: 50, practical_pct: 30, experience_pct: 20, confidence: 'LOW', parent_skill_id: null, notes: 'Study technique framework.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },

        // ── TECH ──
        { id: 'skill_tech_linux_cli', user_id: userId, domain: 'tech', category: 'linux', name: 'Linux CLI & Navigation', state: 'proficient', knowledge_pct: 85, practical_pct: 80, experience_pct: 75, confidence: 'HIGH', parent_skill_id: null, notes: 'File navigation, permissions, grep, system management.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_tech_networking', user_id: userId, domain: 'tech', category: 'networking', name: 'TCP/IP & OSI Fundamentals', state: 'practicing', knowledge_pct: 80, practical_pct: 70, experience_pct: 65, confidence: 'HIGH', parent_skill_id: null, notes: 'Handshakes, headers, DNS, packet flow.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_tech_wireshark', user_id: userId, domain: 'tech', category: 'networking', name: 'Wireshark Packet Analysis', state: 'training', knowledge_pct: 65, practical_pct: 50, experience_pct: 45, confidence: 'MEDIUM', parent_skill_id: 'skill_tech_networking', notes: 'Packet capture filtering & protocol inspection.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'skill_tech_web_sec', user_id: userId, domain: 'tech', category: 'cybersecurity', name: 'Web Application Security', state: 'training', knowledge_pct: 75, practical_pct: 60, experience_pct: 50, confidence: 'MEDIUM', parent_skill_id: null, notes: 'OWASP Top 10, XSS, SQLi, Burp Suite basics.', created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
      ];
      await db.skills.bulkPut(initialSkills);
    }

    // 8. Seed Daily Quests
    const existingQuests = await db.quests.count();
    if (existingQuests === 0) {
      const initialQuests: Quest[] = [
        { id: 'quest_1', user_id: userId, title: 'Complete 3 Shadowboxing Rounds (3 min each)', domain: 'body', xp_reward: 75, is_completed: false, completed_at: null, target_skill_ids: ['skill_box_stance', 'skill_box_jab'], created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'quest_2', user_id: userId, title: '3 Sets of Max Strict Pull-ups & Dead Hangs', domain: 'body', xp_reward: 50, is_completed: false, completed_at: null, target_skill_ids: ['skill_cal_pullup'], created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'quest_3', user_id: userId, title: 'Log 1 Run-Fix Attempt (Walk or Jog)', domain: 'body', xp_reward: 50, is_completed: false, completed_at: null, target_skill_ids: ['skill_run_walk'], created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
        { id: 'quest_4', user_id: userId, title: 'Wireshark Packet Analysis Drill (30 mins)', domain: 'tech', xp_reward: 100, is_completed: false, completed_at: null, target_skill_ids: ['skill_tech_wireshark', 'skill_tech_networking'], created_at: now, updated_at: now, device_id: deviceId, deleted_at: null, sync_version: 1 },
      ];
      await db.quests.bulkPut(initialQuests);
    }
  } catch (err) {
    console.warn('Seed database warning (ignored to prevent startup crash):', err);
  }
};
