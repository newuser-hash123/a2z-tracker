export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type StriverTier = 'basic' | 'core' | 'pro';
export type Platform = 'LeetCode' | 'GeeksforGeeks' | 'TakeUForward' | 'CodeStudio' | 'Other';
export type ProblemStatus = 'unsolved' | 'attempting' | 'solved';

export interface Module {
  module_id: string;
  module_number: number;
  module_name: string;
  slug: string;
  description: string;
  display_order: number;
}

export interface Subtopic {
  subtopic_id: string;
  module_id: string;
  subtopic_name: string;
  slug: string;
  display_order: number;
}

export interface Problem {
  problem_id: string;
  raw_id: number;
  module_id: string;
  subtopic_id: string;
  problem_number: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  striver_tier: StriverTier;
  platform: Platform;
  primary_url: string;
  alternate_urls: string[];
  source_url?: string;
  video_url?: string;
  duration?: string;
  tags: string[];
  display_order: number;
}

export interface DatasetMeta {
  title: string;
  total_modules: number;
  total_subtopics: number;
  total_problems: number;
  version: string;
  extracted_at: string;
  source: string;
}

export interface FullDataset {
  meta: DatasetMeta;
  modules: Module[];
  subtopics: Subtopic[];
  problems: Problem[];
}
