import React from 'react';
import { useProgress } from '../../context/ProgressContext';
import {
  LayoutDashboard,
  Layers,
  ListFilter,
  Bookmark,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Code2,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export type PageId = 'dashboard' | 'sheet' | 'problems' | 'revision' | 'analytics' | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { stats, progressMap } = useProgress();

  const bookmarkedCount = Object.values(progressMap).filter((p) => p.is_bookmarked).length;

  const navItems = [
    {
      id: 'dashboard' as PageId,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      badge: null,
    },
    {
      id: 'sheet' as PageId,
      label: 'A2Z Sheet',
      icon: <Layers className="w-5 h-5 shrink-0" />,
      badge: `${stats.solvedProblems}/${stats.totalProblems}`,
    },
    {
      id: 'problems' as PageId,
      label: 'All Problems',
      icon: <ListFilter className="w-5 h-5 shrink-0" />,
      badge: `${stats.totalProblems}`,
    },
    {
      id: 'revision' as PageId,
      label: 'Revision / Notes',
      icon: <Bookmark className="w-5 h-5 shrink-0" />,
      badge: bookmarkedCount > 0 ? `${bookmarkedCount}` : null,
    },
    {
      id: 'analytics' as PageId,
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
      badge: `${stats.completionPercentage}%`,
    },
    {
      id: 'settings' as PageId,
      label: 'Settings & Backup',
      icon: <Settings className="w-5 h-5 shrink-0" />,
      badge: null,
    },
  ];

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-950/95 border-r border-slate-800 transition-all duration-300 ease-in-out lg:static',
          isCollapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold font-mono text-base shrink-0">
                ⚡
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-100 tracking-tight block truncate">
                  A2Z DSA Tracker
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  Striver's Complete Sheet
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-base">
              ⚡
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                )}
              >
                <div
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                >
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-mono font-medium',
                          isActive
                            ? 'bg-emerald-500/25 text-emerald-300'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info: Progress pill */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Total Solved</span>
                <span className="text-emerald-400 font-bold">
                  {stats.solvedProblems}/{stats.totalProblems}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
