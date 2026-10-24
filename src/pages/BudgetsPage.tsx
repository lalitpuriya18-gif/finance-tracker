import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Tv,
  HeartPulse,
  MoreVertical,
  Clock,
  AlertTriangle,
  Compass,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { formatMoney } from '../lib/currency';

export const BudgetsPage: React.FC = () => {
  const { budgets, categories, transactions, settings, deleteBudget, addToast } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState<number | undefined>(undefined);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Food & Dining');

  // Filter & Sort state
  const [statusFilter, setStatusFilter] = useState<'all' | 'exceeded' | 'warning'>('all');
  const [sortByUtilization, setSortByUtilization] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Month navigation
  const months = ['September 2023', 'October 2023', 'November 2023'];
  const [monthIndex, setMonthIndex] = useState(1);

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('food') || lower.includes('dining')) return Utensils;
    if (lower.includes('transport') || lower.includes('commute')) return Car;
    if (lower.includes('shopping')) return ShoppingBag;
    if (lower.includes('util') || lower.includes('power') || lower.includes('bill')) return Zap;
    if (lower.includes('entertain') || lower.includes('ott')) return Tv;
    if (lower.includes('health') || lower.includes('well')) return HeartPulse;
    return ShoppingBag;
  };

  // Dynamic Category budgets from useFinanceStore
  const rawBudgetList = useMemo(() => {
    if (!budgets || budgets.length === 0) return [];

    return budgets.map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const catName = cat ? cat.name : 'Category';
      const icon = getCategoryIcon(catName);

      const catTxs = transactions.filter((t) => t.type === 'expense' && t.categoryId === b.categoryId);
      const disbursedPaise = catTxs.reduce((sum, t) => sum + t.amount, 0);
      const limitPaise = b.monthlyLimit;
      const remainingPaise = limitPaise - disbursedPaise;
      const percent = limitPaise > 0 ? Math.round((disbursedPaise / limitPaise) * 100) : 0;
      const isOver = percent > 100;
      const isWarning = percent >= 85 && !isOver;

      const dailyAllowance = remainingPaise > 0 ? Math.round(remainingPaise / 6) : 0;

      let statusBadge = 'On Track';
      let statusClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      if (isOver) {
        statusBadge = 'Over Limit';
        statusClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';
      } else if (isWarning) {
        statusBadge = 'Near Limit';
        statusClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';
      } else if (percent < 30) {
        statusBadge = 'Well Managed';
      }

      return {
        id: b.id,
        categoryId: b.categoryId,
        monthlyLimitPaise: b.monthlyLimit,
        disbursedPaise,
        remainingPaise,
        title: catName,
        subtitle: `${catTxs.length} logged transactions`,
        icon,
        statusBadge,
        statusClass,
        percent,
        percentText: isOver ? `${percent}% CRITICAL` : `${percent}%`,
        ringColor: isOver || isWarning ? '#dc2626' : '#047857',
        limit: formatMoney(limitPaise, settings.currency),
        disbursed: formatMoney(disbursedPaise, settings.currency),
        remaining: formatMoney(remainingPaise, settings.currency),
        dailyText: isOver ? 'Discretionary freeze:' : 'Daily safe allowance:',
        dailyVal: isOver ? 'Recommended' : `${formatMoney(dailyAllowance, settings.currency)} / day`,
        valIsWarning: isOver || isWarning,
        isAlert: isOver,
        alertBanner: `⚠️ Exceeded by ${formatMoney(Math.abs(remainingPaise), settings.currency)} (Deficit absorbed by buffer)`,
        primaryBtnText: isOver ? 'Review Overrun' : '+ Add Expense',
        primaryBtnClass: isOver ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100' : undefined,
      };
    });
  }, [budgets, categories, transactions, settings]);

  const portfolioMetrics = useMemo(() => {
    const totalAllocated = rawBudgetList.reduce((s, b) => s + b.monthlyLimitPaise, 0);
    const totalDisbursed = rawBudgetList.reduce((s, b) => s + b.disbursedPaise, 0);
    const buffer = totalAllocated - totalDisbursed;
    const util = totalAllocated > 0 ? ((totalDisbursed / totalAllocated) * 100).toFixed(1) : '0.0';
    return {
      allocated: formatMoney(totalAllocated, settings.currency),
      disbursed: formatMoney(totalDisbursed, settings.currency),
      buffer: formatMoney(buffer, settings.currency),
      utilPercent: `${util}%`,
      utilRaw: Number(util),
      enrolledCount: rawBudgetList.length,
    };
  }, [rawBudgetList, settings]);

  // Burn rate trajectory data matching the chart
  const burnRateData = [
    { day: 'Day 1 (Oct 1)', target: 2700, actual: 2300 },
    { day: 'Day 10', target: 27000, actual: 24500 },
    { day: 'Day 20', target: 54000, actual: 48000 },
    { day: 'Day 25 (Today)', target: 68500, actual: 58320 },
    { day: 'Day 31 (Cycle End)', target: 85000, actual: null },
  ];

  // Filtered & Sorted Budgets
  const budgetList = useMemo(() => {
    let list = rawBudgetList.filter((b) => {
      if (statusFilter === 'exceeded') return b.percent >= 100 || b.isAlert;
      if (statusFilter === 'warning') return b.percent >= 80 || b.isAlert;
      return true;
    });

    if (sortByUtilization) {
      list.sort((a, b) => b.percent - a.percent);
    }
    return list;
  }, [statusFilter, sortByUtilization]);

  const handlePrevMonth = () => {
    const nextIdx = Math.max(0, monthIndex - 1);
    setMonthIndex(nextIdx);
    addToast({
      title: 'Budget Period Changed',
      description: `Now viewing budget allocation for ${months[nextIdx]}.`,
      type: 'info',
    });
  };

  const handleNextMonth = () => {
    const nextIdx = Math.min(months.length - 1, monthIndex + 1);
    setMonthIndex(nextIdx);
    addToast({
      title: 'Budget Period Changed',
      description: `Now viewing budget allocation for ${months[nextIdx]}.`,
      type: 'info',
    });
  };

  const handleAutoRebalance = () => {
    addToast({
      title: 'Portfolio Rebalanced',
      description: 'Reallocated ₹1,500 discretionary buffer from Health & Wellness into Shopping. Zero deficit projected.',
      type: 'success',
    });
  };

  const handleOpenAddExpense = (catTitle: string) => {
    setSelectedCategoryName(catTitle);
    setIsExpenseOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Financial Planning • Live Ledger</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Monthly Budgets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage and monitor your spending limits for {months[monthIndex]}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month selector */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              disabled={monthIndex === 0}
              className="p-0.5 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 min-w-[100px] text-center">{months[monthIndex]}</span>
            <button
              onClick={handleNextMonth}
              disabled={monthIndex === months.length - 1}
              className="p-0.5 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Budgets
            </button>
            <button
              onClick={() => setStatusFilter('exceeded')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'exceeded'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Exceeded
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'warning'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Warning
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#065f46] hover:bg-[#054c37] rounded-lg shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Monthly Portfolio Cap Card */}
      <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center font-bold">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Monthly Portfolio Cap
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#eef2ff] text-[#3730a3] rounded-full">
                  Active Period
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>6 days remaining in billing cycle • Resets Nov 01</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Allocation
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {portfolioMetrics.allocated}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">{portfolioMetrics.enrolledCount} Active category ceilings</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Disbursed
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {portfolioMetrics.disbursed} <span className="text-sm text-slate-400 font-semibold">{portfolioMetrics.utilPercent}</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Velocity: active billing cycle</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Buffer Available
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {portfolioMetrics.buffer}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Safe margin remaining</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Aggregated Budget Utilization</span>
            <span>{portfolioMetrics.utilPercent} Expended</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                portfolioMetrics.utilRaw > 100 ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(portfolioMetrics.utilRaw, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Spent: {portfolioMetrics.disbursed}</span>
            <span className={portfolioMetrics.utilRaw > 100 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {portfolioMetrics.utilRaw > 100 ? 'Exceeded Budget' : 'Safe Margin Remaining'}
            </span>
            <span>Limit: {portfolioMetrics.allocated}</span>
          </div>
        </div>
      </Card>

      {/* Category Allocations Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Category Allocations
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
            {budgetList.length} Enrolled
          </span>
        </div>

        <button
          onClick={() => setSortByUtilization(!sortByUtilization)}
          className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
            sortByUtilization
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
              : 'text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800'
          }`}
          title="Toggle sorting by utilization percentage"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{sortByUtilization ? 'Sorted by Utilization ↓' : 'Sort by Utilization'}</span>
        </button>
      </div>

      {/* Category Allocation Cards Grid */}
      {budgetList.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
          <SlidersHorizontal className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Category Budgets Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Set monthly spending limits for categories like Food, Utilities, Shopping, or Transport to stay within your targets.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#065f46] hover:bg-[#054c37] rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Budget</span>
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetList.map((item) => {
          const Icon = item.icon;
          const radius = 24;
          const stroke = 4;
          const circum = 2 * Math.PI * radius;
          const offset = circum - (item.percent / 100) * circum;
          const isMenuOpen = activeMenuId === item.id;

          return (
            <Card
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 relative">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.statusClass}`}>
                      {item.statusBadge}
                    </span>
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                      title="More actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Card Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-6 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-20 text-xs space-y-0.5">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setEditingCategoryId(item.categoryId);
                            setCurrentLimit(item.monthlyLimitPaise);
                            setIsModalOpen(true);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Adjust Limit
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            handleOpenAddExpense(item.title);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Log Expense
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            deleteBudget(item.id);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        >
                          Delete Budget
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Circular Percentage and Values */}
                <div className="flex items-center gap-5 my-4">
                  {/* Gauge */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg width="56" height="56" className="transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        stroke="#f1f5f9"
                        strokeWidth={stroke}
                        fill="transparent"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        stroke={item.ringColor}
                        strokeWidth={stroke}
                        strokeDasharray={circum}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                      {item.percentText}
                    </div>
                  </div>

                  {/* Limit / Disbursed / Remaining */}
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Limit</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {item.limit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disbursed</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {item.disbursed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Remaining</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {item.remaining}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alert banner or Daily allowance */}
                {item.isAlert ? (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-semibold text-center mb-3">
                    {item.alertBanner}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 text-xs mb-3">
                    <span className="text-slate-400 text-[11px]">{item.dailyText}</span>
                    <span
                      className={`font-semibold tabular-nums text-[11px] ${
                        item.valIsWarning ? 'text-rose-600 font-bold' : 'text-emerald-600'
                      }`}
                    >
                      {item.dailyVal}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleOpenAddExpense(item.title)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    item.primaryBtnClass ||
                    'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {item.primaryBtnText || '+ Add Expense'}
                </button>
                <button
                  onClick={() => {
                    setEditingCategoryId(item.categoryId);
                    setCurrentLimit(item.monthlyLimitPaise);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Edit Limit
                </button>
              </div>
            </Card>
          );
        })}
        </div>
      )}

      {/* Bottom Section: Spend Velocity Chart (2/3) + Advisory Insights (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Burn Rate Trajectory Chart */}
        <Card className="lg:col-span-2 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Burn Rate Trajectory
            </span>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Expected vs Actual Spend Velocity
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
                  <span>Target Pace</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Current Spend</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burnRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#047857"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#047857' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Budget Health Diagnostics */}
        <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Compass className="w-4 h-4" />
              <span>Advisory Insights</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              Budget Health Diagnostics
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Your overall cash outflow remains disciplined with 4 of 6 categories sustaining healthy margins.
            </p>

            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Shopping Overhang
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Reallocate ₹1,500 from Health & Wellness to maintain equilibrium without deficit.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Projected Savings
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    At the current run-rate, ₹18,400 will transition into high-yield deposits on Nov 01.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleAutoRebalance}
              className="w-full py-2.5 px-4 bg-[#f0f4ff] hover:bg-[#e0e7ff] dark:bg-indigo-950/40 text-[#3730a3] dark:text-indigo-300 font-semibold text-xs rounded-xl transition-colors shadow-2xs active:scale-[0.99]"
            >
              Auto-Rebalance Limits
            </button>
          </div>
        </Card>
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategoryId(null);
          setCurrentLimit(undefined);
        }}
        editCategoryId={editingCategoryId}
        currentLimit={currentLimit}
      />

      <TransactionModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
      />
    </div>
  );
};
