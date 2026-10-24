import React from 'react';
import { Budget, Category, Transaction } from '../../types/finance';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { formatMoney } from '../../lib/currency';
import { calculateBudgetStatus } from '../../lib/calculations';
import { useFinanceStore } from '../../store/useFinanceStore';
import { AlertTriangle, CheckCircle, Edit3, Trash2, Clock } from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
  category?: Category;
  monthTransactions: Transaction[];
  onEdit: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  category,
  monthTransactions,
  onEdit,
}) => {
  const { settings, deleteBudget } = useFinanceStore();
  const now = new Date();

  const {
    spent,
    remaining,
    percent,
    status,
    dailyPace,
    projectedSpend,
    isProjectedOverspend,
  } = calculateBudgetStatus(budget, monthTransactions, now);

  const isOver = status === 'over';
  const isWarning = status === 'warning';

  return (
    <Card className="space-y-4 hoverable">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CategoryIcon
            icon={category?.icon || 'Tag'}
            color={category?.color}
            size={18}
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {category?.name || 'Category'}
            </h4>
            <span className="text-[11px] text-slate-400">
              Monthly Limit: {formatMoney(budget.monthlyLimit, settings.currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            title="Edit budget limit"
            aria-label={`Edit budget for ${category?.name || 'category'}`}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Edit budget limit</span>
          </button>
          <button
            onClick={() => deleteBudget(budget.id)}
            title="Remove budget"
            aria-label={`Remove budget for ${category?.name || 'category'}`}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Remove budget</span>
          </button>
        </div>
      </div>

      {/* Figures */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Spent this month</span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatMoney(spent, settings.currency)}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isOver ? 'Over budget by' : 'Remaining'}
          </span>
          <div
            className={`text-xl font-bold tabular-nums ${
              isOver
                ? 'text-rose-600 dark:text-rose-400'
                : isWarning
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatMoney(Math.abs(remaining), settings.currency)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
          <span>{percent}% used</span>
          <span>{100 - percent > 0 ? `${100 - percent}% left` : 'Exceeded'}</span>
        </div>
        <ProgressBar value={percent} colorScheme="budget" size="md" />
      </div>

      {/* Pace and Projection Warning Alert */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Average Pace:
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            ~{formatMoney(dailyPace, settings.currency)}/day
          </span>
        </div>

        {isOver ? (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>Budget exceeded by {formatMoney(Math.abs(remaining), settings.currency)}!</span>
          </div>
        ) : isProjectedOverspend ? (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>
              On pace to spend ~{formatMoney(projectedSpend, settings.currency)} (+
              {formatMoney(projectedSpend - budget.monthlyLimit, settings.currency)} over budget)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span>Healthy spending pace. Projected to stay within budget.</span>
          </div>
        )}
      </div>
    </Card>
  );
};
