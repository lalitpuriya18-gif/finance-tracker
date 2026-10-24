import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import {
  Utensils,
  Briefcase,
  ShoppingBag,
  Car,
  Activity,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const transactions = [
    {
      id: 'tx-1',
      title: 'Swiggy Gourmet',
      category: 'Food & Dining',
      catColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      accountInfo: '24 Oct, 08:15 PM • ICICI Debit ..8921',
      amount: '-₹1,420.00',
      isIncome: false,
      icon: Utensils,
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'tx-2',
      title: 'Tech Mahindra Salary',
      category: 'Income',
      catColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      accountInfo: '23 Oct, 10:00 AM • ICICI Salary A/c',
      amount: '+₹1,45,000.00',
      isIncome: true,
      icon: Briefcase,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'tx-3',
      title: 'Amazon India',
      category: 'Shopping',
      catColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
      accountInfo: '22 Oct, 04:30 PM • HDFC Card ..4092',
      amount: '-₹3,499.00',
      isIncome: false,
      icon: ShoppingBag,
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    {
      id: 'tx-4',
      title: 'Shell Petrol BKC',
      category: 'Transport',
      catColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
      accountInfo: '22 Oct, 09:15 AM • HDFC Card ..4092',
      amount: '-₹2,500.00',
      isIncome: false,
      icon: Car,
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'tx-5',
      title: 'Cult.fit Pass',
      category: 'Health',
      catColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
      accountInfo: '20 Oct, 07:00 PM • UPI (Paytm)',
      amount: '-₹2,100.00',
      isIncome: false,
      icon: Activity,
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'tx-6',
      title: 'Tata Power Electricity',
      category: 'Bills',
      catColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
      accountInfo: '18 Oct, 11:30 AM • AutoPay',
      amount: '-₹1,850.00',
      isIncome: false,
      icon: Zap,
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
  ];

  return (
    <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
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

      <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
        {transactions.map((tx) => {
          const Icon = tx.icon;
          return (
            <Link
              key={tx.id}
              to="/transactions"
              className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {tx.title}
                    </h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tx.catColor}`}>
                      {tx.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {tx.accountInfo}
                  </p>
                </div>
              </div>

              <span
                className={`text-sm font-bold tabular-nums shrink-0 ${
                  tx.isIncome
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {tx.amount}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};
