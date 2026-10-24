import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { KpiCards } from '../components/dashboard/KpiCards';
import { MonthlyFinancialSummary } from '../components/dashboard/MonthlyFinancialSummary';
import { ChartsSection } from '../components/dashboard/ChartsSection';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { BudgetQuickList } from '../components/dashboard/BudgetQuickList';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { PlusCircle, RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToast } = useFinanceStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState('12m ago');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncTime('Just now');
      addToast({
        title: 'Accounts Synced',
        description: 'Successfully updated balances from ICICI Bank, HDFC Card, and Paytm UPI.',
        type: 'success',
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Welcome back, Arjun + Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Welcome back, Arjun <span>👋</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's your consolidated financial overview for October 2023
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs transition-all active:scale-[0.98]"
            title="Click to sync bank accounts"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-600 ${
                isSyncing ? 'animate-spin' : 'animate-spin-slow'
              }`}
            />
            <span>All accounts synced {syncTime}</span>
          </button>

          {/* Stitch Circled Plus Add Transaction button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#065f46] hover:bg-[#054c37] rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards (Total Balance, Monthly Income, Monthly Expenses, Savings Rate) */}
      <KpiCards />

      {/* Row 2: Monthly Financial Summary (Deficit Alert / Surplus) */}
      <MonthlyFinancialSummary />

      {/* Row 3: Income vs Expenses Area Chart + Spending by Category Donut */}
      <ChartsSection />

      {/* Row 4: Recent Transactions (2 Cols) + Monthly Budget (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <BudgetQuickList />
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
