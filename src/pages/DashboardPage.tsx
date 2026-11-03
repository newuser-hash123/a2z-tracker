import React from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ContributionHeatmap } from '../components/dashboard/ContributionHeatmap';
import { ContinueLearning } from '../components/dashboard/ContinueLearning';
import { ProblemOfTheDay } from '../components/dashboard/ProblemOfTheDay';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { PageId } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigateToSheet: (moduleId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToSheet }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            DSA Preparation Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Track your progress across Striver's complete A2Z DSA sheet with independent verified records.
          </p>
        </div>
      </div>

      {/* 6 Stats Cards */}
      <StatsCards />

      {/* GitHub-style Contribution Heatmap */}
      <ContributionHeatmap />

      {/* Dual Column: Continue Learning & Daily Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContinueLearning onNavigateToSheet={onNavigateToSheet} />
        <ProblemOfTheDay />
      </div>

      {/* Recent Activity Feed */}
      <RecentActivity />
    </div>
  );
};
