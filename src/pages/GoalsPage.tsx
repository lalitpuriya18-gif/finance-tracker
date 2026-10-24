import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { GoalModal } from '../components/goals/GoalModal';
import { ContributionModal } from '../components/goals/ContributionModal';
import { Goal } from '../types/finance';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatMoney } from '../lib/currency';
import {
  CreditCard,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Palmtree,
  Shield,
  Laptop,
  Coins,
  Rocket,
  MoreVertical,
  ArrowRight,
  X,
  Play,
  Pause,
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { goals, mandates: storeMandates, settings, deleteGoal, toggleMandate, addToast } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const currentMandates = storeMandates || [];

  const handleToggleMandate = (id: string) => {
    toggleMandate(id);
    const target = currentMandates.find((m) => m.id === id);
    const newStatus = target?.status === 'Active' ? 'Paused' : 'Active';
    addToast({
      title: `Mandate ${newStatus}`,
      description: `${target?.goalName || 'Mandate'} has been ${newStatus.toLowerCase()}.`,
      type: newStatus === 'Active' ? 'success' : 'info',
    });
  };

  const handleRebalanceRules = () => {
    addToast({
      title: 'Mandates Optimized',
      description: 'Synchronized recurring debit schedules with linked bank accounts.',
      type: 'success',
    });
  };

  const getGoalIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('goa') || lower.includes('travel') || lower.includes('vacation')) return Palmtree;
    if (lower.includes('emergency') || lower.includes('shield')) return Shield;
    if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('tech')) return Laptop;
    if (lower.includes('gold') || lower.includes('bond') || lower.includes('coin')) return Coins;
    return Rocket;
  };

  // Dynamic Goal Cards derived from useFinanceStore.goals
  const activeGoalCards = useMemo(() => {
    return goals.map((g) => {
      const percent = g.targetAmount > 0 ? Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100) : 0;
      const remainingPaise = Math.max(0, g.targetAmount - g.savedAmount);
      const Icon = getGoalIcon(g.name);

      let iconClass = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
      let badgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';

      const lower = g.name.toLowerCase();
      if (lower.includes('goa') || lower.includes('gold')) {
        iconClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';
        badgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
      } else if (lower.includes('macbook') || lower.includes('laptop')) {
        iconClass = 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400';
        badgeClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400';
      } else if (lower.includes('angel') || lower.includes('syndicate')) {
        iconClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
        badgeClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      }

      return {
        id: g.id,
        rawGoal: g,
        title: g.name,
        subtitle: g.subtitle || `Target: ${g.targetDate}`,
        icon: Icon,
        iconClass,
        badge: g.priority ? `${g.priority} PRIORITY` : 'ACTIVE GOAL',
        badgeClass,
        current: formatMoney(g.savedAmount, settings.currency),
        target: formatMoney(g.targetAmount, settings.currency),
        percent,
        percentText: `${percent}% FUNDED`,
        remainingText: `${formatMoney(remainingPaise, settings.currency)} remaining`,
        subInfo1: 'Deduction Source:',
        subInfo2: g.fundingMethod || 'Bank Auto-Debit',
        paceBadge: g.paceStatusText || undefined,
        buttonText: 'Contribute',
        hasEditBtn: true,
      };
    });
  }, [goals, settings]);

  const totalCapitalAllocated = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.savedAmount, 0);
  }, [goals]);

  const cumulativeTarget = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.targetAmount, 0);
  }, [goals]);

  const percentMet = cumulativeTarget > 0 ? ((totalCapitalAllocated / cumulativeTarget) * 100).toFixed(2) : '0';

  const monthlyRunRate = useMemo(() => {
    return goals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0);
  }, [goals]);

  const { completedGoals, completedAmount } = useMemo(() => {
    const list = goals.filter((g) => g.savedAmount >= g.targetAmount && g.targetAmount > 0);
    const amount = list.reduce((sum, g) => sum + g.savedAmount, 0);
    return { completedGoals: list, completedAmount: amount };
  }, [goals]);

  const handleOpenContribute = (goal: Goal) => {
    setContributeGoal(goal);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Wealth Targets • Live Ledger</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Savings Goals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set institutional-grade financial targets, monitor automated liquidation milestones, and accelerate your personal net worth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRebalanceRules}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Rebalance Rules</span>
          </button>

          <button
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#065f46] hover:bg-[#054c37] rounded-lg shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Capital Allocated */}
        <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Capital Allocated
            </span>
            <div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatMoney(totalCapitalAllocated, settings.currency)}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
              {goals.length > 0 ? `↗ Active across ${goals.length} portfolio reserves` : 'No active goals'}
            </span>
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between font-medium">
            <span>Cumulative Target: {formatMoney(cumulativeTarget, settings.currency)}</span>
            <span className="text-emerald-600 font-bold">{percentMet}% Met</span>
          </div>
        </Card>

        {/* Monthly Run-Rate */}
        <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Monthly Run-Rate
            </span>
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatMoney(monthlyRunRate, settings.currency)} <span className="text-sm text-slate-400 font-semibold">/mo</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-semibold text-[10px]">
              {monthlyRunRate > 0 ? 'Automated SIP' : 'Discretionary'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {goals.length > 0 ? `Across ${goals.length} target portfolios` : 'No recurring SIPs active'}
            </span>
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between font-medium">
            <span>Primary Source: Linked Accounts</span>
            <span className="text-emerald-600 font-bold">{goals.length > 0 ? 'Configured' : 'Awaiting Targets'}</span>
          </div>
        </Card>

        {/* Milestones Realized */}
        <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Milestones Realized
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {completedGoals.length} {completedGoals.length === 1 ? 'Goal' : 'Goals'} <span className="text-sm text-slate-400 font-normal">fulfilled</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {completedAmount > 0 ? (
              <><strong className="text-slate-700 dark:text-slate-300">{formatMoney(completedAmount, settings.currency)}</strong> achieved and secured</>
            ) : (
              <span>No completed goals yet. Keep saving!</span>
            )}
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between font-medium">
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              View Archive Ledger ›
            </button>
            <span>Target completion</span>
          </div>
        </Card>
      </div>

      {/* Goals Grid (3 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeGoalCards.map((g) => {
          const Icon = g.icon;
          const isMenuOpen = activeMenuId === g.id;

          return (
            <Card
              key={g.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${g.iconClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {g.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{g.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 relative">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${g.badgeClass}`}>
                      {g.badge}
                    </span>
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : g.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                      title="Goal actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-20 text-xs space-y-0.5">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            handleOpenContribute(g.rawGoal);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Contribute
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            handleOpenEdit(g.rawGoal);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Edit Target
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            deleteGoal(g.id);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        >
                          Delete Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balances */}
                <div className="flex justify-between items-baseline mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Current Balance</span>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {g.current}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px]">Target Cap</span>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {g.target}
                    </div>
                  </div>
                </div>

                {/* Segmented Progress Bar */}
                <div className="space-y-1 my-3">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-emerald-700 dark:text-emerald-400">{g.percentText}</span>
                    <span className="text-slate-400">{g.remainingText}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${g.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>Target 100%</span>
                  </div>
                </div>

                {/* Sub info */}
                <div className="py-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{g.subInfo1}</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {g.subInfo2}
                    </span>
                  </div>
                  {g.paceBadge && (
                    <div className="text-[11px] font-semibold text-emerald-600 pt-1">
                      {g.paceBadge}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleOpenContribute(g.rawGoal)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                >
                  {g.buttonText}
                </button>
                {g.hasEditBtn && (
                  <button
                    onClick={() => handleOpenEdit(g.rawGoal)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Edit Goal
                  </button>
                )}
              </div>
            </Card>
          );
        })}

        {/* Create Custom Goal Card */}
        <Card
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all min-h-[300px]"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center mb-3">
            <Plus className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Create Custom Goal
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
            Define an emergency reserve, luxury acquisition, or venture capital milestone with automated rules.
          </p>
          <span className="mt-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            Setup New Milestone <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Card>
      </div>

      {/* Automated Savings Distribution Table */}
      <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Automated Savings Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled monthly debits across your designated savings buckets
            </p>
          </div>

          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#eef2ff] dark:bg-indigo-950/50 text-[#3730a3] dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            {currentMandates.length} Registered {currentMandates.length === 1 ? 'Mandate' : 'Mandates'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Goal Name</th>
                <th className="p-3">Mandate Type</th>
                <th className="p-3">Cycle Date</th>
                <th className="p-3">Monthly Allocation</th>
                <th className="p-3">Est. Completion</th>
                <th className="p-3 text-right">Mandate Status</th>
                <th className="p-3 text-center">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentMandates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No active automated mandates. Set up SIP debits or auto-sweeps when creating savings goals.
                  </td>
                </tr>
              ) : (
                currentMandates.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{m.goalName}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{m.mandateType}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{m.cycleDate}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatMoney(m.monthlyAllocation, settings.currency)}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{m.estCompletion}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleMandate(m.id)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                      title={m.status === 'Active' ? 'Pause Mandate' : 'Activate Mandate'}
                    >
                      {m.status === 'Active' ? (
                        <Pause className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Archive Ledger Modal */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                2023 Realized Goals Archive
              </h3>
              <button
                onClick={() => setIsArchiveOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">iPhone 15 Pro Max</p>
                  <p className="text-[11px] text-slate-400">Fulfilled in Aug 2023</p>
                </div>
                <span className="font-bold text-emerald-600">₹1,40,000</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Monsoon Trekking Gear</p>
                  <p className="text-[11px] text-slate-400">Fulfilled in Jul 2023</p>
                </div>
                <span className="font-bold text-emerald-600">₹25,000</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Vehicle Insurance Lumpsum</p>
                  <p className="text-[11px] text-slate-400">Fulfilled in May 2023</p>
                </div>
                <span className="font-bold text-emerald-600">₹30,000</span>
              </div>
            </div>

            <button
              onClick={() => setIsArchiveOpen(false)}
              className="w-full py-2 text-xs font-bold text-white bg-[#065f46] hover:bg-[#054c37] rounded-xl transition-colors"
            >
              Close Archive
            </button>
          </div>
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        editGoal={editingGoal}
      />

      <ContributionModal
        isOpen={Boolean(contributeGoal)}
        onClose={() => setContributeGoal(null)}
        goal={contributeGoal}
      />
    </div>
  );
};
