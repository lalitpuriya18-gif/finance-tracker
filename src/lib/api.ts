import {
  FinanceData,
  Transaction,
  Account,
  Category,
  Budget,
  Goal,
  SavingsMandate,
  Settings,
} from '../types/finance';

// Resolves backend base URL: supports Vercel service binding, env override, or standard /api routing
const getBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, '')}/api`;
  }
  const envBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL;
  if (envBackendUrl) {
    return `${envBackendUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; database: string }>('/health'),

  // Bootstrap
  getBootstrap: () => request<FinanceData & { notifications?: any[] }>('/bootstrap'),

  // Auth
  login: (email: string, password?: string, name?: string) =>
    request<{ success: boolean; user: Settings }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  googleAuth: (name?: string, email?: string) =>
    request<{ success: boolean; user: Settings }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Transactions
  getTransactions: () => request<Transaction[]>('/transactions'),
  addTransaction: (tx: Omit<Transaction, 'id'>) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    }),
  updateTransaction: (id: string, updates: Partial<Transaction>) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteTransaction: (id: string) =>
    request<{ success: boolean; id: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
  bulkDeleteTransactions: (ids: string[]) =>
    request<{ success: boolean; deletedCount: number }>('/transactions/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  importTransactions: (transactions: Transaction[]) =>
    request<{ success: boolean; count: number; transactions: Transaction[] }>('/transactions/import', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    }),

  // Accounts
  getAccounts: () => request<Account[]>('/accounts'),
  addAccount: (acc: Omit<Account, 'id'>) =>
    request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(acc),
    }),
  updateAccount: (id: string, updates: Partial<Account>) =>
    request<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteAccount: (id: string) =>
    request<{ success: boolean; id: string }>(`/accounts/${id}`, {
      method: 'DELETE',
    }),
  transferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    note?: string,
    date?: string
  ) =>
    request<{ success: boolean; transaction: Transaction }>('/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromAccountId, toAccountId, amount, note, date }),
    }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  addCategory: (cat: Omit<Category, 'id'>) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    }),
  updateCategory: (id: string, updates: Partial<Category>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean; id: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // Budgets
  getBudgets: () => request<Budget[]>('/budgets'),
  setCategoryBudget: (categoryId: string, monthlyLimit: number) =>
    request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify({ categoryId, monthlyLimit }),
    }),
  deleteBudget: (id: string) =>
    request<{ success: boolean; id: string }>(`/budgets/${id}`, {
      method: 'DELETE',
    }),

  // Goals
  getGoals: () => request<Goal[]>('/goals'),
  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) =>
    request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),
  updateGoal: (id: string, updates: Partial<Goal>) =>
    request<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteGoal: (id: string) =>
    request<{ success: boolean; id: string }>(`/goals/${id}`, {
      method: 'DELETE',
    }),
  contributeToGoal: (goalId: string, amount: number, fromAccountId?: string) =>
    request<{ id: string; savedAmount: number }>(`/goals/${goalId}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount, fromAccountId }),
    }),

  // Mandates
  getMandates: () => request<SavingsMandate[]>('/mandates'),
  toggleMandate: (id: string) =>
    request<{ id: string; status: 'Active' | 'Paused' }>(`/mandates/${id}/toggle`, {
      method: 'PUT',
    }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/mark-read', {
      method: 'POST',
    }),

  // Settings
  getSettings: () => request<Settings>('/settings'),
  updateSettings: (settings: Partial<Settings>) =>
    request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Bank Sync
  syncAccounts: () =>
    request<{
      success: boolean;
      message: string;
      syncedAt: string;
      accounts: Array<{ name: string; status: string; pingMs: number }>;
    }>('/sync', {
      method: 'POST',
    }),

  // Backup & Reset
  resetDemoData: () =>
    request<{ success: boolean; data: FinanceData }>('/backup/reset-demo', {
      method: 'POST',
    }),
  clearAllData: () =>
    request<{ success: boolean; message: string }>('/backup/clear', {
      method: 'POST',
    }),
};
