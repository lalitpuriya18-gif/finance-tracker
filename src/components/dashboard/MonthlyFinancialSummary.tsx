import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMoney } from '../../lib/currency';
import { calculateTotals, getMonthTransactions } from '../../lib/calculations';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MonthlyFinancialSummary: React.FC = () => {
  const { transactions, settings } = useFinanceStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentMonthTx = transactions;
  const { income, expense, net, savingsRate } = calculateTotals(currentMonthTx);

  const hasActivity = income > 0 || expense > 0;
  const isDeficit = hasActivity && (expense > income || (income === 0 && expense > 0));

  return (
    <Card className="rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#065f46] text-white flex items-center justify-center shadow-xs shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Monthly Financial Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consolidated cash flow based on live transactions
            </p>
          </div>
        </div>

        {/* Right: Status Badges (Deficit Alert / Healthy Surplus / No Activity, Entries Count) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!hasActivity ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold shadow-2xs">
              No Activity
            </span>
          ) : isDeficit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              Deficit Alert
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Healthy Surplus
            </span>
          )}

          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold tabular-nums">
            {currentMonthTx.length} {currentMonthTx.length === 1 ? 'entry' : 'entries'}
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title={isExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Breakdown Drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] text-slate-500 font-medium">Monthly Inflow</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {formatMoney(income, settings.currency)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] text-slate-500 font-medium">Monthly Outflow</span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                {formatMoney(expense, settings.currency)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] text-slate-500 font-medium">Net Realized Margin</span>
              <p
                className={`text-base font-bold tabular-nums mt-0.5 ${
                  net >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatMoney(net, settings.currency)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Real-time transactional audit verified against linked Indian bank accounts</span>
            </div>
            <Link
              to="/reports"
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View Analytics Report
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};
