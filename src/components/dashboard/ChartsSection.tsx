import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Info } from 'lucide-react';

export const ChartsSection: React.FC = () => {
  // 6-Month operational cashflow data matching the Stitch chart
  const cashflowData = [
    { month: 'May 23', income: 140000, expense: 62000 },
    { month: 'Jun 23', income: 142000, expense: 64000 },
    { month: 'Jul 23', income: 141000, expense: 65000 },
    { month: 'Aug 23', income: 144000, expense: 66000 },
    { month: 'Sep 23', income: 143000, expense: 67000 },
    { month: 'Oct 23 (Current)', income: 145000, expense: 68320 },
  ];

  // Category donut allocation data matching the Stitch breakdown
  const categoryData = [
    { name: 'Food & Dining', percent: '32%', value: 21860, color: '#10b981' },
    { name: 'Rent', percent: '28%', value: 19130, color: '#1e293b' },
    { name: 'Shopping', percent: '14%', value: 9560, color: '#f43f5e' },
    { name: 'Transport', percent: '12%', value: 8200, color: '#06b6d4' },
    { name: 'Bills', percent: '9%', value: 6150, color: '#3b82f6' },
    { name: 'Entertainment', percent: '5%', value: 3440, color: '#8b5cf6' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Left: Income vs Expenses Smooth Area Chart (2 Cols) */}
      <Card className="lg:col-span-2 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly operational cashflow comparison (May – Oct 2023)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#065f46]" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
                <span>Expenses</span>
              </div>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md">
                H2 2023
              </span>
            </div>
          </div>
        </div>

        {/* Dual Area Chart */}
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#065f46" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#065f46" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                hide={true}
                domain={[0, 160000]}
              />
              <Tooltip
                formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#065f46"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGrad)"
                dot={{ r: 3, fill: '#065f46' }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#dc2626"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGrad)"
                dot={{ r: 3, fill: '#dc2626' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Right: Spending by Category Donut Chart (1 Col) */}
      <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Spending by Category
            </h3>
            <Link
              to="/reports"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Detailed Spending Analytics"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Allocation breakdown for October
          </p>
        </div>

        {/* Donut with Center Text */}
        <div className="relative h-44 w-full flex items-center justify-center my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={76}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Spend
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              ₹68,340
            </span>
          </div>
        </div>

        {/* 2-Column Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {categoryData.map((cat, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[85px] text-[11px]">
                  {cat.name}
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] tabular-nums">
                {cat.percent}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
