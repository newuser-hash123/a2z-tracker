import React, { useMemo } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { datasetService } from '../../services/datasetService';
import { Difficulty, Platform } from '../../types/dataset';
import {
  BarChart3,
  PieChart,
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AnalyticsOverview: React.FC = () => {
  const { progressMap, stats } = useProgress();
  const allProblems = datasetService.getProblems();
  const modules = datasetService.getModules();

  // Difficulty breakdown
  const difficultyStats = useMemo(() => {
    const counts: Record<Difficulty, { total: number; solved: number }> = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
    };

    for (const p of allProblems) {
      counts[p.difficulty].total++;
      if (progressMap[p.problem_id]?.status === 'solved') {
        counts[p.difficulty].solved++;
      }
    }

    return counts;
  }, [allProblems, progressMap]);

  // Platform breakdown
  const platformStats = useMemo(() => {
    const platforms: Record<string, { total: number; solved: number }> = {
      LeetCode: { total: 0, solved: 0 },
      GeeksforGeeks: { total: 0, solved: 0 },
      TakeUForward: { total: 0, solved: 0 },
    };

    for (const p of allProblems) {
      const plat = platforms[p.platform] || { total: 0, solved: 0 };
      plat.total++;
      if (progressMap[p.problem_id]?.status === 'solved') {
        plat.solved++;
      }
      platforms[p.platform] = plat;
    }

    return platforms;
  }, [allProblems, progressMap]);

  // Module-wise breakdown
  const moduleStatsList = useMemo(() => {
    return modules.map((m) => {
      const mStats = datasetService.getModuleStats(m.module_id, progressMap);
      return {
        module: m,
        ...mStats,
      };
    });
  }, [modules, progressMap]);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {stats.completionPercentage}%
          </div>
          <p className="text-xs text-slate-500">
            {stats.solvedProblems} / {stats.totalProblems} solved
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {stats.currentStreak} days
          </div>
          <p className="text-xs text-slate-500">
            Longest streak: {stats.longestStreak} days
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Active Days</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300">
            {stats.totalActiveDays}
          </div>
          <p className="text-xs text-slate-500">
            Days with at least 1 solved problem
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg / Active Day</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">
            {stats.averageSolvedPerActiveDay}
          </div>
          <p className="text-xs text-slate-500">
            Problems per productive day
          </p>
        </div>
      </div>

      {/* Row: Difficulty and Platform Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Difficulty Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-500">Problems Solved</span>
          </div>

          <div className="space-y-4">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-400">Easy</span>
                <span className="text-slate-400 font-mono">
                  {difficultyStats.Easy.solved} / {difficultyStats.Easy.total} (
                  {difficultyStats.Easy.total > 0
                    ? Math.round((difficultyStats.Easy.solved / difficultyStats.Easy.total) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      difficultyStats.Easy.total > 0
                        ? (difficultyStats.Easy.solved / difficultyStats.Easy.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-400">Medium</span>
                <span className="text-slate-400 font-mono">
                  {difficultyStats.Medium.solved} / {difficultyStats.Medium.total} (
                  {difficultyStats.Medium.total > 0
                    ? Math.round(
                        (difficultyStats.Medium.solved / difficultyStats.Medium.total) * 100
                      )
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      difficultyStats.Medium.total > 0
                        ? (difficultyStats.Medium.solved / difficultyStats.Medium.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-rose-400">Hard</span>
                <span className="text-slate-400 font-mono">
                  {difficultyStats.Hard.solved} / {difficultyStats.Hard.total} (
                  {difficultyStats.Hard.total > 0
                    ? Math.round((difficultyStats.Hard.solved / difficultyStats.Hard.total) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      difficultyStats.Hard.total > 0
                        ? (difficultyStats.Hard.solved / difficultyStats.Hard.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Platform Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-500">Practice Hubs</span>
          </div>

          <div className="space-y-4">
            {Object.entries(platformStats).map(([platformName, data]) => {
              const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
              const color =
                platformName === 'LeetCode'
                  ? 'bg-amber-500'
                  : platformName === 'GeeksforGeeks'
                  ? 'bg-emerald-500'
                  : 'bg-red-500';

              return (
                <div key={platformName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{platformName}</span>
                    <span className="text-slate-400 font-mono">
                      {data.solved} / {data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module-wise Progress Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Module-wise Progress (Identify Topic Gaps)
            </h3>
          </div>
          <span className="text-xs text-slate-400">All 20 Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleStatsList.map((item) => (
            <div
              key={item.module.module_id}
              className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                    Step {item.module.module_number}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[240px]">
                    {item.module.module_name}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {item.solved}/{item.total}
                  </span>
                  <span className="text-[11px] text-emerald-400 ml-1.5 font-semibold">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
