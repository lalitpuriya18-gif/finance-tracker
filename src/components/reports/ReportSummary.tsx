import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import {
  FileText,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Utensils,
  Home,
  ShoppingBag,
  Car,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const ReportSummary: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('Last 6 Months');

  const timeframes = [
    'Last 30 Days',
    'Last 6 Months',
    'Year to Date (2023)',
    'Custom Range',
  ];

  // Cashflow comparison data matching Stitch screenshot exactly
  const cashflowData = [
    { month: 'May', income: 135000, expense: 69000, net: '+₹66k', isCurrent: false },
    { month: 'Jun', income: 138000, expense: 77000, net: '+₹61k', isCurrent: false },
    { month: 'Jul', income: 132000, expense: 81000, net: '+₹51k', isCurrent: false },
    { month: 'Aug', income: 148000, expense: 71000, net: '+₹77k', isCurrent: false },
    { month: 'Sep', income: 142000, expense: 76000, net: '+₹66k', isCurrent: false },
    { month: 'Oct', income: 148060, expense: 68340, net: '+₹79.7k', isCurrent: true },
  ];

  // Top spending categories from Stitch screenshot
  const topSpendingCategories = [
    {
      name: 'Food & Groceries',
      amount: '₹21,860',
      variance: '+18%',
      varianceType: 'bad', // red
      percent: 32.0,
      barColor: 'bg-rose-500',
      context: 'Target: ₹18,000',
      icon: Utensils,
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    },
    {
      name: 'Rent & Living',
      amount: '₹19,130',
      variance: '0%',
      varianceType: 'neutral', // gray
      percent: 28.0,
      barColor: 'bg-emerald-600',
      context: 'Fixed contractual',
      icon: Home,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      name: 'Shopping',
      amount: '₹9,560',
      variance: '-4%',
      varianceType: 'good', // green
      percent: 14.0,
      barColor: 'bg-emerald-600',
      context: 'Budget: ₹12,000',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      name: 'Transport & Fuel',
      amount: '₹8,200',
      variance: '+2%',
      varianceType: 'bad',
      percent: 12.0,
      barColor: 'bg-emerald-600',
      context: 'Budget: ₹9,000',
      icon: Car,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      name: 'Utilities & Bills',
      amount: '₹6,150',
      variance: '-6%',
      varianceType: 'good',
      percent: 9.0,
      barColor: 'bg-emerald-600',
      context: 'Avg: ₹6,500',
      icon: Zap,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
            Executive Analytics • FY 2023-24
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Financial Reports & Insights
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Deep dive into your cashflow trends, spending distribution, and AI-powered recommendations.
          </p>
        </div>

        {/* Controls: Timeframe Pills & PDF Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTimeframe === tf
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Smart Financial Insights & Recommendations Banner */}
      <div className="bg-[#eefbf6] dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#047857] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Smart Financial Insights & Recommendations
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Generated 2 hours ago using real-time transactional velocity
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a7f3d0] dark:bg-emerald-900/60 text-[#065f46] dark:text-emerald-300 text-[10px] font-black uppercase tracking-wide self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#047857] dark:bg-emerald-400 animate-pulse"></span>
            NEURAL MODEL ACTIVE
          </span>
        </div>

        {/* 3 Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Alert */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-100/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  Alert
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dining Variance
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You spent <span className="text-rose-600 font-bold">18% more</span> on dining out (₹21,860) than last month.
              </p>
            </div>

            <Link
              to="/budgets"
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-lg p-2.5 flex items-center justify-between text-[11px] mt-4 transition-colors group"
            >
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate mr-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Ordering 3 fewer times/week saves</span>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0 group-hover:underline">
                ₹6,500/mo ›
              </span>
            </Link>
          </div>

          {/* Card 2: Praise */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-100/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  Praise
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Savings Velocity
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Great job! Your savings rate reached <span className="text-emerald-600 font-bold">52.8%</span> in October, exceeding your benchmark.
              </p>
            </div>

            <Link
              to="/goals"
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-lg p-2.5 flex items-center gap-2 text-[11px] mt-4 transition-colors group"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                +2.8%
              </span>
              <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
                vs your standard 50% target profile.
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline">
                ›
              </span>
            </Link>
          </div>

          {/* Card 3: Opportunity */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-100/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  Opportunity
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upcoming Cycle
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Annual subscription renewal detected: <span className="font-bold text-slate-900 dark:text-slate-100">Cult.fit (₹14,990)</span> due on Nov 12.
              </p>
            </div>

            <Link
              to="/transactions"
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-1.5 text-[11px] mt-4 transition-colors group"
            >
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 truncate">
                  Auto-allocated under Recurring Bills.
                </span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline shrink-0">
                View ›
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Center Section: Cashflow Comparison & Top Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Monthly Cashflow Comparison (Col-span 2) */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ledger Trend
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Monthly Cashflow Comparison
                </h3>
              </div>

              {/* Legend matching Stitch */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#047857]"></span>
                  <span>Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#dc2626]"></span>
                  <span>Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#475569]"></span>
                  <span>Net Savings</span>
                </div>
              </div>
            </div>

            {/* Pill badges strip representing Net Surplus above each bar */}
            <div className="grid grid-cols-6 gap-2 mb-2 px-8">
              {cashflowData.map((d) => (
                <div key={d.month} className="flex justify-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-tight whitespace-nowrap shadow-xs ${
                      d.isCurrent
                        ? 'bg-[#d1fae5] text-[#065f46] border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d.net}
                  </span>
                </div>
              ))}
            </div>

            {/* Recharts Grouped Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cashflowData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    ticks={[0, 40000, 80000, 120000, 160000]}
                    domain={[0, 170000]}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl space-y-1">
                            <p className="font-bold border-b border-slate-700 pb-1">{label} 2023</p>
                            <p className="text-emerald-400">
                              Income: ₹{payload[0]?.value?.toLocaleString('en-IN')}
                            </p>
                            <p className="text-rose-400">
                              Expenses: ₹{payload[1]?.value?.toLocaleString('en-IN')}
                            </p>
                            <p className="text-slate-300 font-semibold pt-1 border-t border-slate-800">
                              Net: ₹{((payload[0]?.value as number || 0) - (payload[1]?.value as number || 0)).toLocaleString('en-IN')}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="income"
                    fill="#047857"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="expense"
                    fill="#dc2626"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Banner inside Monthly Cashflow Card */}
          <div className="bg-[#f0fdf4] dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Average Monthly Net Surplus across H2:{' '}
                <strong className="text-slate-900 dark:text-slate-100">₹66,780</strong>
              </span>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
              +14.3% vs H1 Benchmark ↑
            </span>
          </div>
        </Card>

        {/* Right: Top Spending Distribution */}
        <Card className="p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Distribution
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Top Spending
                </h3>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-md font-semibold">
                October
              </span>
            </div>

            {/* Total Expensed */}
            <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs text-slate-500">Total Expensed</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                ₹68,340
              </span>
            </div>

            {/* Category breakdown list */}
            <div className="space-y-3.5">
              {topSpendingCategories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${cat.iconBg}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {cat.amount}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${
                            cat.varianceType === 'bad'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                              : cat.varianceType === 'good'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {cat.variance}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.barColor}`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{cat.percent.toFixed(1)}% of total outlay</span>
                      <span>{cat.context}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row: 3 Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Solvency Health */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Solvency Health
              </span>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Healthy Status
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Debt-to-Income Ratio
            </h4>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                14.2%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                ✓ Under 30% Ceiling
              </span>
            </div>

            {/* Ceiling progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3 relative">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: '14.2%' }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Debt Servicing: ₹20,600/mo</span>
            <span className="font-medium text-emerald-600">85.8% Clean Capacity</span>
          </div>
        </Card>

        {/* Card 2: Liquidity Velocity */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Liquidity Velocity
              </span>
              <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                30 Day Rolling
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Average Daily Burn Rate
            </h4>

            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                ₹2,204
              </span>
              <span className="text-xs font-semibold text-slate-500">/ day</span>
            </div>

            <div className="mt-3 text-xs flex items-center justify-between text-slate-500">
              <span>Projected Month End</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">₹68,340</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            Runway remaining: 18.4 months of liquid emergency reserves
          </div>
        </Card>

        {/* Card 3: Asset Mix / Investment Allocation */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Asset Mix
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-md">
                ₹38.4L Total
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Investment Allocation
            </h4>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full flex overflow-hidden gap-0.5 mt-3 bg-slate-100 dark:bg-slate-800 p-0.5">
              <div className="bg-[#047857] h-full rounded-l-full" style={{ width: '40%' }} title="Fixed Deposits 40%" />
              <div className="bg-[#34d399] h-full" style={{ width: '35%' }} title="Mutual Funds 35%" />
              <div className="bg-[#818cf8] h-full" style={{ width: '15%' }} title="Direct Equity 15%" />
              <div className="bg-[#cbd5e1] h-full rounded-r-full" style={{ width: '10%' }} title="Gold & Cash 10%" />
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-1.5 mt-3 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                  <span className="text-slate-600 dark:text-slate-400">Fixed Deposits (FDs)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">40% <span className="text-slate-400 font-normal">(₹15.36L)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34d399]"></span>
                  <span className="text-slate-600 dark:text-slate-400">Mutual Funds (Equity)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">35% <span className="text-slate-400 font-normal">(₹13.44L)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#818cf8]"></span>
                  <span className="text-slate-600 dark:text-slate-400">Direct Equity (Stocks)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">15% <span className="text-slate-400 font-normal">(₹5.76L)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#cbd5e1]"></span>
                  <span className="text-slate-600 dark:text-slate-400">Sovereign Gold & Cash</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">10% <span className="text-slate-400 font-normal">(₹3.84L)</span></span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
