import React from 'react';
import { Card } from '../ui/Card';
import { Wallet, ArrowDown, ArrowUpRight, PiggyBank } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMoney } from '../../lib/currency';
import { calculateTotals, calculateAccountBalances, getMonthTransactions } from '../../lib/calculations';

export const KpiCards: React.FC = () => {
  const { accounts, transactions, settings } = useFinanceStore();

  const hasAccounts = accounts.length > 0;
  const hasTransactions = transactions.length > 0;

  const balances = calculateAccountBalances(accounts, transactions);
  const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);

  const { income, expense, savingsRate } = calculateTotals(transactions);

  const displayTotal = totalBalance;
  const displayIncome = income;
  const displayExpense = expense;
  const displaySavingsRate = income > 0 ? savingsRate : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOTAL BALANCE */}
      <Card className="border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Balance
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
            {formatMoney(displayTotal, settings.currency)}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {hasAccounts ? (
            <>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md font-semibold text-[11px] text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50">
                ● Live
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} linked
              </span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              No accounts linked
            </span>
          )}
        </div>
      </Card>

      {/* 2. MONTHLY INCOME */}
      <Card className="border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Monthly Income
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
            {formatMoney(displayIncome, settings.currency)}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {hasTransactions && displayIncome > 0 ? (
            <>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md font-semibold text-[11px] text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50">
                ↗ Inflow
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                from ledger
              </span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              No income logged
            </span>
          )}
        </div>
      </Card>

      {/* 3. MONTHLY EXPENSES */}
      <Card className="border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Monthly Expenses
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
            {formatMoney(displayExpense, settings.currency)}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {hasTransactions && displayExpense > 0 ? (
            <>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md font-semibold text-[11px] text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50">
                ↘ Outflow
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                current cycle
              </span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              No expenses logged
            </span>
          )}
        </div>
      </Card>

      {/* 4. SAVINGS RATE */}
      <Card className="border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Savings Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
            {displaySavingsRate}%
          </h3>
          <span className="text-xs font-semibold text-slate-400">Target: 50%</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {hasTransactions && income > 0 ? (
            <>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md font-semibold text-[11px] text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50">
                ↗ {displaySavingsRate}%
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                savings velocity
              </span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              Target: 50%
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
