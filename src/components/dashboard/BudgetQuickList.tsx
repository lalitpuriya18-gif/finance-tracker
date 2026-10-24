import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMoney } from '../../lib/currency';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';

export const BudgetQuickList: React.FC = () => {
  const { budgets, categories, transactions, settings } = useFinanceStore();

  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g. "2023-10" or current YYYY-MM

  const calculatedBudgets = useMemo(() => {
    if (!budgets || budgets.length === 0) {
      return [];
    }

    return budgets.slice(0, 3).map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const categoryName = cat ? cat.name : 'Category';

      // Sum expenses for this category
      const spentPaise = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);

      const capPaise = b.monthlyLimit;
      const percent = capPaise > 0 ? Math.min(Math.round((spentPaise / capPaise) * 100), 100) : 0;
      const isOver = spentPaise > capPaise;
      const isWarning = percent >= 85;

      return {
        category: categoryName,
        percent,
        spent: `${formatMoney(spentPaise, settings.currency)} spent`,
        cap: `${formatMoney(capPaise, settings.currency)} cap`,
        isWarning: isWarning || isOver,
        badge: isOver ? 'OVER LIMIT' : isWarning ? 'NEAR LIMIT' : undefined,
        color: isOver ? 'bg-rose-600' : isWarning ? 'bg-rose-500' : 'bg-emerald-600',
      };
    });
  }, [budgets, categories, transactions, settings]);

  return (
    <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Monthly Budget
          </h3>
          <Link
            to="/budgets"
            className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Adjust Budget Limits"
            aria-label="Adjust Budget Limits"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Adjust Budget Limits</span>
          </Link>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          Spending velocity for current billing cycle
        </p>

        {calculatedBudgets.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No active category budgets yet.</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-[200px] mx-auto">
              Set spending limits for your categories to track pace.
            </p>
            <Link
              to="/budgets"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              + Create Budget
            </Link>
          </div>
        ) : (
          <div className="space-y-5 mt-5">
            {calculatedBudgets.map((b, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {b.category}
                    </span>
                    {b.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        {b.badge}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold tabular-nums ${b.isWarning ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {b.percent}% used
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${b.color}`}
                    style={{ width: `${b.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <span>{b.spent}</span>
                  <span>{b.cap}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6">
        <Link
          to="/budgets"
          className="w-full py-2.5 px-4 bg-[#f0f4ff] hover:bg-[#e0e7ff] dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-[#3730a3] dark:text-indigo-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>View All Budgets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
