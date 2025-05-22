
import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import Sidebar from '@/components/Dashboard/Sidebar';
import SummaryCards from '@/components/Dashboard/SummaryCards';
import Charts from '@/components/Dashboard/Charts';
import ThemeToggle from '@/components/Dashboard/ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import TicketPanel from '@/components/Dashboard/TicketPanel';

const Index = () => {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
          <header className="border-b p-4 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Excel Ticket Analysis</p>
            </div>
            <ThemeToggle />
          </header>
          <div className="flex-1 overflow-auto">
            <div className="px-4 pt-4 pb-2 max-w-7xl mx-auto space-y-4">
              {/* Summary Cards */}
              <SummaryCards />
              
              {/* Charts */}
              <Charts />
              
              
            </div>
          </div>
        </main>

        {/* Ticket Panel - Will slide in from the right when tickets are selected */}
        <TicketPanel />
      </div>
    </DashboardProvider>
  );
};

export default Index;