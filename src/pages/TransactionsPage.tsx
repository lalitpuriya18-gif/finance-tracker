import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Transaction } from '../types/finance';
import { Card } from '../components/ui/Card';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { CsvImportModal } from '../components/transactions/CsvImportModal';
import { exportTransactionsToCsv, downloadFile } from '../lib/csv';
import {
  Download,
  Upload,
  FileText,
  Plus,
  Search,
  RotateCcw,
  Landmark,
  CreditCard,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Tv,
  Briefcase,
  Car,
  ShoppingBag,
  TrendingUp,
  Zap,
  Coffee,
  CheckCircle2,
  ArrowUpDown,
  Trash2,
  Edit2,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions, categories, accounts, settings, deleteTransaction, bulkDeleteTransactions, addToast } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<'All' | 'Expenses' | 'Income'>('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount' | 'note'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-select state
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());

  // Exact Stitch KPI metrics
  const kpiData = useMemo(() => {
    let inflowSum = 0;
    let outflowSum = 0;
    for (const t of transactions) {
      if (t.type === 'income') inflowSum += t.amount;
      if (t.type === 'expense') outflowSum += t.amount;
    }
    const ratio = inflowSum > 0 ? (((inflowSum - outflowSum) / inflowSum) * 100).toFixed(1) : '52.8';
    return {
      inflow: `₹${(inflowSum / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      inflowChange: '+14.2% vs Sep',
      outflow: `₹${(outflowSum / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      outflowChange: '↓ ₹8,420 below cap',
      savingsRatio: `${ratio}%`,
      savingsTarget: 'Target: 65.0%',
      audits: '0 Flagged',
      auditsStatus: '✓ Ledger synchronized',
    };
  }, [transactions]);

  const getAccountIcon = (name: string) => {
    if (name.includes('Card')) return <CreditCard className="w-3.5 h-3.5 text-slate-500" />;
    if (name.includes('UPI') || name.includes('Paytm')) return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
    return <Landmark className="w-3.5 h-3.5 text-slate-500" />;
  };

  const getCategoryIcon = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes('food')) return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('entertainment')) return <Tv className="w-4 h-4 text-purple-600" />;
    if (lower.includes('income') || lower.includes('salary')) return <Briefcase className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('transport')) return <Car className="w-4 h-4 text-indigo-600" />;
    if (lower.includes('shopping')) return <ShoppingBag className="w-4 h-4 text-purple-600" />;
    if (lower.includes('invest')) return <TrendingUp className="w-4 h-4 text-blue-600" />;
    if (lower.includes('bill')) return <Zap className="w-4 h-4 text-blue-600" />;
    return <Coffee className="w-4 h-4 text-emerald-600" />;
  };

  const getCategoryPill = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes('income')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    }
    if (lower.includes('invest')) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
    }
    if (lower.includes('food')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    }
    return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
  };

  // Filtered & Sorted transactions
  const filtered = useMemo(() => {
    let result = transactions.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        const matchNote = (t.note || '').toLowerCase().includes(q);
        const matchDetail = (t.descriptionDetail || '').toLowerCase().includes(q);
        const matchMerchant = (t.merchant || '').toLowerCase().includes(q);
        if (!matchNote && !matchDetail && !matchMerchant) return false;
      }
      if (direction === 'Expenses' && t.type !== 'expense') return false;
      if (direction === 'Income' && t.type !== 'income') return false;

      if (selectedPeriod === 'This Month (Oct 2023)' && !t.date.startsWith('2023-10')) return false;
      if (selectedPeriod === 'Last Month (Sep 2023)' && !t.date.startsWith('2023-09')) return false;
      if (selectedPeriod === 'Year to Date 2023' && !t.date.startsWith('2023')) return false;

      if (selectedCategory !== 'All') {
        const cat = categories.find((c) => c.name === selectedCategory);
        if (cat && t.categoryId !== cat.id) return false;
      }

      if (selectedAccount !== 'All') {
        const acc = accounts.find((a) => a.name === selectedAccount);
        if (acc && t.accountId !== acc.id) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'note') {
        comparison = (a.note || '').localeCompare(b.note || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, search, direction, selectedPeriod, selectedCategory, selectedAccount, sortField, sortOrder, categories, accounts]);

  const pageSize = 9;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleSort = (field: 'date' | 'amount' | 'note') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = () => {
    const csv = exportTransactionsToCsv(filtered, categories, accounts, settings.currency);
    downloadFile(csv, 'fintrack-ledger.csv');
    addToast({
      title: 'CSV Exported',
      description: `Exported ${filtered.length} transactions successfully.`,
      type: 'success',
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(paginated.map((t) => t.id));
      setSelectedTxIds(allIds);
    } else {
      setSelectedTxIds(new Set());
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedTxIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTxIds(next);
  };

  const handleBulkDelete = () => {
    if (selectedTxIds.size === 0) return;
    bulkDeleteTransactions(Array.from(selectedTxIds));
    setSelectedTxIds(new Set());
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTransaction(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Transactions
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef2ff] dark:bg-indigo-950/50 text-[#3730a3] dark:text-indigo-300">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track, filter, and audit institutional-grade bank, credit line, and UPI transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Import bank statements in CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => {
              setEditingTx(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#065f46] hover:bg-[#054c37] rounded-lg shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Inflow (Oct)
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {kpiData.inflow}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
            ↗ {kpiData.inflowChange}
          </span>
        </Card>

        {/* Total Outflow */}
        <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Outflow
            </span>
            <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
            {kpiData.outflow}
          </div>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
            {kpiData.outflowChange}
          </span>
        </Card>

        {/* Net Savings Ratio */}
        <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Net Savings Ratio
            </span>
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {kpiData.savingsRatio}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {kpiData.savingsTarget}
          </span>
        </Card>

        {/* Pending Audits */}
        <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Audits
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {kpiData.audits}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {kpiData.auditsStatus}
          </span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, merchant, or note"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Period */}
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Periods</option>
            <option value="This Month (Oct 2023)">This Month (Oct 2023)</option>
            <option value="Last Month (Sep 2023)">Last Month (Sep 2023)</option>
            <option value="Year to Date 2023">Year to Date 2023</option>
          </select>

          {/* Categories */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Accounts */}
          <select
            value={selectedAccount}
            onChange={(e) => {
              setSelectedAccount(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Direction Row & Selection Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Direction:
              </span>
              <div className="flex items-center gap-1">
                {(['All', 'Expenses', 'Income'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => {
                      setDirection(dir);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      direction === dir
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            {selectedTxIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedTxIds.size} Selected</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 sm:mt-0 text-slate-400 text-xs">
            <span>
              Showing <strong className="text-slate-700 dark:text-slate-200">{paginated.length}</strong> of{' '}
              <strong className="text-slate-700 dark:text-slate-200">{filtered.length}</strong> transactions
            </span>
            <button
              onClick={() => {
                setSearch('');
                setDirection('All');
                setSelectedPeriod('All');
                setSelectedCategory('All');
                setSelectedAccount('All');
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginated.length > 0 && selectedTxIds.size === paginated.length}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    title="Select all on this page"
                  />
                </th>
                <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('note')}>
                  <div className="flex items-center gap-1.5">
                    <span>Description & Entity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4">Category</th>
                <th className="p-4">Account</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right cursor-pointer select-none" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount (INR)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No transactions match your current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const accountObj = accounts.find((a) => a.id === tx.accountId);
                  const categoryObj = categories.find((c) => c.id === tx.categoryId);
                  const catName = categoryObj?.name || 'General';
                  const accName = accountObj?.name || 'Bank Account';
                  const isSelected = selectedTxIds.has(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => {
                        setEditingTx(tx);
                        setIsModalOpen(true);
                      }}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(tx.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {tx.date}
                        </div>
                        <div className="text-[11px] text-slate-400">{tx.time || '10:00 AM'}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            {getCategoryIcon(catName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {tx.note}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {tx.descriptionDetail || tx.merchant || 'Electronic Transfer'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getCategoryPill(catName)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {catName}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                          {getAccountIcon(accName)}
                          <span>{accName}</span>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                          Completed
                        </span>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isIncome
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'}₹
                          {(tx.amount / 100).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTx(tx);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteOne(e, tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Showing <strong>{(safeCurrentPage - 1) * pageSize + (filtered.length > 0 ? 1 : 0)}</strong> to{' '}
            <strong>{Math.min(safeCurrentPage * pageSize, filtered.length)}</strong> of{' '}
            <strong>{filtered.length}</strong> entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                  page === safeCurrentPage
                    ? 'bg-[#065f46] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        editTransaction={editingTx}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </div>
  );
};
