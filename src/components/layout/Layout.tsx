import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileTabBar } from './MobileTabBar';
import { ToastContainer } from '../ui/Toast';
import { TransactionModal } from '../transactions/TransactionModal';
import { CommandPalette } from '../ui/CommandPalette';
import { X } from 'lucide-react';

export const Layout: React.FC = () => {
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Mobile Slide-out Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-10">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                title="Close menu"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
              <Sidebar isMobile />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar />
      </div>

      {/* Global Notifications */}
      <ToastContainer />

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      {/* Global Command Palette & Shortcuts */}
      <CommandPalette onOpenAddTransaction={() => setIsAddTxOpen(true)} />
    </div>
  );
};
