import { db } from './dexie';
import type { NutritionFood, TimerPreset } from '../types';

export const getDeviceId = (): string => {
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

/**
 * Seeds universal reference facts into IndexedDB.
 * Contains ZERO personal profile, skill, assessment, or quest data.
 * Personal data is generated strictly through Ciel AI onboarding.
 */
export const seedReferenceData = async (userId: string = 'global_reference') => {
  try {
    const deviceId = getDeviceId();
    const now = new Date().toISOString();

    // 1. Universal Nutrition Foods Reference Database
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

    // 2. Default Round Timer Preset
    const existingTimer = await db.timer_presets.count();
    if (existingTimer === 0) {
      const timer: TimerPreset = {
        id: 'timer_default',
        user_id: userId,
        name: 'Standard 3-Min Round',
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
  } catch (err) {
    console.warn('Seed reference database warning (ignored):', err);
  }
};
