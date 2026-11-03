import React, { useState } from 'react';
import { datasetService } from '../services/datasetService';
import { ModuleAccordion } from '../components/sheet/ModuleAccordion';
import { Module, Problem } from '../types/dataset';
import { Layers, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface SheetPageProps {
  initialModuleId?: string;
}

export const SheetPage: React.FC<SheetPageProps> = ({ initialModuleId }) => {
  const modules = datasetService.getModules();
  const [expandAll, setExpandAll] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredModules = modules.filter((m: Module) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const hasModMatch = m.module_name.toLowerCase().includes(q) || m.module_number.toString() === q;
    const hasProbMatch = datasetService
      .getProblemsByModule(m.module_id)
      .some((p: Problem) => p.title.toLowerCase().includes(q));
    return hasModMatch || hasProbMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Striver's A2Z DSA Sheet
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete sequential roadmap preserving all 20 modules, 84 subtopics, and verified practice links.
          </p>
        </div>

        {/* Global Controls: Search & Expand/Collapse All */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter topics..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-44"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpandAll(!expandAll)}
            className="text-xs"
          >
            {expandAll ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 mr-1" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 mr-1" />
                Expand All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Module List Accordions */}
      <div className="space-y-3">
        {filteredModules.map((module: Module) => (
          <ModuleAccordion
            key={module.module_id}
            module={module}
            defaultOpen={expandAll || module.module_id === initialModuleId || module.module_number === 1}
          />
        ))}

        {filteredModules.length === 0 && (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl text-slate-500 text-sm">
            No modules match "{filterQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
