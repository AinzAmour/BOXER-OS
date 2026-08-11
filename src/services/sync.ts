import { db } from '../db/dexie';
import { supabase } from './supabase';
import type { SyncStatus } from '../types';

export class SyncManager {
  private isSyncing = false;
  private statusListeners: Array<(status: SyncStatus) => void> = [];
  private currentStatus: SyncStatus = navigator.onLine ? 'online' : 'offline';

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setStatus('online');
        this.flushQueue();
      });
      window.addEventListener('offline', () => {
        this.setStatus('offline');
      });
    }
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public onStatusChange(listener: (status: SyncStatus) => void) {
    this.statusListeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.statusListeners.forEach((l) => l(status));
  }

  // Queue a change for offline-first push
  public async queueChange(
    tableName: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    recordId: string,
    payload: Record<string, unknown>
  ) {
    await db.sync_queue.add({
      table_name: tableName,
      operation,
      record_id: recordId,
      payload,
      created_at: new Date().toISOString(),
    });

    if (navigator.onLine) {
      this.flushQueue();
    }
  }

  // Flush offline queue to Supabase
  public async flushQueue() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;
    this.setStatus('syncing');

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        this.setStatus(navigator.onLine ? 'online' : 'offline');
        this.isSyncing = false;
        return;
      }

      const queue = await db.sync_queue.orderBy('id').toArray();
      if (queue.length === 0) {
        this.setStatus('synced');
        this.isSyncing = false;
        return;
      }

      for (const item of queue) {
        const { table_name, operation, payload, id } = item;

        if (operation === 'INSERT' || operation === 'UPDATE') {
          const { error } = await supabase
            .from(table_name)
            .upsert(payload, { onConflict: 'id' });
          if (!error && id) {
            await db.sync_queue.delete(id);
          }
        } else if (operation === 'DELETE') {
          const { error } = await supabase
            .from(table_name)
            .delete()
            .eq('id', item.record_id);
          if (!error && id) {
            await db.sync_queue.delete(id);
          }
        }
      }

      this.setStatus('synced');
    } catch (err) {
      console.error('Sync flush error:', err);
      this.setStatus(navigator.onLine ? 'online' : 'offline');
    } finally {
      this.isSyncing = false;
    }
  }

  // Export full JSON backup
  public async exportJSON(): Promise<string> {
    const backup = {
      app: 'LIFE//OS',
      version: '2.0.0',
      exported_at: new Date().toISOString(),
      data: {
        profiles: await db.profiles.toArray(),
        assessments: await db.assessments.toArray(),
        running_attempts: await db.running_attempts.toArray(),
        boxing_sessions: await db.boxing_sessions.toArray(),
        boxing_skills: await db.boxing_skills.toArray(),
        timer_presets: await db.timer_presets.toArray(),
        nutrition_foods: await db.nutrition_foods.toArray(),
        nutrition_logs: await db.nutrition_logs.toArray(),
        nutrition_targets: await db.nutrition_targets.toArray(),
        phase_progress: await db.phase_progress.toArray(),
        skills: await db.skills.toArray(),
        skill_prerequisites: await db.skill_prerequisites.toArray(),
        knowledge_assessments: await db.knowledge_assessments.toArray(),
        quests: await db.quests.toArray(),
        ai_sessions: await db.ai_sessions.toArray(),
        ai_actions: await db.ai_actions.toArray(),
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  // Import JSON backup
  public async importJSON(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if ((parsed.app !== 'LIFE//OS' && parsed.app !== 'BOXER//OS') || !parsed.data) {
        throw new Error('Invalid LIFE//OS backup file');
      }

      const { data } = parsed;
      await db.transaction('rw', [
        db.profiles,
        db.assessments,
        db.running_attempts,
        db.boxing_sessions,
        db.boxing_skills,
        db.timer_presets,
        db.nutrition_foods,
        db.nutrition_logs,
        db.nutrition_targets,
        db.phase_progress,
        db.skills,
        db.skill_prerequisites,
        db.knowledge_assessments,
        db.quests,
        db.ai_sessions,
        db.ai_actions,
      ], async () => {
        if (data.profiles) await db.profiles.bulkPut(data.profiles);
        if (data.assessments) await db.assessments.bulkPut(data.assessments);
        if (data.running_attempts) await db.running_attempts.bulkPut(data.running_attempts);
        if (data.boxing_sessions) await db.boxing_sessions.bulkPut(data.boxing_sessions);
        if (data.boxing_skills) await db.boxing_skills.bulkPut(data.boxing_skills);
        if (data.timer_presets) await db.timer_presets.bulkPut(data.timer_presets);
        if (data.nutrition_foods) await db.nutrition_foods.bulkPut(data.nutrition_foods);
        if (data.nutrition_logs) await db.nutrition_logs.bulkPut(data.nutrition_logs);
        if (data.nutrition_targets) await db.nutrition_targets.bulkPut(data.nutrition_targets);
        if (data.phase_progress) await db.phase_progress.bulkPut(data.phase_progress);
        if (data.skills) await db.skills.bulkPut(data.skills);
        if (data.skill_prerequisites) await db.skill_prerequisites.bulkPut(data.skill_prerequisites);
        if (data.knowledge_assessments) await db.knowledge_assessments.bulkPut(data.knowledge_assessments);
        if (data.quests) await db.quests.bulkPut(data.quests);
        if (data.ai_sessions) await db.ai_sessions.bulkPut(data.ai_sessions);
        if (data.ai_actions) await db.ai_actions.bulkPut(data.ai_actions);
      });

      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }
}

export const syncManager = new SyncManager();
