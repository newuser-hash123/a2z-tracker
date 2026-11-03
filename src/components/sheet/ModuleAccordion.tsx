import React, { useState } from 'react';
import { Module } from '../../types/dataset';
import { datasetService } from '../../services/datasetService';
import { useProgress } from '../../context/ProgressContext';
import { ProblemCard } from '../problems/ProblemCard';
import { ChevronDown, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModuleAccordionProps {
  module: Module;
  defaultOpen?: boolean;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({ module, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { progressMap } = useProgress();

  const subtopics = datasetService.getSubtopicsByModule(module.module_id);
  const stats = datasetService.getModuleStats(module.module_id, progressMap);

  const isCompleted = stats.total > 0 && stats.solved === stats.total;

  return (
    <div
      id={module.module_id}
      className={cn(
        'border rounded-xl transition-all duration-150 overflow-hidden',
        isCompleted
          ? 'bg-slate-900/60 border-emerald-900/40'
          : isOpen
          ? 'bg-slate-900/90 border-slate-700 shadow-md'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
      )}
    >
      {/* Module Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 text-left transition-colors hover:bg-slate-800/40 gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'p-1.5 rounded-lg border transition-colors shrink-0',
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : isOpen ? (
              <ChevronDown className="w-5 h-5 text-slate-200" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Step {module.module_number}
              </span>
              {isCompleted && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  Complete
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-100 truncate">
              {module.module_name}
            </h3>
          </div>
        </div>

        {/* Right Stats & Progress Bar */}
        <div className="flex items-center gap-4 shrink-0 sm:self-center pl-10 sm:pl-0">
          <div className="flex flex-col items-end gap-1 w-32 sm:w-40">
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-400 font-medium">
                {stats.solved}/{stats.total}
              </span>
              <span className="font-semibold text-emerald-400">{stats.percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {/* Accordion Content: Subtopics & Problems */}
      {isOpen && (
        <div className="border-t border-slate-800/80 p-4 space-y-6 bg-slate-950/40">
          {subtopics.map((subtopic) => {
            const subProblems = datasetService.getProblemsBySubtopic(subtopic.subtopic_id);
            if (subProblems.length === 0) return null;

            const subSolved = subProblems.filter(
              (p) => progressMap[p.problem_id]?.status === 'solved'
            ).length;

            return (
              <div key={subtopic.subtopic_id} className="space-y-3">
                {/* Subtopic Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-200">
                      {subtopic.subtopic_name}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {subSolved} / {subProblems.length} solved
                  </span>
                </div>

                {/* Problem Cards */}
                <div className="space-y-2">
                  {subProblems.map((problem) => (
                    <ProblemCard key={problem.problem_id} problem={problem} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
