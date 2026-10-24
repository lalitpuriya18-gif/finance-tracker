import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Transaction, TransactionType } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { parseMoneyToMinor, minorToDecimal, CURRENCY_CONFIGS } from '../../lib/currency';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
}) => {
  const { categories, accounts, settings, addTransaction, updateTransaction } = useFinanceStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [tagsStr, setTagsStr] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencyConfig = CURRENCY_CONFIGS[settings.currency] || CURRENCY_CONFIGS.USD;

  // Initialize or reset form on open
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmountStr(minorToDecimal(editTransaction.amount, settings.currency).toString());
      setCategoryId(editTransaction.categoryId || '');
      setAccountId(editTransaction.accountId || '');
      setToAccountId(editTransaction.toAccountId || '');
      setDate(editTransaction.date);
      setNote(editTransaction.note || '');
      setMerchant(editTransaction.merchant || '');
      setTagsStr((editTransaction.tags || []).join(', '));
      setErrors({});
    } else {
      setType('expense');
      setAmountStr('');
      const defaultExpenseCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultExpenseCat?.id || categories[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setToAccountId(accounts[1]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setMerchant('');
      setTagsStr('');
      setErrors({});
    }
  }, [isOpen, editTransaction, categories, accounts, settings.currency]);

  // Adjust default category when type toggles
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      const incCat = categories.find((c) => c.type === 'income');
      setCategoryId(incCat?.id || '');
    } else if (newType === 'expense') {
      const expCat = categories.find((c) => c.type === 'expense');
      setCategoryId(expCat?.id || '');
    } else {
      setCategoryId('');
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const minor = parseMoneyToMinor(amountStr, settings.currency);
    if (!amountStr || minor <= 0) {
      errs.amount = 'Please enter an amount greater than 0.';
    }

    if (!accountId) {
      errs.accountId = 'Please select an account.';
    }

    if (type === 'transfer') {
      if (!toAccountId) {
        errs.toAccountId = 'Please select a destination account.';
      } else if (toAccountId === accountId) {
        errs.toAccountId = 'Origin and destination accounts must be different.';
      }
    } else {
      if (!categoryId) {
        errs.categoryId = 'Please select a category.';
      }
    }

    if (!date) {
      errs.date = 'Date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const minorAmount = parseMoneyToMinor(amountStr, settings.currency);
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        type,
        amount: minorAmount,
        categoryId: type === 'transfer' ? '' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        note: note.trim() || (type === 'transfer' ? 'Account Transfer' : 'Transaction'),
        merchant: merchant.trim() || undefined,
        tags,
      });
    } else {
      addTransaction({
        type,
        amount: minorAmount,
        categoryId: type === 'transfer' ? '' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        note: note.trim() || (type === 'transfer' ? 'Account Transfer' : 'Transaction'),
        merchant: merchant.trim() || undefined,
        tags,
      });
    }

    onClose();
  };

  const filteredCategories = categories.filter((c) => !c.isArchived && c.type === type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Edit Transaction' : 'New Transaction'}
      description="Record income, expense, or transfer between accounts."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'transfer'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* Amount Input */}
        <Input
          label="Amount"
          type="text"
          placeholder="0.00"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          error={errors.amount}
          leftIcon={<span className="font-bold text-slate-500">{currencyConfig.symbol}</span>}
          className="text-lg font-semibold tabular-nums"
          autoFocus
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Selector */}
          <Select
            label={type === 'transfer' ? 'From Account' : 'Account'}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            error={errors.accountId}
          >
            <option value="">Select account...</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </Select>

          {/* Category or To Account */}
          {type === 'transfer' ? (
            <Select
              label="To Account"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              error={errors.toAccountId}
            >
              <option value="">Select destination...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </Select>
          ) : (
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              error={errors.categoryId}
            >
              <option value="">Select category...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
          <Input
            label="Merchant / Payee (Optional)"
            placeholder="e.g. Trader Joe's, Apple, Stripe"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        <Input
          label="Note / Description"
          placeholder="What was this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Input
          label="Tags (Optional)"
          placeholder="groceries, work, tax-deductible (comma separated)"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          helperText="Separate tags with commas"
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editTransaction ? 'Save Changes' : 'Add Entry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
