import React from 'react';
import { useProgress } from '../../context/ProgressContext';
import { datasetService } from '../../services/datasetService';
import { Activity, CheckCircle2, Clock, Star, FileText, ArrowRight } from 'lucide-react';
import { DifficultyBadge } from '../ui/Badge';
import { Difficulty } from '../../types/dataset';

export const RecentActivity: React.FC = () => {
  const { activities } = useProgress();

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'solved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'attempting':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'bookmarked':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'note_added':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'solved':
        return 'Solved';
      case 'attempting':
        return 'Started Attempting';
      case 'bookmarked':
        return 'Bookmarked';
      case 'unbookmarked':
        return 'Removed Bookmark';
      case 'note_added':
        return 'Updated Notes';
      case 'unsolved':
        return 'Marked Unsolved';
      default:
        return 'Updated';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Recent Activity</span>
        </div>
        <div className="py-8 text-center text-slate-500 text-xs">
          No activity recorded yet. Start solving or bookmarking problems to build your timeline!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Recent Activity</span>
        </div>
        <span className="text-[11px] text-slate-500">{activities.length} recent events</span>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
        {activities.slice(0, 10).map((act) => {
          const problem = datasetService.getProblemById(act.problem_id);
          return (
            <div
              key={act.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-md bg-slate-900 border border-slate-800 shrink-0">
                  {getActionIcon(act.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200 truncate">
                      {act.problem_title}
                    </span>
                    {act.difficulty && (
                      <DifficultyBadge
                        difficulty={act.difficulty as Difficulty}
                        className="text-[10px] px-1.5 py-0"
                      />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {getActionLabel(act.type)} • {act.platform}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 shrink-0 pl-2">
                {formatRelativeTime(act.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
