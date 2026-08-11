import { db } from './dexie';
import type {
  Profile,
  Assessment,
  NutritionFood,
  NutritionTarget,
  TimerPreset,
  PhaseProgress,
} from '../types';

const getDeviceId = (): string => {
  let devId = localStorage.getItem('boxer_os_device_id');
  if (!devId) {
    devId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dev_${Date.now()}`;
    localStorage.setItem('boxer_os_device_id', devId);
  }
  return devId;
};

export const seedInitialData = async (userId: string = 'local_user') => {
  const deviceId = getDeviceId();
  const now = new Date().toISOString();

  // Check if profile exists
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
      created_at: now,
      updated_at: now,
      device_id: deviceId,
      deleted_at: null,
      sync_version: 1,
    };
    await db.profiles.put(profile);
  }

  // Check if Baseline Entry #0 exists
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

  // Seed Foods (Soya-free, Halal Indian staples)
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

  // Seed Targets
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

  // Seed Timer Preset
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

  // Seed Phase Progress
  const existingPhases = await db.phase_progress.count();
  if (existingPhases === 0) {
    const phases: PhaseProgress[] = [
      {
        id: 'phase_1',
        user_id: userId,
        phase_number: 1,
        phase_name: 'Beginner Fitness',
        status: 'active',
        criteria: {
          '20_pushups': false,
          '30_squats': false,
          '8_pullups': false,
          '2m_plank': false,
          '3m_rope': false,
          '20m_jog': false,
          'sub_25_bf': false,
          'know_punches': false,
          '10_shadowboxing': false,
          '5_runfix': false,
        },
        unlocked_at: now,
        completed_at: null,
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      },
      {
        id: 'phase_2',
        user_id: userId,
        phase_number: 2,
        phase_name: 'Recreational Boxer',
        status: 'locked',
        criteria: {
          '30_pushups': false,
          '10_pullups': false,
          '5k_run': false,
          '5m_rope': false,
          '6r_shadowboxing': false,
          'sub_20_bf': false,
          'join_gym': false,
        },
        unlocked_at: null,
        completed_at: null,
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      },
      {
        id: 'phase_3',
        user_id: userId,
        phase_number: 3,
        phase_name: 'Serious Training',
        status: 'locked',
        criteria: {
          '50_pushups': false,
          '10k_run': false,
          '10m_rope': false,
          '12r_shadowboxing': false,
          'sub_15_bf': false,
          'sparring': false,
        },
        unlocked_at: null,
        completed_at: null,
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      },
      {
        id: 'phase_4',
        user_id: userId,
        phase_number: 4,
        phase_name: 'Long-Term — "D" Goal',
        status: 'locked',
        criteria: {
          'define_d_goal': false,
        },
        unlocked_at: null,
        completed_at: null,
        created_at: now,
        updated_at: now,
        device_id: deviceId,
        deleted_at: null,
        sync_version: 1,
      },
    ];
    await db.phase_progress.bulkPut(phases);
  }
};
