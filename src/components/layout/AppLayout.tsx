import React, { useState } from 'react';
import { Sidebar, PageId } from './Sidebar';
import { Navbar } from './Navbar';
import { DashboardPage } from '../../pages/DashboardPage';
import { SheetPage } from '../../pages/SheetPage';
import { AllProblemsPage } from '../../pages/AllProblemsPage';
import { RevisionPage } from '../../pages/RevisionPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { AuthModal } from '../auth/AuthModal';

export const AppLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchTargetQuery, setSearchTargetQuery] = useState('');
  const [targetModuleId, setTargetModuleId] = useState<string | undefined>(undefined);

  const handleSearchFocus = () => {
    setCurrentPage('problems');
  };

  const handleNavigateToSheet = (moduleId?: string) => {
    setTargetModuleId(moduleId);
    setCurrentPage('sheet');
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f17] text-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => {
          setCurrentPage(page);
          if (page !== 'sheet') setTargetModuleId(undefined);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSearchFocus={handleSearchFocus}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage onNavigateToSheet={handleNavigateToSheet} />
          )}
          {currentPage === 'sheet' && (
            <SheetPage initialModuleId={targetModuleId} />
          )}
          {currentPage === 'problems' && (
            <AllProblemsPage searchQuery={searchTargetQuery} />
          )}
          {currentPage === 'revision' && <RevisionPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
