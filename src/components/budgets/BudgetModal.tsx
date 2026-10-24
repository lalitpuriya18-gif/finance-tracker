import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { parseMoneyToMinor, minorToDecimal, CURRENCY_CONFIGS } from '../../lib/currency';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCategoryId?: string | null;
  currentLimit?: number;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  editCategoryId,
  currentLimit,
}) => {
  const { categories, budgets, settings, setCategoryBudget } = useFinanceStore();

  const [categoryId, setCategoryId] = useState<string>('');
  const [limitStr, setLimitStr] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currencyConfig = CURRENCY_CONFIGS[settings.currency] || CURRENCY_CONFIGS.USD;

  // Unbudgeted categories for new budget creation
  const existingBudgetCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = categories.filter(
    (c) => c.type === 'expense' && (!existingBudgetCategoryIds.has(c.id) || c.id === editCategoryId)
  );

  useEffect(() => {
    if (editCategoryId) {
      setCategoryId(editCategoryId);
      if (currentLimit !== undefined) {
        setLimitStr(minorToDecimal(currentLimit, settings.currency).toString());
      }
    } else {
      setCategoryId(availableCategories[0]?.id || '');
      setLimitStr('');
    }
    setError('');
  }, [isOpen, editCategoryId, currentLimit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minor = parseMoneyToMinor(limitStr, settings.currency);
    if (!limitStr || minor <= 0) {
      setError('Please enter a budget limit greater than 0.');
      return;
    }
    if (!categoryId) {
      setError('Please select an expense category.');
      return;
    }

    setCategoryBudget(categoryId, minor);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editCategoryId ? 'Edit Category Budget' : 'Set Category Budget'}
      description="Specify a monthly spending limit to monitor pace and receive overspend warnings."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Expense Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={Boolean(editCategoryId)}
        >
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          label="Monthly Spending Limit"
          placeholder="0.00"
          value={limitStr}
          onChange={(e) => setLimitStr(e.target.value)}
          leftIcon={<span className="font-bold text-slate-500">{currencyConfig.symbol}</span>}
          error={error}
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};
