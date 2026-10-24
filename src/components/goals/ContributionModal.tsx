import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Goal } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { parseMoneyToMinor, CURRENCY_CONFIGS, formatMoney } from '../../lib/currency';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { accounts, settings, contributeToGoal } = useFinanceStore();

  const [amountStr, setAmountStr] = useState('');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [error, setError] = useState('');

  const currencyConfig = CURRENCY_CONFIGS[settings.currency] || CURRENCY_CONFIGS.USD;

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minor = parseMoneyToMinor(amountStr, settings.currency);
    if (!amountStr || minor <= 0) {
      setError('Please enter a valid contribution amount.');
      return;
    }

    contributeToGoal(goal.id, minor, fromAccountId || undefined);
    setAmountStr('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Contribution to ${goal.name}`}
      description={`Currently saved: ${formatMoney(goal.savedAmount, settings.currency)} of ${formatMoney(
        goal.targetAmount,
        settings.currency
      )}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Contribution Amount"
          placeholder="0.00"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          leftIcon={<span className="font-bold text-slate-500">{currencyConfig.symbol}</span>}
          helperText={`Remaining to goal: ${formatMoney(remaining, settings.currency)}`}
          error={error}
          autoFocus
        />

        <Select
          label="Fund From Account (Optional)"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          helperText="Deducts this contribution as a savings transfer from this account"
        >
          <option value="">Do not deduct from an account (manual tracking)</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type})
            </option>
          ))}
        </Select>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Deposit to Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
