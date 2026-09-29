/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

// Views
import { DashboardView } from './components/views/DashboardView';
import { DomainsView } from './components/views/DomainsView';
import { FileManagerView } from './components/views/FileManagerView';
import { DatabasesView } from './components/views/DatabasesView';
import { EmailAccountsView } from './components/views/EmailAccountsView';
import { SslView } from './components/views/SslView';
import { ResourcesView } from './components/views/ResourcesView';
import { BackupsView } from './components/views/BackupsView';
import { PhpNodeView } from './components/views/PhpNodeView';
import { FtpAccountsView } from './components/views/FtpAccountsView';
import { DnsZoneView } from './components/views/DnsZoneView';
import { SecurityView } from './components/views/SecurityView';
import { VpsView } from './components/views/VpsView';
import { TerminalView } from './components/views/TerminalView';
import { CronJobsView } from './components/views/CronJobsView';
import { LogsView } from './components/views/LogsView';
import { BillingView } from './components/views/BillingView';

const MainAppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'domains':
        return <DomainsView />;
      case 'file-manager':
        return <FileManagerView />;
      case 'mysql':
        return <DatabasesView />;
      case 'emails':
        return <EmailAccountsView />;
      case 'ssl':
        return <SslView />;
      case 'resources':
        return <ResourcesView />;
      case 'backups':
        return <BackupsView />;
      case 'php-node':
        return <PhpNodeView />;
      case 'ftp':
        return <FtpAccountsView />;
      case 'dns':
        return <DnsZoneView />;
      case 'security':
        return <SecurityView />;
      case 'vps':
        return <VpsView />;
      case 'terminal':
        return <TerminalView />;
      case 'cron':
        return <CronJobsView />;
      case 'logs':
        return <LogsView />;
      case 'billing':
      case 'settings':
        return <BillingView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col font-sans bg-[var(--app-bg)] text-[var(--app-fg)] antialiased transition-colors duration-200">
      {/* Top Header with theme toggle and BlackVs branding */}
      <Header onToggleSidebarMobile={() => setMobileSidebarOpen((prev) => !prev)} />

      {/* Main Workspace Frame - Fixed Sidebar & Internal Scrollable Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Scrollable Viewport Container with perfect desktop padding and zero horizontal clipping */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto px-3 sm:px-5 lg:px-6 py-4 max-w-[1640px] w-full mx-auto pb-12 scrollbar-thin">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
