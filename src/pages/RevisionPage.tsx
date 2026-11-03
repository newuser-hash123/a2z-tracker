import React, { useState, useMemo } from 'react';
import { datasetService } from '../services/datasetService';
import { useProgress } from '../context/ProgressContext';
import { ProblemCard } from '../components/problems/ProblemCard';
import { Difficulty, Module, Problem } from '../types/dataset';
import { Bookmark, Star, FileText, RotateCcw } from 'lucide-react';

export const RevisionPage: React.FC = () => {
  const { progressMap } = useProgress();
  const allProblems = datasetService.getProblems();
  const modules = datasetService.getModules();

  const [tab, setTab] = useState<'bookmarks' | 'notes' | 'solved_revisit'>('bookmarks');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');

  // Filter problems based on tab
  const relevantProblems = useMemo(() => {
    return allProblems.filter((p: Problem) => {
      const prog = progressMap[p.problem_id];
      if (tab === 'bookmarks') {
        return Boolean(prog?.is_bookmarked);
      }
      if (tab === 'notes') {
        return Boolean(prog?.personal_notes && prog.personal_notes.trim().length > 0);
      }
      if (tab === 'solved_revisit') {
        return prog?.status === 'solved';
      }
      return false;
    });
  }, [allProblems, progressMap, tab]);

  // Apply module & difficulty filter
  const filteredProblems = useMemo(() => {
    return relevantProblems.filter((p: Problem) => {
      if (selectedModule !== 'All' && p.module_id !== selectedModule) return false;
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [relevantProblems, selectedModule, selectedDifficulty]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Revision & Notes Backlog
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Focus on star-bookmarked problems, your personal edge-case notes, and solved questions marked for review.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTab('bookmarks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            tab === 'bookmarks'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>Bookmarked Problems</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {allProblems.filter((p: Problem) => progressMap[p.problem_id]?.is_bookmarked).length}
          </span>
        </button>

        <button
          onClick={() => setTab('notes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            tab === 'notes'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>With Personal Notes</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {
              allProblems.filter(
                (p: Problem) => progressMap[p.problem_id]?.personal_notes?.trim().length
              ).length
            }
          </span>
        </button>

        <button
          onClick={() => setTab('solved_revisit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            tab === 'solved_revisit'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Revisit Solved Questions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {allProblems.filter((p: Problem) => progressMap[p.problem_id]?.status === 'solved').length}
          </span>
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs">
        <div>
          <label className="text-[11px] text-slate-400 mr-2">Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="All">All Modules</option>
            {modules.map((m: Module) => (
              <option key={m.module_id} value={m.module_id}>
                Step {m.module_number}: {m.module_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mr-2">Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <span className="text-slate-500 text-xs ml-auto">
          Showing <strong>{filteredProblems.length}</strong> items
        </span>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.map((problem: Problem) => {
          const notes = progressMap[problem.problem_id]?.personal_notes;
          return (
            <div key={problem.problem_id} className="space-y-2">
              <ProblemCard problem={problem} showModuleInfo={true} />
              {notes && notes.trim() !== '' && (
                <div className="ml-8 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-purple-200/90 whitespace-pre-wrap">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-purple-400 mb-1">
                    <FileText className="w-3 h-3" />
                    <span>Your Personal Note:</span>
                  </div>
                  {notes}
                </div>
              )}
            </div>
          );
        })}

        {filteredProblems.length === 0 && (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">
              {tab === 'bookmarks'
                ? 'No bookmarked problems yet. Star any problem to save it for revision!'
                : tab === 'notes'
                ? 'No problems with personal notes yet. Click the note icon on any problem to write approaches!'
                : 'No solved problems to revisit yet. Solve some problems from the sheet first!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
