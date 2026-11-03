import { describe, it, expect } from 'vitest';
import { datasetService } from '../services/datasetService';
import { calculateStreaks, generateYearlyHeatmapData, formatDateInTimezone } from '../utils/dateUtils';
import { backupService } from '../services/backupService';
import { UserProgressMap } from '../types/user';

describe('1. Dataset Integrity Tests', () => {
  const problems = datasetService.getProblems();
  const modules = datasetService.getModules();
  const subtopics = datasetService.getSubtopics();

  it('contains the complete Striver A2Z sheet with all 20 modules', () => {
    expect(modules.length).toBe(20);
    expect(modules[0].module_name).toBe('Beginner Problems');
    expect(modules[modules.length - 1].module_name).toBe('Maths');
  });

  it('contains all 84 hierarchical subtopics', () => {
    expect(subtopics.length).toBe(84);
  });

  it('contains exactly 453 verified practice problems', () => {
    expect(problems.length).toBe(453);
  });

  it('has zero duplicate problem IDs', () => {
    const ids = problems.map((p) => p.problem_id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(problems.length);
  });

  it('ensures every problem has valid titles, difficulties, platforms, and URLs', () => {
    for (const p of problems) {
      expect(p.title).toBeTruthy();
      expect(['Easy', 'Medium', 'Hard']).toContain(p.difficulty);
      expect(['basic', 'core', 'pro']).toContain(p.striver_tier);
      expect(['LeetCode', 'GeeksforGeeks', 'TakeUForward', 'CodeStudio', 'Other']).toContain(p.platform);
      expect(p.primary_url).toMatch(/^https?:\/\//);
      expect(p.module_id).toBeTruthy();
      expect(p.subtopic_id).toBeTruthy();
      expect(datasetService.getModuleById(p.module_id)).toBeDefined();
      expect(datasetService.getSubtopicById(p.subtopic_id)).toBeDefined();
    }
  });

  it('ensures practice links correspond to verified platforms', () => {
    const leetcodeProbs = problems.filter((p) => p.platform === 'LeetCode');
    const gfgProbs = problems.filter((p) => p.platform === 'GeeksforGeeks');
    const tufProbs = problems.filter((p) => p.platform === 'TakeUForward');

    expect(leetcodeProbs.length).toBe(292);
    expect(gfgProbs.length).toBe(128);
    expect(tufProbs.length).toBe(33);

    for (const p of leetcodeProbs) {
      expect(p.primary_url).toContain('leetcode.com');
    }
    for (const p of gfgProbs) {
      expect(p.primary_url).toContain('geeksforgeeks.org');
    }
    for (const p of tufProbs) {
      expect(p.primary_url).toContain('takeuforward.org');
    }
  });
});

describe('2. Streak Calculation Edge Cases', () => {
  const tz = 'Asia/Kolkata';

  it('calculates zero streak when no problems are solved', () => {
    const streaks = calculateStreaks(new Set(), tz);
    expect(streaks.currentStreak).toBe(0);
    expect(streaks.longestStreak).toBe(0);
  });

  it('calculates 1-day current streak when a problem is solved today', () => {
    const today = formatDateInTimezone(new Date(), tz);
    const dates = new Set([today]);
    const streaks = calculateStreaks(dates, tz);
    expect(streaks.currentStreak).toBe(1);
    expect(streaks.longestStreak).toBe(1);
  });

  it('calculates 1-day current streak when solved yesterday and today has no activity yet', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yestStr = formatDateInTimezone(yesterday, tz);

    const dates = new Set([yestStr]);
    const streaks = calculateStreaks(dates, tz);
    expect(streaks.currentStreak).toBe(1);
  });

  it('calculates consecutive active days spanning days and months', () => {
    const dates = new Set([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
    const streaks = calculateStreaks(dates, tz);
    expect(streaks.longestStreak).toBe(4);
  });

  it('breaks streak when there is a missing activity day', () => {
    const dates = new Set([
      '2026-10-25',
      '2026-10-26',
      // 2026-10-27 missed
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
    ]);
    const streaks = calculateStreaks(dates, tz);
    expect(streaks.longestStreak).toBe(3);
  });
});

describe('3. Contribution Heatmap Generation', () => {
  const tz = 'Asia/Kolkata';
  const problemsById = new Map(datasetService.getProblems().map((p) => [p.problem_id, p]));

  it('generates full 365 days for year 2026', () => {
    const progressMap: UserProgressMap = {};
    const heatmap = generateYearlyHeatmapData(2026, progressMap, problemsById, tz);
    expect(heatmap.days.length).toBe(365);
    expect(heatmap.totalSolvedInYear).toBe(0);
  });

  it('maps solved problems to the correct calendar day and intensity', () => {
    const p1 = datasetService.getProblems()[0];
    const p2 = datasetService.getProblems()[1];
    const p3 = datasetService.getProblems()[2];

    const progressMap: UserProgressMap = {
      [p1.problem_id]: {
        problem_id: p1.problem_id,
        status: 'solved',
        is_bookmarked: false,
        personal_notes: '',
        solved_at: '2026-11-02T10:00:00Z',
        updated_at: '2026-11-02T10:00:00Z',
      },
      [p2.problem_id]: {
        problem_id: p2.problem_id,
        status: 'solved',
        is_bookmarked: false,
        personal_notes: '',
        solved_at: '2026-11-02T12:00:00Z',
        updated_at: '2026-11-02T12:00:00Z',
      },
      [p3.problem_id]: {
        problem_id: p3.problem_id,
        status: 'solved',
        is_bookmarked: false,
        personal_notes: '',
        solved_at: '2026-11-02T14:00:00Z',
        updated_at: '2026-11-02T14:00:00Z',
      },
    };

    const heatmap = generateYearlyHeatmapData(2026, progressMap, problemsById, tz);
    const nov2 = heatmap.days.find((d) => d.date === '2026-11-02');
    expect(nov2).toBeDefined();
    expect(nov2?.count).toBe(3);
    expect(nov2?.level).toBe(2); // level 2 for 2-3 problems
    expect(nov2?.problems.length).toBe(3);
    expect(heatmap.totalSolvedInYear).toBe(3);
  });

  it('updates heatmap dynamically when problem is marked unsolved', () => {
    const p1 = datasetService.getProblems()[0];
    // status changed from solved back to unsolved
    const progressMap: UserProgressMap = {
      [p1.problem_id]: {
        problem_id: p1.problem_id,
        status: 'unsolved',
        is_bookmarked: false,
        personal_notes: '',
        solved_at: null,
        updated_at: '2026-11-02T15:00:00Z',
      },
    };

    const heatmap = generateYearlyHeatmapData(2026, progressMap, problemsById, tz);
    const nov2 = heatmap.days.find((d) => d.date === '2026-11-02');
    expect(nov2?.count).toBe(0);
    expect(nov2?.level).toBe(0);
    expect(heatmap.totalSolvedInYear).toBe(0);
  });
});

describe('4. Search and Filter Engine Tests', () => {
  const progressMap: UserProgressMap = {
    'p-37': {
      problem_id: 'p-37', // Two Sum
      status: 'solved',
      is_bookmarked: true,
      personal_notes: 'Classic hash map approach',
      solved_at: '2026-11-01T10:00:00Z',
      updated_at: '2026-11-01T10:00:00Z',
    },
  };

  it('searches by exact problem title', () => {
    const results = datasetService.queryProblems({ search: 'Two Sum' }, 'order', progressMap);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((p) => p.title.toLowerCase().includes('two sum'))).toBe(true);
  });

  it('filters by difficulty', () => {
    const easyProblems = datasetService.queryProblems({ difficulty: 'Easy' }, 'order', progressMap);
    expect(easyProblems.length).toBe(114);
    for (const p of easyProblems) {
      expect(p.difficulty).toBe('Easy');
    }
  });

  it('filters by platform', () => {
    const leetcodeProblems = datasetService.queryProblems({ platform: 'LeetCode' }, 'order', progressMap);
    expect(leetcodeProblems.length).toBe(292);
    for (const p of leetcodeProblems) {
      expect(p.platform).toBe('LeetCode');
    }
  });

  it('filters by status', () => {
    const solved = datasetService.queryProblems({ status: 'solved' }, 'order', progressMap);
    expect(solved.length).toBe(1);
    expect(solved[0].problem_id).toBe('p-37');
  });

  it('filters by bookmarked', () => {
    const bookmarked = datasetService.queryProblems({ isBookmarked: true }, 'order', progressMap);
    expect(bookmarked.length).toBe(1);
    expect(bookmarked[0].problem_id).toBe('p-37');
  });
});

describe('5. Backup Validation Tests', () => {
  it('validates genuine problem IDs and rejects invalid IDs', async () => {
    const mockJson = JSON.stringify({
      version: '1.0',
      exported_at: '2026-11-02T10:00:00Z',
      progress: {
        'p-37': { problem_id: 'p-37', status: 'solved', is_bookmarked: true },
        'p-fake-999': { problem_id: 'p-fake-999', status: 'solved', is_bookmarked: false },
      },
    });

    const file = new File([mockJson], 'backup.json', { type: 'application/json' });
    const result = await backupService.validateAndParseBackup(file);
    expect(result.isValid).toBe(true);
    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(1);
    expect(result.payload?.progress['p-37']).toBeDefined();
    expect(result.payload?.progress['p-fake-999']).toBeUndefined();
  });
});
