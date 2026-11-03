import React, { useState, useMemo, useEffect } from 'react';
import { datasetService } from '../services/datasetService';
import { useProgress } from '../context/ProgressContext';
import { ProblemCard } from '../components/problems/ProblemCard';
import { ProblemFilters, FilterState } from '../components/problems/ProblemFilters';
import { Problem } from '../types/dataset';
import { ListFilter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface AllProblemsPageProps {
  searchQuery?: string;
}

export const AllProblemsPage: React.FC<AllProblemsPageProps> = ({ searchQuery = '' }) => {
  const { progressMap } = useProgress();

  const [filters, setFilters] = useState<FilterState>({
    search: searchQuery,
    moduleId: 'All',
    difficulty: 'All',
    platform: 'All',
    tier: 'All',
    status: 'All',
    isBookmarked: undefined,
  });

  const [sort, setSort] = useState<'order' | 'name' | 'difficulty' | 'recently_solved' | 'unsolved_first'>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Sync external search query if changed
  useEffect(() => {
    if (searchQuery) {
      setFilters((prev: FilterState) => ({ ...prev, search: searchQuery }));
    }
  }, [searchQuery]);

  const filteredProblems = useMemo(() => {
    return datasetService.queryProblems(filters, sort, progressMap);
  }, [filters, sort, progressMap]);

  // Reset page when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort, pageSize]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1;
  const paginatedProblems = useMemo(() => {
    if (pageSize >= 1000) return filteredProblems;
    const start = (currentPage - 1) * pageSize;
    return filteredProblems.slice(start, start + pageSize);
  }, [filteredProblems, currentPage, pageSize]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      moduleId: 'All',
      difficulty: 'All',
      platform: 'All',
      tier: 'All',
      status: 'All',
      isBookmarked: undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              All Problems Index
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and search across all 453 Striver A2Z problems with instant status management.
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="order">Sheet Sequence</option>
            <option value="unsolved_first">Unsolved First</option>
            <option value="name">Problem Name (A-Z)</option>
            <option value="difficulty">Difficulty (Easy to Hard)</option>
            <option value="recently_solved">Recently Solved</option>
          </select>
        </div>
      </div>

      {/* Multi-Filters bar */}
      <ProblemFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
        totalFiltered={filteredProblems.length}
      />

      {/* Problems List */}
      <div className="space-y-2">
        {paginatedProblems.map((problem: Problem) => (
          <ProblemCard key={problem.problem_id} problem={problem} showModuleInfo={true} />
        ))}

        {filteredProblems.length === 0 && (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <p className="text-slate-400 text-sm">
              No problems found matching your current filter criteria.
            </p>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredProblems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={1000}>All problems</option>
            </select>
            <span>
              (Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredProblems.length)} of {filteredProblems.length})
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-mono text-slate-300 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
