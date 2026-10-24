import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { parseMoneyToMinor, CURRENCY_CONFIGS } from '../../lib/currency';
import { ArrowRightLeft } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromAccountId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultFromAccountId,
}) => {
  const { accounts, settings, transferBetweenAccounts } = useFinanceStore();

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('Account Balance Transfer');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencyConfig = CURRENCY_CONFIGS[settings.currency] || CURRENCY_CONFIGS.USD;

  useEffect(() => {
    if (accounts.length >= 2) {
      setFromAccountId(defaultFromAccountId || accounts[0].id);
      setToAccountId(
        accounts.find((a) => a.id !== (defaultFromAccountId || accounts[0].id))?.id || accounts[1].id
      );
    } else if (accounts.length === 1) {
      setFromAccountId(accounts[0].id);
      setToAccountId('');
    }
    setAmountStr('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('Account Balance Transfer');
    setErrors({});
  }, [isOpen, defaultFromAccountId, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    const minor = parseMoneyToMinor(amountStr, settings.currency);
    if (!amountStr || minor <= 0) {
      errs.amount = 'Please enter a transfer amount greater than 0.';
    }

    if (!fromAccountId) errs.from = 'Source account required.';
    if (!toAccountId) errs.to = 'Destination account required.';
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      errs.to = 'Source and destination accounts must differ.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    transferBetweenAccounts(fromAccountId, toAccountId, minor, note.trim(), date);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Between Accounts"
      description="Moves money between accounts without altering net income or expenses."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <Select
            label="From Account"
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            error={errors.from}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type})
              </option>
            ))}
          </Select>

          <Select
            label="To Account"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            error={errors.to}
          >
            <option value="">Select destination...</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} disabled={a.id === fromAccountId}>
                {a.name} ({a.type})
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Transfer Amount"
          placeholder="0.00"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          leftIcon={<span className="font-bold text-slate-500">{currencyConfig.symbol}</span>}
          error={errors.amount}
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Note"
            placeholder="e.g. Credit card payment, Savings deposit"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<ArrowRightLeft className="w-4 h-4" />}
          >
            Execute Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
