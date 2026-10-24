import React from 'react';
import { Goal } from '../../types/finance';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatMoney } from '../../lib/currency';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Target, Plus, Edit3, Trash2, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { addMonths, format, parseISO } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onContribute: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onContribute }) => {
  const { settings, deleteGoal } = useFinanceStore();

  const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const isCompleted = goal.savedAmount >= goal.targetAmount;

  // Estimate completion date based on reasonable pace ($250/mo or 10% of target/mo)
  const assumedMonthlyPace = Math.max(10000, Math.round(goal.targetAmount * 0.08));
  const monthsToFinish = remaining > 0 ? Math.ceil(remaining / assumedMonthlyPace) : 0;
  const estimatedCompletionDate = format(addMonths(new Date(), monthsToFinish), 'MMM yyyy');

  // SVG Circular progress constants
  const size = 68;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="space-y-4 hoverable">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: goal.color || '#3b82f6' }}
          >
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{goal.name}</h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>Target: {goal.targetDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            title="Edit goal"
            aria-label={`Edit goal: ${goal.name}`}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Edit goal</span>
          </button>
          <button
            onClick={() => deleteGoal(goal.id)}
            title="Delete goal"
            aria-label={`Delete goal: ${goal.name}`}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Delete goal</span>
          </button>
        </div>
      </div>

      {/* Figures & Progress Ring */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Saved so far</span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatMoney(goal.savedAmount, settings.currency)}
          </div>
          <span className="text-xs text-slate-400">
            of {formatMoney(goal.targetAmount, settings.currency)}
          </span>
        </div>

        {/* Circular Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800 fill-transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={goal.color || '#3b82f6'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="fill-transparent transition-all duration-700"
            />
          </svg>
          <div className="absolute text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {percent}%
          </div>
        </div>
      </div>

      {/* Estimated completion & Add contribution button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          {isCompleted ? (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" /> Goal Achieved!
            </div>
          ) : (
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
              <span className="block text-slate-400">Est. completion:</span>
              <strong className="text-slate-700 dark:text-slate-300">
                {estimatedCompletionDate} ({monthsToFinish} mo)
              </strong>
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onContribute}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Contribute
        </Button>
      </div>
    </Card>
  );
};
