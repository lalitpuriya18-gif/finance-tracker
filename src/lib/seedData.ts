import { FinanceData } from '../types/finance';

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

export function getCleanInitialData(): FinanceData {
  return {
    settings: {
      currency: 'INR',
      theme: 'light',
      monthStartDay: 1,
      userName: 'FinTrack User',
      userEmail: 'user@fintrack.io',
    },
    accounts: [],
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
