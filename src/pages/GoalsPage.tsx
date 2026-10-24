import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { GoalModal } from '../components/goals/GoalModal';
import { ContributionModal } from '../components/goals/ContributionModal';
import { Goal } from '../types/finance';
import { useFinanceStore } from '../store/useFinanceStore';
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
  const { addToast } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const [mandates, setMandates] = useState([
    {
      id: 'm-1',
      name: 'Emergency Reserve SIP',
      type: 'Auto-Debit (ICICI)',
      date: '1st of every month',
      allocation: '₹20,000.00',
      completion: 'Feb 2024 (4 mos)',
      status: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'm-2',
      name: 'Goa Getaway Sweep',
      type: 'Weekly Auto-Sweep',
      date: 'Every Monday',
      allocation: '₹2,500.00',
      completion: 'Dec 2023 (6 wks)',
      status: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'm-3',
      name: 'MacBook Pro Tech Fund',
      type: 'Salary Day Mandate',
      date: '28th of every month',
      allocation: '₹15,000.00',
      completion: 'Jan 2024 (3 mos)',
      status: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'm-4',
      name: 'Angel Syndicate Sinking Fund',
      type: 'Discretionary Surplus',
      date: 'Bi-Monthly',
      allocation: '₹10,000.00',
      completion: 'Mar 2024 (5 mos)',
      status: 'Paused',
      statusClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    },
  ]);

  const handleToggleMandate = (id: string) => {
    setMandates((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStatus = m.status === 'Active' ? 'Paused' : 'Active';
          addToast({
            title: `Mandate ${newStatus}`,
            description: `${m.name} has been ${newStatus.toLowerCase()}.`,
            type: newStatus === 'Active' ? 'success' : 'info',
          });
          return {
            ...m,
            status: newStatus,
            statusClass:
              newStatus === 'Active'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
          };
        }
        return m;
      })
    );
  };

  const handleRebalanceRules = () => {
    addToast({
      title: 'Mandates Optimized',
      description: 'Synchronized 4 recurring debit schedules with linked ICICI Salary Account.',
      type: 'success',
    });
  };

  // 5 Goal Cards matching Stitch screenshot
  const goalCards = [
    {
      id: 'g-1',
      title: 'Goa Luxury Getaway',
      subtitle: 'Target: Dec 2023 • 6 weeks left',
      icon: Palmtree,
      iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      badge: 'HIGH PRIORITY',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      current: '₹85,000',
      target: '₹1,20,000',
      percent: 71,
      percentText: '71% FUNDED',
      remainingText: '₹35,000 remaining',
      subInfo1: 'Weekly SIP Required:',
      subInfo2: '₹5,833 / wk',
      subInfo2Alert: true,
      buttonText: 'Contribute',
      hasEditBtn: true,
    },
    {
      id: 'g-2',
      title: 'Emergency Fund (6 Months)',
      subtitle: 'Target: Mar 2024 • 5 months left',
      icon: Shield,
      iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      badge: 'CRITICAL SHIELD',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      current: '₹4,50,000',
      target: '₹6,00,000',
      percent: 75,
      percentText: '75% FUNDED',
      remainingText: '₹1,50,000 remaining',
      subInfo1: 'Monthly Allocation:',
      subInfo2: '₹30,000 / mo',
      sipText: 'Next SIP Deduction:',
      sipVal: 'Nov 01 (₹30k)',
      buttonText: 'Deposit Funds',
      hasEditBtn: false,
    },
    {
      id: 'g-3',
      title: 'MacBook Pro M3 Max',
      subtitle: 'Target: Jan 2024 • 3 months left',
      icon: Laptop,
      iconClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
      badge: 'HARDWARE UPGRADE',
      badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
      current: '₹1,90,000',
      target: '₹2,50,000',
      percent: 76,
      percentText: '76% FUNDED',
      remainingText: '₹60,000 remaining',
      subInfo1: 'Deduction Source:',
      subInfo2: 'ICICI Salary A/c',
      paceBadge: '⚡ 12 days ahead of pace schedule',
      buttonText: 'Contribute',
      hasEditBtn: true,
    },
    {
      id: 'g-4',
      title: 'Sovereign Gold Bonds (Tranche IV)',
      subtitle: 'Target: Nov 2023 • 3 weeks left',
      icon: Coins,
      iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      badge: 'SOVEREIGN ASSET',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      current: '₹1,50,000',
      target: '₹2,00,000',
      percent: 75,
      percentText: '75% FUNDED',
      remainingText: '₹50,000 remaining',
      subInfo1: 'RBI Issue Window:',
      subInfo2: 'Nov 20 - Nov 24',
      subInfo2Alert: true,
      buttonText: 'Lock In',
      hasEditBtn: false,
    },
    {
      id: 'g-5',
      title: 'Angel Syndicate Allocation',
      subtitle: 'Target: Jun 2024 • 8 months left',
      icon: Rocket,
      iconClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      badge: 'ALTERNATIVE ASSET',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      current: '₹50,000',
      target: '₹1,00,000',
      percent: 50,
      percentText: '50% FUNDED',
      remainingText: '₹50,000 remaining',
      subInfo1: 'Deal Syndicate:',
      subInfo2: 'Fintech Seed Pool',
      renewalText: 'Capital Call Deadline:',
      renewalVal: 'Jun 30, 2024',
      buttonText: 'Allocate',
      hasEditBtn: false,
    },
  ];

  const handleOpenContribute = (card: typeof goalCards[0]) => {
    const rawTarget = parseInt(card.target.replace(/[^0-9]/g, '')) * 100;
    const rawSaved = parseInt(card.current.replace(/[^0-9]/g, '')) * 100;

    setContributeGoal({
      id: card.id,
      name: card.title,
      targetAmount: rawTarget,
      savedAmount: rawSaved,
      targetDate: '2024-03-31',
    });
  };

  const handleOpenEdit = (card: typeof goalCards[0]) => {
    const rawTarget = parseInt(card.target.replace(/[^0-9]/g, '')) * 100;
    const rawSaved = parseInt(card.current.replace(/[^0-9]/g, '')) * 100;

    setEditingGoal({
      id: card.id,
      name: card.title,
      targetAmount: rawTarget,
      savedAmount: rawSaved,
      targetDate: '2024-03-31',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Wealth Targets • Q4 2023 Review</span>
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
            ₹3,45,000<span className="text-sm text-slate-400 font-semibold">.00</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
              ↗ +18.4% across 5 active portfolio reserves
            </span>
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between font-medium">
            <span>Cumulative Target: ₹12,75,000</span>
            <span className="text-emerald-600 font-bold">27.05% Met</span>
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
            ₹35,000 <span className="text-sm text-slate-400 font-semibold">/mo</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-semibold text-[10px]">
              Automated SIP
            </span>
            <span className="text-slate-400 text-[11px]">Next deduction Nov 01 (in 6 days)</span>
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between font-medium">
            <span>Primary Source: HDFC Salary A/c</span>
            <span className="text-emerald-600 font-bold">100% On Schedule</span>
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
            3 Goals <span className="text-sm text-slate-400 font-normal">fulfilled in 2023</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">₹1,95,000</strong> liquidated for debt reduction & taxes
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between font-medium">
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              View Archive Ledger ›
            </button>
            <span>Avg speed: 4.8 mos</span>
          </div>
        </Card>
      </div>

      {/* Goals Grid (3 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goalCards.map((g) => {
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
                            handleOpenContribute(g);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Contribute
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            handleOpenEdit(g);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Edit Target
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
                    <span className={`font-semibold ${g.subInfo2Alert ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                      {g.subInfo2}
                    </span>
                  </div>
                  {g.sipText && (
                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-slate-400">{g.sipText}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {g.sipVal}
                      </span>
                    </div>
                  )}
                  {g.paceBadge && (
                    <div className="text-[11px] font-semibold text-emerald-600 pt-1">
                      {g.paceBadge}
                    </div>
                  )}
                  {g.renewalText && (
                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-slate-400">{g.renewalText}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {g.renewalVal}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleOpenContribute(g)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                >
                  {g.buttonText}
                </button>
                {g.hasEditBtn && (
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Edit Goal
                  </button>
                )}
              </div>
            </Card>
          );
        })}

        {/* 6th Card: Create Custom Goal */}
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
            ICICI NetBanking Connected
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
              {mandates.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{m.name}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{m.type}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{m.date}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {m.allocation}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{m.completion}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.statusClass}`}>
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
              ))}
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
        onClose={() => setIsModalOpen(false)}
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
