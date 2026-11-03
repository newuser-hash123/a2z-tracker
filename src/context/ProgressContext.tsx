import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ActivityEvent, UserProgressItem, UserProgressMap, UserStats } from '../types/user';
import { ProblemStatus } from '../types/dataset';
import { useAuth } from './AuthContext';
import { storageService } from '../services/storage';
import { datasetService } from '../services/datasetService';
import { calculateStreaks, getDateStringFromISO } from '../utils/dateUtils';
import { backupService } from '../services/backupService';

interface ProgressContextType {
  progressMap: UserProgressMap;
  loading: boolean;
  stats: UserStats;
  activities: ActivityEvent[];
  updateStatus: (problemId: string, status: ProblemStatus) => Promise<void>;
  toggleBookmark: (problemId: string) => Promise<void>;
  saveNotes: (problemId: string, notes: string) => Promise<void>;
  resetAllProgress: () => Promise<void>;
  importProgress: (imported: UserProgressMap, mode: 'merge' | 'replace') => Promise<void>;
  exportProgress: () => void;
  getProgressItem: (problemId: string) => UserProgressItem | undefined;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<UserProgressMap>({});
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const userId = user?.id || 'guest_user';
  const timezone = user?.timezone || 'Asia/Kolkata';

  // Load progress when user changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [loadedProgress, loadedActivities] = await Promise.all([
          storageService.loadProgress(userId),
          storageService.loadActivities(userId),
        ]);
        if (isMounted) {
          setProgressMap(loadedProgress);
          setActivities(loadedActivities);
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Compute stats dynamically from progressMap and user timezone
  const stats: UserStats = useMemo(() => {
    const allProblems = datasetService.getProblems();
    const totalProblems = allProblems.length;

    let solvedCount = 0;
    let attemptingCount = 0;
    const activeDatesSet = new Set<string>();

    for (const [_, item] of Object.entries(progressMap)) {
      if (item.status === 'solved') {
        solvedCount++;
        if (item.solved_at) {
          const dateStr = getDateStringFromISO(item.solved_at, timezone);
          activeDatesSet.add(dateStr);
        }
      } else if (item.status === 'attempting') {
        attemptingCount++;
      }
    }

    const remaining = totalProblems - solvedCount;
    const completionPercentage = totalProblems > 0 ? Number(((solvedCount / totalProblems) * 100).toFixed(1)) : 0;
    const { currentStreak, longestStreak } = calculateStreaks(activeDatesSet, timezone);

    const totalActiveDays = activeDatesSet.size;
    const averageSolvedPerActiveDay =
      totalActiveDays > 0 ? Number((solvedCount / totalActiveDays).toFixed(1)) : 0;

    return {
      totalProblems,
      solvedProblems: solvedCount,
      attemptingProblems: attemptingCount,
      remainingProblems: remaining,
      completionPercentage,
      currentStreak,
      longestStreak,
      totalActiveDays,
      averageSolvedPerActiveDay,
    };
  }, [progressMap, timezone]);

  const fireCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
      });
    } catch {
      // Ignore if confetti fails
    }
  }, []);

  const updateStatus = useCallback(
    async (problemId: string, status: ProblemStatus) => {
      const problem = datasetService.getProblemById(problemId);
      const existing = progressMap[problemId] || {
        problem_id: problemId,
        status: 'unsolved',
        is_bookmarked: false,
        personal_notes: '',
        solved_at: null,
        updated_at: new Date().toISOString(),
      };

      const nowIso = new Date().toISOString();
      const updatedItem: UserProgressItem = {
        ...existing,
        status,
        solved_at: status === 'solved' ? (existing.solved_at || nowIso) : null,
        updated_at: nowIso,
      };

      // Optimistic state update
      setProgressMap((prev) => ({
        ...prev,
        [problemId]: updatedItem,
      }));

      if (status === 'solved' && existing.status !== 'solved') {
        fireCelebration();
      }

      // Record activity event
      if (problem) {
        const activityEvent: ActivityEvent = {
          id: `act_${Date.now()}_${problemId}`,
          problem_id: problemId,
          problem_title: problem.title,
          platform: problem.platform,
          difficulty: problem.difficulty,
          type: status as 'solved' | 'attempting' | 'unsolved',
          timestamp: nowIso,
        };
        setActivities((prev) => [activityEvent, ...prev].slice(0, 100));
        await storageService.saveActivity(userId, activityEvent);
      }

      await storageService.saveProgressItem(userId, updatedItem);
    },
    [progressMap, userId, fireCelebration]
  );

  const toggleBookmark = useCallback(
    async (problemId: string) => {
      const problem = datasetService.getProblemById(problemId);
      const existing = progressMap[problemId] || {
        problem_id: problemId,
        status: 'unsolved',
        is_bookmarked: false,
        personal_notes: '',
        solved_at: null,
        updated_at: new Date().toISOString(),
      };

      const newBookmarkState = !existing.is_bookmarked;
      const nowIso = new Date().toISOString();
      const updatedItem: UserProgressItem = {
        ...existing,
        is_bookmarked: newBookmarkState,
        updated_at: nowIso,
      };

      setProgressMap((prev) => ({
        ...prev,
        [problemId]: updatedItem,
      }));

      if (problem) {
        const activityEvent: ActivityEvent = {
          id: `act_${Date.now()}_${problemId}`,
          problem_id: problemId,
          problem_title: problem.title,
          platform: problem.platform,
          difficulty: problem.difficulty,
          type: newBookmarkState ? 'bookmarked' : 'unbookmarked',
          timestamp: nowIso,
        };
        setActivities((prev) => [activityEvent, ...prev].slice(0, 100));
        await storageService.saveActivity(userId, activityEvent);
      }

      await storageService.saveProgressItem(userId, updatedItem);
    },
    [progressMap, userId]
  );

  const saveNotes = useCallback(
    async (problemId: string, notes: string) => {
      const problem = datasetService.getProblemById(problemId);
      const existing = progressMap[problemId] || {
        problem_id: problemId,
        status: 'unsolved',
        is_bookmarked: false,
        personal_notes: '',
        solved_at: null,
        updated_at: new Date().toISOString(),
      };

      const nowIso = new Date().toISOString();
      const updatedItem: UserProgressItem = {
        ...existing,
        personal_notes: notes,
        updated_at: nowIso,
      };

      setProgressMap((prev) => ({
        ...prev,
        [problemId]: updatedItem,
      }));

      if (problem && notes.trim() !== '') {
        const activityEvent: ActivityEvent = {
          id: `act_${Date.now()}_${problemId}`,
          problem_id: problemId,
          problem_title: problem.title,
          platform: problem.platform,
          difficulty: problem.difficulty,
          type: 'note_added',
          timestamp: nowIso,
        };
        setActivities((prev) => [activityEvent, ...prev].slice(0, 100));
        await storageService.saveActivity(userId, activityEvent);
      }

      await storageService.saveProgressItem(userId, updatedItem);
    },
    [progressMap, userId]
  );

  const resetAllProgress = useCallback(async () => {
    setProgressMap({});
    setActivities([]);
    await storageService.resetProgress(userId);
  }, [userId]);

  const importProgress = useCallback(
    async (imported: UserProgressMap, mode: 'merge' | 'replace') => {
      const updated = await backupService.importProgress(userId, imported, mode, progressMap);
      setProgressMap(updated);
    },
    [userId, progressMap]
  );

  const exportProgress = useCallback(() => {
    backupService.exportProgress(progressMap, userId);
  }, [progressMap, userId]);

  const getProgressItem = useCallback(
    (problemId: string) => progressMap[problemId],
    [progressMap]
  );

  return (
    <ProgressContext.Provider
      value={{
        progressMap,
        loading,
        stats,
        activities,
        updateStatus,
        toggleBookmark,
        saveNotes,
        resetAllProgress,
        importProgress,
        exportProgress,
        getProgressItem,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
