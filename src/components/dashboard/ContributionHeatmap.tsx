import React, { useState, useMemo } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { datasetService } from '../../services/datasetService';
import { generateYearlyHeatmapData, formatFriendlyDate } from '../../utils/dateUtils';
import { HeatmapDay } from '../../types/user';
import { ChevronLeft, ChevronRight, Calendar, Flame } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ContributionHeatmap: React.FC = () => {
  const { progressMap, stats } = useProgress();
  const { user } = useAuth();
  const currentCalendarYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentCalendarYear);
  const [hoveredDay, setHoveredDay] = useState<{ day: HeatmapDay; x: number; y: number } | null>(null);

  const timezone = user?.timezone || 'Asia/Kolkata';

  const problemsById = useMemo(() => {
    const map = new Map();
    for (const p of datasetService.getProblems()) {
      map.set(p.problem_id, p);
    }
    return map;
  }, []);

  const heatmapData = useMemo(() => {
    return generateYearlyHeatmapData(selectedYear, progressMap, problemsById, timezone);
  }, [selectedYear, progressMap, problemsById, timezone]);

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Calculate approximate column index for each month label
  const monthOffsets = useMemo(() => {
    const offsets: { month: string; colIndex: number }[] = [];
    let currentMonth = -1;

    heatmapData.weeks.forEach((week, colIdx) => {
      const firstValidDay = week.find((d) => d !== null);
      if (firstValidDay) {
        const month = parseInt(firstValidDay.date.split('-')[1], 10) - 1;
        if (month !== currentMonth) {
          offsets.push({ month: monthLabels[month], colIndex: colIdx });
          currentMonth = month;
        }
      }
    });

    return offsets;
  }, [heatmapData.weeks]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-950/90 border-emerald-900/60 hover:border-emerald-500';
      case 2:
        return 'bg-emerald-800 border-emerald-700 hover:border-emerald-400';
      case 3:
        return 'bg-emerald-600 border-emerald-500 hover:border-emerald-300';
      case 4:
        return 'bg-emerald-400 border-emerald-300 hover:border-white shadow-sm shadow-emerald-400/30';
      default:
        return 'bg-slate-900/80 border-slate-800/80 hover:border-slate-600';
    }
  };

  const handleCellHover = (e: React.MouseEvent, day: HeatmapDay) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay({
      day,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header with year switch and summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Contribution Activity</span>
              <span className="text-xs font-normal text-slate-400">
                ({heatmapData.totalSolvedInYear} solved in {selectedYear})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              GitHub-style daily submission heatmap derived from verified completions
            </p>
          </div>
        </div>

        {/* Year Selector & Streak Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>{stats.currentStreak} day streak</span>
            </div>
          )}

          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5 text-xs">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1 hover:text-white text-slate-400 hover:bg-slate-800 rounded"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200 px-2 select-none">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              disabled={selectedYear >= currentCalendarYear + 1}
              className="p-1 hover:text-white text-slate-400 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid container with horizontal scroll for smaller screens */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[760px]">
          {/* Month labels row */}
          <div className="flex text-[11px] text-slate-400 mb-1.5 pl-8 relative h-4">
            {monthOffsets.map((mo, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${mo.colIndex * 14 + 32}px` }}
              >
                {mo.month}
              </span>
            ))}
          </div>

          {/* Grid with Weekday Labels on the left */}
          <div className="flex gap-2">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between text-[10px] text-slate-500 py-0.5 select-none w-6 shrink-0">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-[3px]">
              {heatmapData.weeks.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, rowIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${colIdx}-${rowIdx}`}
                          className="w-[11px] h-[11px] rounded-sm bg-transparent"
                        />
                      );
                    }
                    return (
                      <div
                        key={day.date}
                        onMouseEnter={(e) => handleCellHover(e, day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={cn(
                          'w-[11px] h-[11px] rounded-[2px] border cursor-pointer transition-all duration-100',
                          getCellColor(day.level)
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Legend & Timezone indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80 gap-2">
        <span className="text-[11px]">
          Timezone: <strong className="text-slate-400">{timezone}</strong>
        </span>

        {/* Intensity Legend */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto text-[11px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-900" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800 border border-emerald-700" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300" />
          <span>More</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl text-xs text-slate-100 max-w-xs animate-in fade-in duration-100"
          style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y}px` }}
        >
          <div className="font-semibold text-slate-200">
            {formatFriendlyDate(hoveredDay.day.date)}
          </div>
          <div className="text-emerald-400 font-medium mt-0.5">
            {hoveredDay.day.count === 0
              ? 'No problems solved'
              : `${hoveredDay.day.count} ${hoveredDay.day.count === 1 ? 'problem' : 'problems'} solved`}
          </div>
          {hoveredDay.day.problems.length > 0 && (
            <ul className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-0.5 text-[11px] text-slate-300">
              {hoveredDay.day.problems.slice(0, 4).map((p, i) => (
                <li key={i} className="truncate max-w-[200px]">
                  • {p.title}
                </li>
              ))}
              {hoveredDay.day.problems.length > 4 && (
                <li className="text-slate-500 italic">
                  +{hoveredDay.day.problems.length - 4} more...
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
