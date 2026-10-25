import { Account, FinanceData } from '../types/finance';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-income', name: 'Income', icon: 'Briefcase', color: '#10b981', type: 'income' as const },
  { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#10b981', type: 'expense' as const },
  { id: 'cat-shopping', name: 'Shopping & Lifestyle', icon: 'ShoppingBag', color: '#f43f5e', type: 'expense' as const },
  { id: 'cat-transport', name: 'Transport & Commute', icon: 'Car', color: '#06b6d4', type: 'expense' as const },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: 'Zap', color: '#3b82f6', type: 'expense' as const },
  { id: 'cat-rent', name: 'Rent & Living', icon: 'Home', color: '#1e293b', type: 'expense' as const },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Tv', color: '#8b5cf6', type: 'expense' as const },
  { id: 'cat-health', name: 'Health & Wellness', icon: 'HeartPulse', color: '#14b8a6', type: 'expense' as const },
  { id: 'cat-investment', name: 'Investment', icon: 'TrendingUp', color: '#6366f1', type: 'expense' as const },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-primary-bank',
    name: 'Primary Bank Account',
    type: 'bank',
    openingBalance: 0,
    accountNumber: '..8921',
    color: '#065f46',
  },
  {
    id: 'acc-savings',
    name: 'Savings Account',
    type: 'bank',
    openingBalance: 0,
    accountNumber: '..9902',
    color: '#047857',
  },
  {
    id: 'acc-cash',
    name: 'Cash Wallet',
    type: 'cash',
    openingBalance: 0,
    color: '#0284c7',
  },
  {
    id: 'acc-credit-card',
    name: 'Credit Card',
    type: 'card',
    openingBalance: 0,
    accountNumber: '..4092',
    color: '#6366f1',
  },
];

export function getCleanInitialData(): FinanceData {
  return {
    settings: {
      currency: 'INR',
      theme: 'light',
      monthStartDay: 1,
      userName: 'FinTrack User',
      userEmail: 'user@fintrack.io',
    },
    accounts: DEFAULT_ACCOUNTS,
    categories: DEFAULT_CATEGORIES,
    budgets: [],
    goals: [],
    mandates: [],
    recurringRules: [],
    transactions: [],
  };
}

export function getSeedData(): FinanceData {
  return getCleanInitialData();
}

