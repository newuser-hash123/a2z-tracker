import { ProblemStatus } from './dataset';

export interface UserProgressItem {
  problem_id: string;
  status: ProblemStatus;
  is_bookmarked: boolean;
  personal_notes: string;
  solved_at: string | null; // ISO 8601
  updated_at: string;       // ISO 8601
  attempts?: number;
}

export type UserProgressMap = Record<string, UserProgressItem>;

export interface UserStats {
  totalProblems: number;
  solvedProblems: number;
  attemptingProblems: number;
  remainingProblems: number;
  completionPercentage: number;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  averageSolvedPerActiveDay: number;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // GitHub intensity
  problems: {
    problem_id: string;
    title: string;
    solved_at: string;
  }[];
}

export interface ActivityEvent {
  id: string;
  problem_id: string;
  problem_title: string;
  platform: string;
  difficulty: string;
  type: 'solved' | 'attempting' | 'unsolved' | 'bookmarked' | 'unbookmarked' | 'note_added';
  timestamp: string; // ISO 8601
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  is_guest: boolean;
  timezone: string;
  created_at: string;
}
