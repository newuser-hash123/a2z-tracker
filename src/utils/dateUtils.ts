import { HeatmapDay, UserProgressMap } from '../types/user';
import { Problem } from '../types/dataset';

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a Date object to YYYY-MM-DD in the target timezone
 */
export function formatDateInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // en-CA gives YYYY-MM-DD
  } catch {
    // Fallback if timezone string is invalid
    return date.toISOString().split('T')[0];
  }
}

/**
 * Get today's date string YYYY-MM-DD in user timezone
 */
export function getTodayDateString(timezone: string = DEFAULT_TIMEZONE): string {
  return formatDateInTimezone(new Date(), timezone);
}

/**
 * Get date string for a given ISO timestamp in user timezone
 */
export function getDateStringFromISO(isoString: string, timezone: string = DEFAULT_TIMEZONE): string {
  return formatDateInTimezone(new Date(isoString), timezone);
}

/**
 * Calculate consecutive streaks from a set of active dates (YYYY-MM-DD)
 */
export function calculateStreaks(
  activeDates: Set<string>,
  timezone: string = DEFAULT_TIMEZONE
): { currentStreak: number; longestStreak: number } {
  if (activeDates.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = Array.from(activeDates).sort();
  const todayStr = getTodayDateString(timezone);

  // Calculate yesterday's date string
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = formatDateInTimezone(yesterday, timezone);

  let longest = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);

    if (!prevDate) {
      running = 1;
    } else {
      const diffMs = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        running += 1;
      } else if (diffDays > 1) {
        running = 1;
      }
    }

    if (running > longest) {
      longest = running;
    }
    prevDate = currentDate;
  }

  // Calculate current streak:
  // Consecutive active days ending today, or yesterday if today has no activity yet
  let current = 0;
  let checkDateStr = activeDates.has(todayStr) ? todayStr : (activeDates.has(yesterdayStr) ? yesterdayStr : null);

  if (checkDateStr) {
    let checkDate = new Date(checkDateStr);
    while (activeDates.has(formatDateInTimezone(checkDate, timezone))) {
      current++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(longest, current),
  };
}

/**
 * Generate full 365/366 day heatmap data for a given calendar year
 */
export function generateYearlyHeatmapData(
  year: number,
  progressMap: UserProgressMap,
  problemsById: Map<string, Problem>,
  timezone: string = DEFAULT_TIMEZONE
): {
  days: HeatmapDay[];
  weeks: (HeatmapDay | null)[][];
  totalSolvedInYear: number;
} {
  // Map of date string -> array of solved problem entries
  const dailySolvedMap = new Map<string, { problem_id: string; title: string; solved_at: string }[]>();

  for (const [probId, progress] of Object.entries(progressMap)) {
    if (progress.status === 'solved' && progress.solved_at) {
      const dateStr = getDateStringFromISO(progress.solved_at, timezone);
      if (dateStr.startsWith(year.toString())) {
        const problem = problemsById.get(probId);
        const list = dailySolvedMap.get(dateStr) || [];
        list.push({
          problem_id: probId,
          title: problem?.title || probId,
          solved_at: progress.solved_at,
        });
        dailySolvedMap.set(dateStr, list);
      }
    }
  }

  const days: HeatmapDay[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  let totalSolvedInYear = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDateInTimezone(d, timezone);
    const problems = dailySolvedMap.get(dateStr) || [];
    const count = problems.length;
    totalSolvedInYear += count;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count === 1) level = 1;
    else if (count >= 2 && count <= 3) level = 2;
    else if (count >= 4 && count <= 6) level = 3;
    else if (count >= 7) level = 4;

    days.push({
      date: dateStr,
      count,
      level,
      problems,
    });
  }

  // Group into weeks (starting from Sunday or Monday)
  // Each week is an array of 7 elements (0 = Sunday to 6 = Saturday)
  const weeks: (HeatmapDay | null)[][] = [];
  let currentWeek: (HeatmapDay | null)[] = [];

  // Pad first week before Jan 1st
  const firstDayOfWeek = startDate.getDay(); // 0 is Sunday
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return { days, weeks, totalSolvedInYear };
}

/**
 * Format date nicely for human display: "Monday, Nov 2, 2026"
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
