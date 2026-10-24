import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Account } from '../types/finance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AccountCard } from '../components/accounts/AccountCard';
import { AccountModal } from '../components/accounts/AccountModal';
import { TransferModal } from '../components/accounts/TransferModal';
import { calculateAccountBalances } from '../lib/calculations';
import { formatMoney } from '../lib/currency';
import { Plus, ArrowRightLeft, ShieldCheck, Wallet } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { accounts, transactions, settings } = useFinanceStore();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState<string | undefined>(undefined);

  const balances = calculateAccountBalances(accounts, transactions);
  const totalNetWorth = Object.values(balances).reduce((sum, b) => sum + b, 0);

  const totalLiquid = accounts
    .filter((a) => a.type === 'bank' || a.type === 'cash' || a.type === 'wallet')
    .reduce((sum, a) => sum + (balances[a.id] || 0), 0);

  const totalDebt = accounts
    .filter((a) => a.type === 'card' || (balances[a.id] || 0) < 0)
    .reduce((sum, a) => {
      const b = balances[a.id] || 0;
      return sum + (b < 0 ? Math.abs(b) : 0);
    }, 0);

  const handleOpenTransfer = (accountId?: string) => {
    setTransferFromId(accountId);
    setIsTransferModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Accounts & Balances
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your checking, savings, credit cards, cash wallets, and transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenTransfer()}
            icon={<ArrowRightLeft className="w-4 h-4" />}
          >
            Transfer Money
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            New Account
          </Button>
        </div>
      </div>

      {/* Net Worth Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-500/20">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Net Worth
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
            {formatMoney(totalNetWorth, settings.currency)}
          </div>
          <span className="text-[11px] text-slate-400">Assets minus liabilities</span>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Liquid Cash & Bank Reserves
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {formatMoney(totalLiquid, settings.currency)}
          </div>
          <span className="text-[11px] text-slate-400">Checking, savings, cash</span>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Current Card Liabilities
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums mt-1">
            {formatMoney(totalDebt, settings.currency)}
          </div>
          <span className="text-[11px] text-slate-400">Credit balance to pay off</span>
        </Card>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Accounts Added
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Connect your bank accounts, savings, and cards to track your total net worth and reconcile balances.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Create First Account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              balance={balances[acc.id] || 0}
              transactions={transactions}
              onEdit={() => {
                setEditingAccount(acc);
                setIsAccountModalOpen(true);
              }}
              onTransfer={() => handleOpenTransfer(acc.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        editAccount={editingAccount}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        defaultFromAccountId={transferFromId}
      />
    </div>
  );
};
