import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMoney } from '../../lib/currency';
import {
  Utensils,
  Briefcase,
  ShoppingBag,
  Car,
  Activity,
  Zap,
  ArrowRight,
  TrendingUp,
  Tv,
  Coffee,
  Tag,
  ArrowRightLeft,
  Receipt,
} from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { transactions, accounts, categories, settings } = useFinanceStore();

  const getCategoryDetails = (catId?: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) {
      return {
        name: 'General',
        icon: Tag,
        colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      };
    }

    const lower = cat.name.toLowerCase();
    let Icon = Tag;
    let iconBg = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

    if (lower.includes('food') || lower.includes('dining')) {
      Icon = Utensils;
    } else if (lower.includes('salary') || lower.includes('income')) {
      Icon = Briefcase;
      iconBg = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
    } else if (lower.includes('shopping')) {
      Icon = ShoppingBag;
      iconBg = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400';
    } else if (lower.includes('transport') || lower.includes('commute')) {
      Icon = Car;
    } else if (lower.includes('health') || lower.includes('fit')) {
      Icon = Activity;
    } else if (lower.includes('bill') || lower.includes('util') || lower.includes('power')) {
      Icon = Zap;
    } else if (lower.includes('entertainment') || lower.includes('ott')) {
      Icon = Tv;
    } else if (lower.includes('invest')) {
      Icon = TrendingUp;
    }

    let colorClass = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
    if (cat.type === 'income') {
      colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    } else if (lower.includes('food')) {
      colorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }

    return { name: cat.name, icon: Icon, colorClass, iconBg };
  };

  const getAccountName = (accId?: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'Linked Account';
  };

  const displayList = transactions.slice(0, 6);

  return (
    <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Cleared and pending movements
          </p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          View all transactions <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {displayList.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No transactions recorded yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {displayList.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const cat = isTransfer
              ? {
                  name: 'Transfer',
                  icon: ArrowRightLeft,
                  colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
                  iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
                }
              : getCategoryDetails(tx.categoryId);
            const Icon = cat.icon;
            const accountLabel = getAccountName(tx.accountId);
            const dateLabel = tx.date ? new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
            const subtext = `${dateLabel}${tx.time ? `, ${tx.time}` : ''} • ${accountLabel}`;

            return (
              <Link
                key={tx.id}
                to="/transactions"
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {tx.note || 'Transaction'}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.colorClass}`}>
                        {cat.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                      {subtext}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-sm font-bold tabular-nums shrink-0 ${
                    isIncome
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isTransfer
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isIncome ? '+' : isTransfer ? '' : '-'}
                  {formatMoney(tx.amount, settings.currency)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
};
