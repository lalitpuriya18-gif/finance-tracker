import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { generateSmartInsights } from '../../lib/insights';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Repeat,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const SmartInsights: React.FC = () => {
  const { transactions, categories, goals, recurringRules, settings } = useFinanceStore();

  const insights = generateSmartInsights(
    transactions,
    categories,
    goals,
    recurringRules,
    settings.currency
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
      case 'recurring':
        return <Repeat className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
      case 'saving':
      case 'positive':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-emerald-500/20">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Smart Financial Insights
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Rule-based intelligence derived from your spending patterns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.slice(0, 3).map((insight) => (
          <div
            key={insight.id}
            className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            {getIcon(insight.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {insight.title}
                </h4>
                {insight.highlight && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 tabular-nums">
                    {insight.highlight}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {insight.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
