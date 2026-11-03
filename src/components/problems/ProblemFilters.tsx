import React from 'react';
import { Difficulty, Platform, ProblemStatus, StriverTier } from '../../types/dataset';
import { datasetService } from '../../services/datasetService';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FilterState {
  search: string;
  moduleId: string;
  difficulty: Difficulty | 'All';
  platform: Platform | 'All';
  tier: StriverTier | 'All';
  status: ProblemStatus | 'All';
  isBookmarked?: boolean;
}

interface ProblemFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  totalFiltered: number;
}

export const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  filters,
  onChange,
  onClear,
  totalFiltered,
}) => {
  const modules = datasetService.getModules();

  const isAnyFilterActive =
    filters.search !== '' ||
    filters.moduleId !== 'All' ||
    filters.difficulty !== 'All' ||
    filters.platform !== 'All' ||
    filters.tier !== 'All' ||
    filters.status !== 'All' ||
    filters.isBookmarked === true;

  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
      {/* Top row: Search & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search problems by title, #number, topic, or platform... (Press '/' to search)"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-200">{totalFiltered}</strong> problems
          </span>
          {isAnyFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-xs text-rose-400 border-rose-900/40 hover:bg-rose-950/30 hover:border-rose-800"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
        {/* Module Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Module</label>
          <select
            value={filters.moduleId}
            onChange={(e) => update({ moduleId: e.target.value })}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="All">All Modules</option>
            {modules.map((m) => (
              <option key={m.module_id} value={m.module_id}>
                Step {m.module_number}: {m.module_name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Difficulty</label>
          <select
            value={filters.difficulty}
            onChange={(e) => update({ difficulty: e.target.value as Difficulty | 'All' })}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Platform</label>
          <select
            value={filters.platform}
            onChange={(e) => update({ platform: e.target.value as Platform | 'All' })}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="All">All Platforms</option>
            <option value="LeetCode">LeetCode</option>
            <option value="GeeksforGeeks">GeeksforGeeks</option>
            <option value="TakeUForward">TakeUForward</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => update({ status: e.target.value as ProblemStatus | 'All' })}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="All">All Statuses</option>
            <option value="unsolved">○ Not Started</option>
            <option value="attempting">◐ Attempting</option>
            <option value="solved">● Solved</option>
          </select>
        </div>

        {/* Striver Tier */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Striver Tier</label>
          <select
            value={filters.tier}
            onChange={(e) => update({ tier: e.target.value as StriverTier | 'All' })}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="All">All Tiers</option>
            <option value="basic">Basic</option>
            <option value="core">Core</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        {/* Bookmarks toggle button */}
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => update({ isBookmarked: !filters.isBookmarked })}
            className={`w-full rounded-lg px-2.5 py-1.5 border font-medium transition-colors flex items-center justify-center gap-1.5 ${
              filters.isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-950/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>★</span>
            <span>{filters.isBookmarked ? 'Bookmarked Only' : 'Bookmarks'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
