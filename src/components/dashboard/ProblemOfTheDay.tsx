import React, { useState, useMemo } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { datasetService } from '../../services/datasetService';
import { Problem } from '../../types/dataset';
import { ProblemCard } from '../problems/ProblemCard';
import { Sparkles, Dices, Target } from 'lucide-react';
import { Button } from '../ui/Button';

export const ProblemOfTheDay: React.FC = () => {
  const { progressMap } = useProgress();
  const allProblems = datasetService.getProblems();

  // Pick deterministic Problem of the Day using today's date
  const potd = useMemo(() => {
    const today = new Date();
    // Simple hash of date string YYYY-MM-DD
    const dateInt = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Filter unsolved problems
    const unsolved = allProblems.filter((p) => {
      const status = progressMap[p.problem_id]?.status;
      return status !== 'solved';
    });

    if (unsolved.length === 0) return null;
    const index = dateInt % unsolved.length;
    return unsolved[index];
  }, [allProblems, progressMap]);

  // Random problem selector
  const [randomProblem, setRandomProblem] = useState<Problem | null>(null);

  const handlePickRandom = () => {
    const unsolved = allProblems.filter((p) => {
      const status = progressMap[p.problem_id]?.status;
      return status !== 'solved';
    });
    if (unsolved.length === 0) return;
    const randIdx = Math.floor(Math.random() * unsolved.length);
    setRandomProblem(unsolved[randIdx]);
  };

  const displayedProblem = randomProblem || potd;

  if (!displayedProblem) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            {randomProblem ? <Target className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{randomProblem ? 'Random Unsolved Challenge' : 'Problem of the Day'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                {randomProblem ? 'Random' : 'Daily'}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {randomProblem ? 'Fresh challenge picked from your remaining backlog' : 'Recommended practice for today'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {randomProblem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRandomProblem(null)}
              className="text-xs text-slate-400"
            >
              Reset to Daily
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePickRandom}
            className="text-xs"
          >
            <Dices className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Random Problem</span>
          </Button>
        </div>
      </div>

      <ProblemCard problem={displayedProblem} showModuleInfo={true} />
    </div>
  );
};
