import React from 'react';
import { Account, Transaction } from '../../types/finance';
import { Card } from '../ui/Card';
import { formatMoney } from '../../lib/currency';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  Landmark,
  CreditCard,
  Banknote,
  Wallet,
  ArrowRightLeft,
  Edit3,
  Trash2,
} from 'lucide-react';

interface AccountCardProps {
  account: Account;
  balance: number;
  transactions: Transaction[];
  onEdit: () => void;
  onTransfer: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  balance,
  transactions,
  onEdit,
  onTransfer,
}) => {
  const { settings, deleteAccount } = useFinanceStore();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-5 h-5 text-emerald-500" />;
      case 'card':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'cash':
        return <Banknote className="w-5 h-5 text-amber-500" />;
      default:
        return <Wallet className="w-5 h-5 text-blue-500" />;
    }
  };

  const accountTxCount = transactions.filter(
    (t) => t.accountId === account.id || t.toAccountId === account.id
  ).length;

  return (
    <Card className="space-y-4 hoverable relative overflow-hidden">
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: account.color || '#10b981' }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
            {getAccountIcon(account.type)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{account.name}</h4>
            <span className="text-[11px] text-slate-400 capitalize">
              {account.type} • {accountTxCount} entries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            title="Edit account details"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteAccount(account.id)}
            title="Delete account"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div>
        <span className="text-xs text-slate-500 dark:text-slate-400">Current Balance</span>
        <div
          className={`text-2xl font-bold tabular-nums tracking-tight ${
            balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {formatMoney(balance, settings.currency)}
        </div>
        <span className="text-[11px] text-slate-400">
          Opening: {formatMoney(account.openingBalance, settings.currency)}
        </span>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500">Fast Inter-Account Move</span>
        <button
          onClick={onTransfer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500" />
          Transfer
        </button>
      </div>
    </Card>
  );
};
