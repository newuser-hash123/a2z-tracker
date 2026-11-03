import React, { useMemo } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { datasetService } from '../../services/datasetService';
import { ProblemCard } from '../problems/ProblemCard';
import { PlayCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface ContinueLearningProps {
  onNavigateToSheet?: (moduleId?: string) => void;
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({ onNavigateToSheet }) => {
  const { progressMap } = useProgress();
  const modules = datasetService.getModules();
  const problems = datasetService.getProblems();

  // Find the first module with remaining unsolved problems
  const currentStatus = useMemo(() => {
    for (const mod of modules) {
      const stats = datasetService.getModuleStats(mod.module_id, progressMap);
      if (stats.remaining > 0) {
        // Find next unsolved problem in this module
        const modProblems = datasetService.getProblemsByModule(mod.module_id);
        const nextProb = modProblems.find((p) => {
          const status = progressMap[p.problem_id]?.status;
          return status === 'attempting' || !status || status === 'unsolved';
        });

        return {
          module: mod,
          stats,
          nextProblem: nextProb || modProblems[0],
          isAllComplete: false,
        };
      }
    }

    // If all completed!
    return {
      module: modules[modules.length - 1],
      stats: datasetService.getModuleStats(modules[modules.length - 1].module_id, progressMap),
      nextProblem: null,
      isAllComplete: true,
    };
  }, [modules, progressMap]);

  if (currentStatus.isAllComplete) {
    return (
      <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-xl p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Congratulations! You finished the Sheet!</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          You have solved every problem across all 20 modules of the Striver A2Z DSA sheet. Time for mock interviews and contests!
        </p>
      </div>
    );
  }

  const { module, stats, nextProblem } = currentStatus;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Top row: Module header & progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Continue Learning
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Step {module.module_number}: {module.module_name}
            </h3>
          </div>
        </div>

        {onNavigateToSheet && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToSheet(module.module_id)}
            className="text-xs self-start sm:self-auto"
          >
            <span>View Full Module</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {stats.solved} of {stats.total} problems solved
          </span>
          <span className="font-semibold text-emerald-400">{stats.percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Next Up Problem Card */}
      {nextProblem && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Next Unsolved Problem:</span>
            <span className="text-[11px] text-slate-500">
              {nextProblem.tags.join(' • ')}
            </span>
          </div>
          <ProblemCard problem={nextProblem} />
        </div>
      )}
    </div>
  );
};
