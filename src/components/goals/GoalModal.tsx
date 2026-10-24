import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Goal } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { parseMoneyToMinor, minorToDecimal, CURRENCY_CONFIGS } from '../../lib/currency';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, editGoal }) => {
  const { settings, addGoal, updateGoal } = useFinanceStore();

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#10b981');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencyConfig = CURRENCY_CONFIGS[settings.currency] || CURRENCY_CONFIGS.USD;

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name);
      setTargetAmountStr(minorToDecimal(editGoal.targetAmount, settings.currency).toString());
      setTargetDate(editGoal.targetDate);
      setColor(editGoal.color || '#10b981');
    } else {
      setName('');
      setTargetAmountStr('');
      setTargetDate('');
      setColor('#10b981');
    }
    setErrors({});
  }, [isOpen, editGoal, settings.currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Goal name is required.';
    const minor = parseMoneyToMinor(targetAmountStr, settings.currency);
    if (!targetAmountStr || minor <= 0) errs.targetAmount = 'Target amount must be greater than 0.';
    if (!targetDate) errs.targetDate = 'Target completion date is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editGoal) {
      updateGoal(editGoal.id, {
        name: name.trim(),
        targetAmount: minor,
        targetDate,
        color,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: minor,
        targetDate,
        color,
      });
    }

    onClose();
  };

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      description="Set a target financial milestone to track progress and estimated completion."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Name"
          placeholder="e.g. Emergency Fund, Japan Trip, Down Payment"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Input
          label="Target Amount"
          placeholder="0.00"
          value={targetAmountStr}
          onChange={(e) => setTargetAmountStr(e.target.value)}
          leftIcon={<span className="font-bold text-slate-500">{currencyConfig.symbol}</span>}
          error={errors.targetAmount}
        />

        <Input
          label="Target Completion Date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          error={errors.targetDate}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Badge Color
          </label>
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'scale-110 border-slate-900 dark:border-white shadow-sm' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editGoal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
