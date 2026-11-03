import { UserProgressMap } from '../types/user';
import { datasetService } from './datasetService';
import { storageService } from './storage';

export interface BackupPayload {
  version: string;
  exported_at: string;
  user_id?: string;
  total_records: number;
  progress: UserProgressMap;
}

export class BackupService {
  /**
   * Export progress as a downloadable JSON file
   */
  exportProgress(progressMap: UserProgressMap, userId: string = 'local'): void {
    const payload: BackupPayload = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      user_id: userId,
      total_records: Object.keys(progressMap).length,
      progress: progressMap,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `striver-a2z-progress-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validate and parse an imported JSON backup file
   */
  async validateAndParseBackup(
    file: File
  ): Promise<{ isValid: boolean; error?: string; payload?: BackupPayload; validCount: number; invalidCount: number }> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Invalid JSON file structure', validCount: 0, invalidCount: 0 };
      }

      // Progress map could be inside data.progress or directly as data
      const progress: UserProgressMap = data.progress || data;
      if (!progress || typeof progress !== 'object') {
        return { isValid: false, error: 'No progress records found in file', validCount: 0, invalidCount: 0 };
      }

      const allProblems = datasetService.getProblems();
      const validProblemIds = new Set(allProblems.map((p) => p.problem_id));

      let validCount = 0;
      let invalidCount = 0;
      const sanitizedProgress: UserProgressMap = {};

      for (const [probId, item] of Object.entries(progress)) {
        if (validProblemIds.has(probId)) {
          sanitizedProgress[probId] = {
            problem_id: probId,
            status: item.status === 'solved' || item.status === 'attempting' ? item.status : 'unsolved',
            is_bookmarked: Boolean(item.is_bookmarked),
            personal_notes: typeof item.personal_notes === 'string' ? item.personal_notes : '',
            solved_at: item.solved_at || null,
            updated_at: item.updated_at || new Date().toISOString(),
          };
          validCount++;
        } else {
          invalidCount++;
        }
      }

      if (validCount === 0) {
        return {
          isValid: false,
          error: 'None of the problem IDs in this file matched the Striver A2Z dataset',
          validCount: 0,
          invalidCount,
        };
      }

      const payload: BackupPayload = {
        version: data.version || '1.0',
        exported_at: data.exported_at || new Date().toISOString(),
        total_records: validCount,
        progress: sanitizedProgress,
      };

      return { isValid: true, payload, validCount, invalidCount };
    } catch (err) {
      return { isValid: false, error: `JSON parsing error: ${(err as Error).message}`, validCount: 0, invalidCount: 0 };
    }
  }

  /**
   * Apply imported progress
   */
  async importProgress(
    userId: string,
    importedProgress: UserProgressMap,
    mode: 'merge' | 'replace',
    currentProgress: UserProgressMap
  ): Promise<UserProgressMap> {
    let finalMap: UserProgressMap;
    if (mode === 'replace') {
      finalMap = { ...importedProgress };
    } else {
      // Merge: imported records take precedence, existing records remain
      finalMap = { ...currentProgress, ...importedProgress };
    }

    await storageService.saveBatchProgress(userId, finalMap);
    return finalMap;
  }
}

export const backupService = new BackupService();
