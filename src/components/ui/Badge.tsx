import React from 'react';
import { cn } from '../../utils/cn';
import { Difficulty, Platform, ProblemStatus, StriverTier } from '../../types/dataset';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'bg-transparent text-slate-400 border-slate-700',
    success: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-400 border-amber-800/60',
    danger: 'bg-rose-950/70 text-rose-400 border-rose-800/60',
    info: 'bg-blue-950/70 text-blue-400 border-blue-800/60',
    purple: 'bg-purple-950/70 text-purple-400 border-purple-800/60',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border tracking-wide transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const DifficultyBadge: React.FC<{ difficulty: Difficulty; className?: string }> = ({
  difficulty,
  className,
}) => {
  if (difficulty === 'Easy') {
    return <Badge variant="success" className={className}>Easy</Badge>;
  }
  if (difficulty === 'Medium') {
    return <Badge variant="warning" className={className}>Medium</Badge>;
  }
  return <Badge variant="danger" className={className}>Hard</Badge>;
};

export const TierBadge: React.FC<{ tier?: StriverTier; className?: string }> = ({
  tier,
  className,
}) => {
  if (!tier) return null;
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  if (tier === 'basic') {
    return (
      <span
        className={cn(
          'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border bg-sky-950/40 text-sky-400 border-sky-800/50',
          className
        )}
      >
        {label}
      </span>
    );
  }
  if (tier === 'core') {
    return (
      <span
        className={cn(
          'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border bg-indigo-950/40 text-indigo-400 border-indigo-800/50',
          className
        )}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-800/50',
        className
      )}
    >
      {label}
    </span>
  );
};

export const PlatformBadge: React.FC<{ platform: Platform; className?: string }> = ({
  platform,
  className,
}) => {
  const styles: Record<Platform, string> = {
    LeetCode: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    GeeksforGeeks: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    TakeUForward: 'bg-red-500/10 text-red-300 border-red-500/30',
    CodeStudio: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    Other: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border',
        styles[platform] || styles.Other,
        className
      )}
    >
      {platform}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ProblemStatus; className?: string }> = ({
  status,
  className,
}) => {
  if (status === 'solved') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Solved
      </span>
    );
  }
  if (status === 'attempting') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Attempting
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/50',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Not Started
    </span>
  );
};
