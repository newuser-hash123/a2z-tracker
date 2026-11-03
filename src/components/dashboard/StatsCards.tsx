import React from 'react';
import { useProgress } from '../../context/ProgressContext';
import { CheckCircle2, Flame, Trophy, Award, PieChart, Layers } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { stats } = useProgress();

  const cards = [
    {
      title: 'Total Problems',
      value: stats.totalProblems,
      subtext: 'Across 20 syllabus modules',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      accentColor: 'from-indigo-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/20',
      valueColor: 'text-indigo-200',
    },
    {
      title: 'Problems Solved',
      value: stats.solvedProblems,
      subtext: `${stats.attemptingProblems} currently attempting`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      accentColor: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      valueColor: 'text-emerald-400',
    },
    {
      title: 'Problems Remaining',
      value: stats.remainingProblems,
      subtext: 'To complete the A2Z sheet',
      icon: <PieChart className="w-5 h-5 text-amber-400" />,
      accentColor: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      valueColor: 'text-amber-300',
    },
    {
      title: 'Sheet Completion',
      value: `${stats.completionPercentage}%`,
      subtext: `${stats.solvedProblems} of ${stats.totalProblems} completed`,
      icon: <Award className="w-5 h-5 text-sky-400" />,
      accentColor: 'from-sky-500/10 to-sky-500/5',
      borderColor: 'border-sky-500/20',
      valueColor: 'text-sky-300',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      subtext: stats.currentStreak > 0 ? 'Active streak going strong!' : 'Solve a problem today to start!',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      accentColor: 'from-orange-500/10 to-orange-500/5',
      borderColor: 'border-orange-500/20',
      valueColor: 'text-orange-400',
    },
    {
      title: 'Longest Streak',
      value: `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`,
      subtext: 'Best consecutive consistency',
      icon: <Trophy className="w-5 h-5 text-purple-400" />,
      accentColor: 'from-purple-500/10 to-purple-500/5',
      borderColor: 'border-purple-500/20',
      valueColor: 'text-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden bg-gradient-to-br ${card.accentColor} bg-slate-900/90 border ${card.borderColor} rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.01]`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">{card.title}</span>
            <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0">
              {card.icon}
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>
              {card.value}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">{card.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
