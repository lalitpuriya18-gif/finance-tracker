import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Account, AccountType } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { parseMoneyToMinor, minorToDecimal, CURRENCY_CONFIGS } from '../../lib/currency';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  editAccount,
}) => {
  const { settings, addAccount, updateAccount } = useFinanceStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [openingBalanceStr, setOpeningBalanceStr] = useState('0.00');
  const [color, setColor] = useState('#10b981');
  const [error, setError] = useState('');

  const currencyConfig = CURRENCY_CONFIGS[settings.currency] || CURRENCY_CONFIGS.USD;

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setOpeningBalanceStr(
        minorToDecimal(editAccount.openingBalance, settings.currency).toString()
      );
      setColor(editAccount.color || '#10b981');
    } else {
      setName('');
      setType('bank');
      setOpeningBalanceStr('0.00');
      setColor('#10b981');
    }
    setError('');
  }, [isOpen, editAccount, settings.currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an account name.');
      return;
    }

    const minor = parseMoneyToMinor(openingBalanceStr, settings.currency);

    if (editAccount) {
      updateAccount(editAccount.id, {
        name: name.trim(),
        type,
        openingBalance: minor,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        openingBalance: minor,
        color,
      });
    }

    onClose();
  };

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editAccount ? 'Edit Account' : 'Add Financial Account'}
      description="Connect a bank checking, savings, credit card, or cash wallet."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Name"
          placeholder="e.g. Chase Total Checking, Amex Gold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          autoFocus
        />

        <Select
          label="Account Type"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
        >
          <option value="bank">Bank Checking / Savings</option>
          <option value="card">Credit Card</option>
          <option value="cash">Cash In Hand</option>
          <option value="wallet">Digital Wallet / PayPal / Apple Cash</option>
        </Select>

        <Input
          label="Opening Balance"
          placeholder="0.00"
          value={openingBalanceStr}
          onChange={(e) => setOpeningBalanceStr(e.target.value)}
          leftIcon={<span className="font-bold text-slate-500">{currencyConfig.symbol}</span>}
          helperText="For credit cards, enter a negative number if you carry a starting balance."
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Card Accent Color
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
            {editAccount ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
