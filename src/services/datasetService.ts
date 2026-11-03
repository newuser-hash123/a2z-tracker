import datasetJson from '../data/striver_dataset.json';
import { Difficulty, FullDataset, Module, Platform, Problem, ProblemStatus, StriverTier, Subtopic } from '../types/dataset';
import { UserProgressMap } from '../types/user';

class DatasetService {
  private dataset: FullDataset;
  private problemsById: Map<string, Problem>;
  private problemsByModule: Map<string, Problem[]>;
  private problemsBySubtopic: Map<string, Problem[]>;
  private modulesById: Map<string, Module>;
  private subtopicsById: Map<string, Subtopic>;

  constructor() {
    this.dataset = datasetJson as unknown as FullDataset;
    this.problemsById = new Map();
    this.problemsByModule = new Map();
    this.problemsBySubtopic = new Map();
    this.modulesById = new Map();
    this.subtopicsById = new Map();

    for (const mod of this.dataset.modules) {
      this.modulesById.set(mod.module_id, mod);
      this.problemsByModule.set(mod.module_id, []);
    }

    for (const sub of this.dataset.subtopics) {
      this.subtopicsById.set(sub.subtopic_id, sub);
      this.problemsBySubtopic.set(sub.subtopic_id, []);
    }

    for (const prob of this.dataset.problems) {
      this.problemsById.set(prob.problem_id, prob);

      const modProblems = this.problemsByModule.get(prob.module_id);
      if (modProblems) {
        modProblems.push(prob);
      }

      const subProblems = this.problemsBySubtopic.get(prob.subtopic_id);
      if (subProblems) {
        subProblems.push(prob);
      }
    }
  }

  getDataset(): FullDataset {
    return this.dataset;
  }

  getModules(): Module[] {
    return this.dataset.modules;
  }

  getSubtopics(): Subtopic[] {
    return this.dataset.subtopics;
  }

  getProblems(): Problem[] {
    return this.dataset.problems;
  }

  getProblemById(id: string): Problem | undefined {
    return this.problemsById.get(id);
  }

  getProblemsByModule(moduleId: string): Problem[] {
    return this.problemsByModule.get(moduleId) || [];
  }

  getSubtopicsByModule(moduleId: string): Subtopic[] {
    return this.dataset.subtopics.filter((s) => s.module_id === moduleId);
  }

  getProblemsBySubtopic(subtopicId: string): Problem[] {
    return this.problemsBySubtopic.get(subtopicId) || [];
  }

  getModuleById(moduleId: string): Module | undefined {
    return this.modulesById.get(moduleId);
  }

  getSubtopicById(subtopicId: string): Subtopic | undefined {
    return this.subtopicsById.get(subtopicId);
  }

  /**
   * Filter, search, and sort problems with high performance
   */
  queryProblems(
    filters: {
      search?: string;
      moduleId?: string;
      subtopicId?: string;
      difficulty?: Difficulty | 'All';
      platform?: Platform | 'All';
      tier?: StriverTier | 'All';
      status?: ProblemStatus | 'All';
      isBookmarked?: boolean;
    },
    sort: 'order' | 'name' | 'difficulty' | 'recently_solved' | 'unsolved_first',
    progressMap: UserProgressMap
  ): Problem[] {
    let result = [...this.dataset.problems];

    // Filter by module
    if (filters.moduleId && filters.moduleId !== 'All') {
      result = result.filter((p) => p.module_id === filters.moduleId);
    }

    // Filter by subtopic
    if (filters.subtopicId && filters.subtopicId !== 'All') {
      result = result.filter((p) => p.subtopic_id === filters.subtopicId);
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'All') {
      result = result.filter((p) => p.difficulty === filters.difficulty);
    }

    // Filter by platform
    if (filters.platform && filters.platform !== 'All') {
      result = result.filter((p) => p.platform === filters.platform);
    }

    // Filter by tier
    if (filters.tier && filters.tier !== 'All') {
      result = result.filter((p) => p.striver_tier === filters.tier);
    }

    // Filter by status
    if (filters.status && filters.status !== 'All') {
      result = result.filter((p) => {
        const prog = progressMap[p.problem_id];
        const currentStatus: ProblemStatus = prog?.status || 'unsolved';
        return currentStatus === filters.status;
      });
    }

    // Filter by bookmark
    if (filters.isBookmarked !== undefined) {
      result = result.filter((p) => {
        const prog = progressMap[p.problem_id];
        return !!prog?.is_bookmarked === filters.isBookmarked;
      });
    }

    // Search query
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      result = result.filter((p) => {
        const mod = this.modulesById.get(p.module_id)?.module_name.toLowerCase() || '';
        const sub = this.subtopicsById.get(p.subtopic_id)?.subtopic_name.toLowerCase() || '';
        return (
          p.title.toLowerCase().includes(q) ||
          p.problem_number.toString().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          mod.includes(q) ||
          sub.includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sort === 'name') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'difficulty') {
        const diffWeight: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };
        return diffWeight[a.difficulty] - diffWeight[b.difficulty];
      }
      if (sort === 'unsolved_first') {
        const aStatus = progressMap[a.problem_id]?.status || 'unsolved';
        const bStatus = progressMap[b.problem_id]?.status || 'unsolved';
        const weight: Record<ProblemStatus, number> = { unsolved: 0, attempting: 1, solved: 2 };
        if (weight[aStatus] !== weight[bStatus]) {
          return weight[aStatus] - weight[bStatus];
        }
        return a.display_order - b.display_order;
      }
      if (sort === 'recently_solved') {
        const aSolved = progressMap[a.problem_id]?.solved_at || '';
        const bSolved = progressMap[b.problem_id]?.solved_at || '';
        if (aSolved && bSolved) return bSolved.localeCompare(aSolved);
        if (aSolved) return -1;
        if (bSolved) return 1;
        return a.display_order - b.display_order;
      }
      // default: order in sheet
      return a.display_order - b.display_order;
    });

    return result;
  }

  /**
   * Calculate stats for each module
   */
  getModuleStats(moduleId: string, progressMap: UserProgressMap) {
    const problems = this.getProblemsByModule(moduleId);
    const total = problems.length;
    let solved = 0;
    let attempting = 0;

    for (const p of problems) {
      const status = progressMap[p.problem_id]?.status;
      if (status === 'solved') solved++;
      else if (status === 'attempting') attempting++;
    }

    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, attempting, remaining: total - solved, percentage };
  }
}

export const datasetService = new DatasetService();
