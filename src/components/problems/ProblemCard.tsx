import React, { useState } from 'react';
import { Problem, ProblemStatus } from '../../types/dataset';
import { useProgress } from '../../context/ProgressContext';
import { DifficultyBadge, TierBadge } from '../ui/Badge';
import { ExternalLinkMenu } from './ExternalLinkMenu';
import { NotesModal } from './NotesModal';
import { Star, FileText, CheckCircle2, Clock, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProblemCardProps {
  problem: Problem;
  showModuleInfo?: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, showModuleInfo = false }) => {
  const { progressMap, updateStatus, toggleBookmark } = useProgress();
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const userProgress = progressMap[problem.problem_id];
  const currentStatus: ProblemStatus = userProgress?.status || 'unsolved';
  const isBookmarked = Boolean(userProgress?.is_bookmarked);
  const hasNotes = Boolean(userProgress?.personal_notes && userProgress.personal_notes.trim().length > 0);

  const handleStatusCycle = () => {
    // Quick click cycle: unsolved -> attempting -> solved -> unsolved
    if (currentStatus === 'unsolved') {
      updateStatus(problem.problem_id, 'attempting');
    } else if (currentStatus === 'attempting') {
      updateStatus(problem.problem_id, 'solved');
    } else {
      updateStatus(problem.problem_id, 'unsolved');
    }
  };

  return (
    <div
      className={cn(
        'group flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl border transition-all duration-150 gap-3',
        currentStatus === 'solved'
          ? 'bg-emerald-950/15 border-emerald-900/40 hover:border-emerald-700/60'
          : currentStatus === 'attempting'
          ? 'bg-blue-950/15 border-blue-900/40 hover:border-blue-700/60'
          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
      )}
    >
      {/* Left section: Status toggle, Number, Title, Badges */}
      <div className="flex items-start md:items-center gap-3 min-w-0">
        {/* Status Quick Button */}
        <button
          onClick={handleStatusCycle}
          title={`Status: ${currentStatus}. Click to change.`}
          className={cn(
            'p-1.5 rounded-lg border transition-all mt-0.5 md:mt-0 shrink-0',
            currentStatus === 'solved'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'
              : currentStatus === 'attempting'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
              : 'bg-slate-800/80 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
          )}
        >
          {currentStatus === 'solved' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : currentStatus === 'attempting' ? (
            <Clock className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>

        {/* Problem Number */}
        <span className="text-xs font-mono font-medium text-slate-500 w-8 shrink-0">
          #{problem.problem_number}
        </span>

        {/* Title and tags */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium transition-colors break-words',
                currentStatus === 'solved'
                  ? 'text-emerald-100 line-through/10'
                  : currentStatus === 'attempting'
                  ? 'text-blue-100'
                  : 'text-slate-200 group-hover:text-white'
              )}
            >
              {problem.title}
            </span>

            {/* Badges */}
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <DifficultyBadge difficulty={problem.difficulty} />
              <TierBadge tier={problem.striver_tier} />
            </div>
          </div>

          {showModuleInfo && (
            <div className="text-[11px] text-slate-500 mt-0.5">
              {problem.tags.join(' • ')}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Status Dropdown / Action buttons / External Practice Link */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center pl-10 md:pl-0">
        {/* Status Dropdown */}
        <select
          value={currentStatus}
          onChange={(e) => updateStatus(problem.problem_id, e.target.value as ProblemStatus)}
          className={cn(
            'text-xs font-medium rounded-lg px-2.5 py-1.5 border appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer transition-colors',
            currentStatus === 'solved'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
              : currentStatus === 'attempting'
              ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
              : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-slate-200'
          )}
        >
          <option value="unsolved" className="bg-slate-900 text-slate-300">
            ○ Not Started
          </option>
          <option value="attempting" className="bg-slate-900 text-blue-400">
            ◐ Attempting
          </option>
          <option value="solved" className="bg-slate-900 text-emerald-400">
            ● Solved
          </option>
        </select>

        {/* Bookmark Button */}
        <button
          onClick={() => toggleBookmark(problem.problem_id)}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark problem'}
          className={cn(
            'p-1.5 rounded-lg border transition-all',
            isBookmarked
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
              : 'bg-slate-800/60 text-slate-500 border-slate-700/70 hover:text-slate-300 hover:border-slate-600'
          )}
        >
          <Star className={cn('w-4 h-4', isBookmarked && 'fill-amber-400')} />
        </button>

        {/* Personal Notes Button */}
        <button
          onClick={() => setIsNotesOpen(true)}
          title={hasNotes ? 'View/edit personal notes' : 'Add personal notes'}
          className={cn(
            'relative p-1.5 rounded-lg border transition-all',
            hasNotes
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30'
              : 'bg-slate-800/60 text-slate-500 border-slate-700/70 hover:text-slate-300 hover:border-slate-600'
          )}
        >
          <FileText className="w-4 h-4" />
          {hasNotes && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400" />
          )}
        </button>

        {/* Direct Practice Link Menu */}
        <ExternalLinkMenu problem={problem} />
      </div>

      {/* Notes Modal */}
      <NotesModal
        problem={problem}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />
    </div>
  );
};
