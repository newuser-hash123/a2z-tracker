import { UserProgressItem, UserProgressMap, ActivityEvent } from '../types/user';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY_PREFIX = 'a2z_dsa_tracker_progress_';
const LOCAL_ACTIVITY_KEY_PREFIX = 'a2z_dsa_tracker_activity_';
const GUEST_USER_ID = 'guest_user';

export interface IStorageService {
  loadProgress(userId: string): Promise<UserProgressMap>;
  saveProgressItem(userId: string, item: UserProgressItem): Promise<void>;
  saveBatchProgress(userId: string, progressMap: UserProgressMap): Promise<void>;
  resetProgress(userId: string): Promise<void>;
  loadActivities(userId: string): Promise<ActivityEvent[]>;
  saveActivity(userId: string, event: ActivityEvent): Promise<void>;
  migrateLocalToRemote(userId: string): Promise<void>;
}

class LocalStorageProvider implements IStorageService {
  private getStorageKey(userId: string) {
    return `${LOCAL_STORAGE_KEY_PREFIX}${userId || GUEST_USER_ID}`;
  }

  private getActivityKey(userId: string) {
    return `${LOCAL_ACTIVITY_KEY_PREFIX}${userId || GUEST_USER_ID}`;
  }

  async loadProgress(userId: string): Promise<UserProgressMap> {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error('Failed to load local progress:', err);
      return {};
    }
  }

  async saveProgressItem(userId: string, item: UserProgressItem): Promise<void> {
    const current = await this.loadProgress(userId);
    current[item.problem_id] = item;
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(current));
  }

  async saveBatchProgress(userId: string, progressMap: UserProgressMap): Promise<void> {
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(progressMap));
  }

  async resetProgress(userId: string): Promise<void> {
    localStorage.removeItem(this.getStorageKey(userId));
    localStorage.removeItem(this.getActivityKey(userId));
  }

  async loadActivities(userId: string): Promise<ActivityEvent[]> {
    try {
      const data = localStorage.getItem(this.getActivityKey(userId));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveActivity(userId: string, event: ActivityEvent): Promise<void> {
    const current = await this.loadActivities(userId);
    // keep latest 100 activities
    const updated = [event, ...current.filter((e) => e.id !== event.id)].slice(0, 100);
    localStorage.setItem(this.getActivityKey(userId), JSON.stringify(updated));
  }

  async migrateLocalToRemote(): Promise<void> {
    // Local provider does nothing for remote migration
  }
}

class SupabaseStorageProvider implements IStorageService {
  private localFallback = new LocalStorageProvider();

  async loadProgress(userId: string): Promise<UserProgressMap> {
    if (!supabase || !userId) {
      return this.localFallback.loadProgress(userId);
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase load error, falling back to local:', error.message);
        return this.localFallback.loadProgress(userId);
      }

      const map: UserProgressMap = {};
      for (const row of data || []) {
        map[row.problem_id] = {
          problem_id: row.problem_id,
          status: row.status,
          is_bookmarked: row.is_bookmarked,
          personal_notes: row.personal_notes || '',
          solved_at: row.solved_at,
          updated_at: row.updated_at,
        };
      }
      return map;
    } catch (err) {
      console.error('Supabase query error:', err);
      return this.localFallback.loadProgress(userId);
    }
  }

  async saveProgressItem(userId: string, item: UserProgressItem): Promise<void> {
    // Save to local cache first for instant responsiveness
    await this.localFallback.saveProgressItem(userId, item);

    if (!supabase || !userId) return;

    try {
      await supabase.from('user_progress').upsert(
        {
          user_id: userId,
          problem_id: item.problem_id,
          status: item.status,
          is_bookmarked: item.is_bookmarked,
          personal_notes: item.personal_notes,
          solved_at: item.solved_at,
          updated_at: item.updated_at,
        },
        { onConflict: 'user_id,problem_id' }
      );
    } catch (err) {
      console.error('Supabase save error:', err);
    }
  }

  async saveBatchProgress(userId: string, progressMap: UserProgressMap): Promise<void> {
    await this.localFallback.saveBatchProgress(userId, progressMap);

    if (!supabase || !userId) return;

    const rows = Object.values(progressMap).map((item) => ({
      user_id: userId,
      problem_id: item.problem_id,
      status: item.status,
      is_bookmarked: item.is_bookmarked,
      personal_notes: item.personal_notes,
      solved_at: item.solved_at,
      updated_at: item.updated_at,
    }));

    if (rows.length === 0) return;

    try {
      await supabase
        .from('user_progress')
        .upsert(rows, { onConflict: 'user_id,problem_id' });
    } catch (err) {
      console.error('Supabase batch save error:', err);
    }
  }

  async resetProgress(userId: string): Promise<void> {
    await this.localFallback.resetProgress(userId);

    if (!supabase || !userId) return;

    try {
      await supabase.from('user_progress').delete().eq('user_id', userId);
    } catch (err) {
      console.error('Supabase reset error:', err);
    }
  }

  async loadActivities(userId: string): Promise<ActivityEvent[]> {
    return this.localFallback.loadActivities(userId);
  }

  async saveActivity(userId: string, event: ActivityEvent): Promise<void> {
    return this.localFallback.saveActivity(userId, event);
  }

  async migrateLocalToRemote(userId: string): Promise<void> {
    if (!supabase || !userId) return;
    const guestProgress = await this.localFallback.loadProgress(GUEST_USER_ID);
    if (Object.keys(guestProgress).length === 0) return;

    const remoteCurrent = await this.loadProgress(userId);
    const merged: UserProgressMap = { ...guestProgress, ...remoteCurrent };

    await this.saveBatchProgress(userId, merged);
  }
}

export const storageService: IStorageService = isSupabaseConfigured
  ? new SupabaseStorageProvider()
  : new LocalStorageProvider();
