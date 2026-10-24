import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Transaction } from '../../types/finance';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatMoney } from '../../lib/currency';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from 'lucide-react';

interface TransactionTableProps {
  onEdit: (tx: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ onEdit }) => {
  const {
    transactions,
    categories,
    accounts,
    settings,
    searchQuery,
    filterCategory,
    filterAccount,
    filterType,
    startDate,
    endDate,
    sortField,
    sortOrder,
    setSort,
    deleteTransaction,
    bulkDeleteTransactions,
  } = useFinanceStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const noteMatch = (t.note || '').toLowerCase().includes(q);
        const merchantMatch = (t.merchant || '').toLowerCase().includes(q);
        const tagMatch = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        const cat = categoryMap.get(t.categoryId);
        const catMatch = (cat?.name || '').toLowerCase().includes(q);
        if (!noteMatch && !merchantMatch && !tagMatch && !catMatch) return false;
      }

      // Category
      if (filterCategory !== 'all' && t.categoryId !== filterCategory) {
        return false;
      }

      // Account
      if (filterAccount !== 'all' && t.accountId !== filterAccount && t.toAccountId !== filterAccount) {
        return false;
      }

      // Type
      if (filterType !== 'all' && t.type !== filterType) {
        return false;
      }

      // Date range
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      return true;
    });
  }, [transactions, searchQuery, filterCategory, filterAccount, filterType, startDate, endDate, categoryMap]);

  // Sorting
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') {
        comp = a.date.localeCompare(b.date);
      } else if (sortField === 'amount') {
        comp = a.amount - b.amount;
      } else if (sortField === 'note') {
        comp = (a.note || '').localeCompare(b.note || '');
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  const handleSortToggle = (field: 'date' | 'amount' | 'note') => {
    if (sortField === field) {
      setSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field, 'desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedTransactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDeleteTransactions(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      {/* Table Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong>{filteredTransactions.length}</strong> entries
          </span>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedIds.length} selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Page selector */}
        <div className="flex items-center gap-2">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3 w-8 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    paginatedTransactions.length > 0 &&
                    selectedIds.length === paginatedTransactions.length
                  }
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th
                className="p-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                onClick={() => handleSortToggle('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                onClick={() => handleSortToggle('note')}
              >
                <div className="flex items-center gap-1">
                  <span>Description / Payee</span>
                  {sortField === 'note' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-emerald-500" />
                  )}
                </div>
              </th>
              <th className="p-3">Category</th>
              <th className="p-3">Account</th>
              <th
                className="p-3 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                onClick={() => handleSortToggle('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  {sortField === 'amount' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No transactions match your filters.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const acc = accountMap.get(tx.accountId);
                const toAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
                const isSelected = selectedIds.includes(tx.id);
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tx.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {tx.note || 'Untitled Transaction'}
                        </div>
                        {tx.merchant && (
                          <div className="text-[11px] text-slate-400">{tx.merchant}</div>
                        )}
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {tx.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {isTransfer ? (
                        <Badge variant="savings" size="sm">
                          <ArrowLeftRight className="w-3 h-3" />
                          Transfer
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon
                            icon={cat?.icon || 'Tag'}
                            color={cat?.color}
                            size={13}
                          />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {cat?.name || 'Uncategorized'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {isTransfer ? (
                        <span>
                          {acc?.name} $\rightarrow$ {toAcc?.name || 'Account'}
                        </span>
                      ) : (
                        acc?.name || 'General'
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'}
                        {formatMoney(tx.amount, settings.currency)}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(tx)}
                          title="Edit transaction"
                          aria-label={`Edit transaction: ${tx.note || 'entry'}`}
                          className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="sr-only">Edit transaction</span>
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          title="Delete transaction"
                          aria-label={`Delete transaction: ${tx.note || 'entry'}`}
                          className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="sr-only">Delete transaction</span>
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
    </div>
  );
};
