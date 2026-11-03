import React from 'react';
import { AnalyticsOverview } from '../components/analytics/AnalyticsOverview';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Preparation Analytics & Topic Metrics
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Deep data-driven insights into your preparation velocity, topic gaps, and practice distribution.
        </p>
      </div>

      <AnalyticsOverview />
    </div>
  );
};
