import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Flame,
  User,
  LogOut,
  Database,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onSearchFocus: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onSearchFocus,
  onOpenAuthModal,
}) => {
  const { user, isSupabaseConnected, signOut } = useAuth();
  const { stats } = useProgress();
  const { theme, toggleTheme } = useTheme();

  // Listen for global '/' keyboard shortcut to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        onSearchFocus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchFocus]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Trigger */}
        <button
          onClick={onSearchFocus}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Search all 453 problems...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 rounded border border-slate-700">
            /
          </kbd>
        </button>
      </div>

      {/* Right: Streak badge, Supabase status, Theme toggle, User Auth */}
      <div className="flex items-center gap-2.5">
        {/* Streak Pill */}
        <div
          title={`Active Streak: ${stats.currentStreak} days`}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold"
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>{stats.currentStreak}</span>
        </div>

        {/* Storage status pill */}
        <div
          title={
            isSupabaseConnected
              ? 'Cloud Sync Active (Supabase PostgreSQL)'
              : 'Local Offline Mode (Indexed/LocalStorage)'
          }
          className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-400"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSupabaseConnected ? 'bg-emerald-400' : 'bg-sky-400'
            }`}
          />
          <span>{isSupabaseConnected ? 'Cloud' : 'Local'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account / Profile */}
        {user?.is_guest ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAuthModal}
            className="text-xs"
          >
            <User className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Sign In</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-200">
                {user?.display_name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:border-rose-900"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
