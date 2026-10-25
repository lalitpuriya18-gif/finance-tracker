import { create } from 'zustand';
import {
  FinanceData,
  Transaction,
  Account,
  Category,
  Budget,
  Goal,
  RecurringRule,
  Settings,
  ToastMessage,
  ThemeMode,
} from '../types/finance';
import { storage } from '../lib/storage';
import { api } from '../lib/api';
import { getSeedData, getCleanInitialData, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from '../lib/seedData';

interface FinanceState extends FinanceData {
  isLoading: boolean;
  toasts: ToastMessage[];

  // Filter & Search states
  searchQuery: string;
  filterCategory: string;
  filterAccount: string;
  filterType: string;
  startDate: string;
  endDate: string;
  minAmount: number | null;
  maxAmount: number | null;
  sortField: 'date' | 'amount' | 'note';
  sortOrder: 'asc' | 'desc';

  // Core Actions
  init: () => Promise<void>;
  saveToStorage: () => Promise<void>;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  importTransactions: (txs: Transaction[]) => void;

  // Accounts
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    note?: string,
    date?: string
  ) => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budgets
  setCategoryBudget: (categoryId: string, monthlyLimit: number) => void;
  deleteBudget: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, fromAccountId?: string) => void;

  // Mandates
  toggleMandate: (id: string) => void;

  // Recurring Rules
  addRecurringRule: (rule: Omit<RecurringRule, 'id'>) => void;
  updateRecurringRule: (id: string, updates: Partial<RecurringRule>) => void;
  deleteRecurringRule: (id: string) => void;

  // Settings & Theme
  updateSettings: (updates: Partial<Settings>) => void;
  setTheme: (theme: ThemeMode) => void;

  // Toast & Notifications
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Filters
  setSearchQuery: (q: string) => void;
  setFilterCategory: (c: string) => void;
  setFilterAccount: (a: string) => void;
  setFilterType: (t: string) => void;
  setDateRange: (start: string, end: string) => void;
  setAmountRange: (min: number | null, max: number | null) => void;
  setSort: (field: 'date' | 'amount' | 'note', order: 'asc' | 'desc') => void;
  resetFilters: () => void;

  // Maintenance & Backup
  deleteData: () => Promise<void>;
  clearDemoData: () => Promise<void>;
  resetToDemoData: () => Promise<void>;
  importBackupJson: (data: FinanceData) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  accounts: [],
  categories: [],
  budgets: [],
  goals: [],
  recurringRules: [],
  mandates: [],
  settings: {
    currency: 'INR',
    theme: 'light',
    monthStartDay: 1,
    userName: 'FinTrack User',
    userEmail: 'user@fintrack.io',
  },
  isLoading: true,
  toasts: [],

  // Filter defaults
  searchQuery: '',
  filterCategory: 'all',
  filterAccount: 'all',
  filterType: 'all',
  startDate: '',
  endDate: '',
  minAmount: null,
  maxAmount: null,
  sortField: 'date',
  sortOrder: 'desc',

  init: async () => {
    set({ isLoading: true });
    try {
      const saved = await storage.loadData();
      if (saved && typeof saved === 'object') {
        const cleanDefault = getCleanInitialData();
        set({
          transactions: saved.transactions || [],
          accounts: saved.accounts && saved.accounts.length > 0 ? saved.accounts : DEFAULT_ACCOUNTS,
          categories: saved.categories && saved.categories.length > 0 ? saved.categories : DEFAULT_CATEGORIES,
          budgets: saved.budgets || [],
          goals: saved.goals || [],
          recurringRules: saved.recurringRules || [],
          mandates: saved.mandates || [],
          settings: saved.settings || cleanDefault.settings,
          isLoading: false,
        });
        get().setTheme(saved.settings?.theme || 'light');
      } else {
        const clean = getCleanInitialData();
        await storage.saveData(clean);
        set({
          ...clean,
          isLoading: false,
        });
        get().setTheme(clean.settings.theme);
      }
    } catch (e) {
      console.error('Initialization error', e);
      const clean = getCleanInitialData();
      set({ ...clean, isLoading: false });
    }
  },

  saveToStorage: async () => {
    const { transactions, accounts, categories, budgets, goals, recurringRules, mandates, settings } = get();
    await storage.saveData({
      transactions,
      accounts,
      categories,
      budgets,
      goals,
      recurringRules,
      mandates,
      settings,
    });
  },

  addTransaction: (txData) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));
    get().saveToStorage();
    api.addTransaction(newTx).catch((e) => console.warn('[API] Failed to sync new transaction:', e));
    get().addToast({
      title: 'Transaction Recorded',
      description: `${txData.type === 'income' ? 'Income' : txData.type === 'expense' ? 'Expense' : 'Transfer'} of ${txData.note || 'entry'} added.`,
      type: 'success',
    });
  },

  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    get().saveToStorage();
    api.updateTransaction(id, updates).catch((e) => console.warn('[API] Failed to sync update transaction:', e));
    get().addToast({
      title: 'Transaction Updated',
      type: 'info',
    });
  },

  deleteTransaction: (id) => {
    const target = get().transactions.find((t) => t.id === id);
    if (!target) return;

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    get().saveToStorage();
    api.deleteTransaction(id).catch((e) => console.warn('[API] Failed to sync delete transaction:', e));

    // Undo toast with action
    get().addToast({
      title: 'Transaction Deleted',
      description: target.note || 'Transaction removed',
      type: 'warning',
      duration: 6000,
      undoAction: () => {
        set((state) => ({
          transactions: [target, ...state.transactions],
        }));
        get().saveToStorage();
        api.addTransaction(target).catch((e) => console.warn('[API] Failed to sync restore transaction:', e));
        get().addToast({
          title: 'Transaction Restored',
          type: 'success',
        });
      },
    });
  },

  bulkDeleteTransactions: (ids) => {
    const setIds = new Set(ids);
    const deleted = get().transactions.filter((t) => setIds.has(t.id));
    set((state) => ({
      transactions: state.transactions.filter((t) => !setIds.has(t.id)),
    }));
    get().saveToStorage();
    api.bulkDeleteTransactions(ids).catch((e) => console.warn('[API] Failed to sync bulk delete:', e));

    get().addToast({
      title: `${ids.length} Transactions Deleted`,
      type: 'warning',
      duration: 6000,
      undoAction: () => {
        set((state) => ({
          transactions: [...deleted, ...state.transactions],
        }));
        get().saveToStorage();
        api.importTransactions(deleted).catch((e) => console.warn('[API] Failed to sync restore bulk:', e));
      },
    });
  },

  importTransactions: (newTxs) => {
    set((state) => ({
      transactions: [...newTxs, ...state.transactions],
    }));
    get().saveToStorage();
    api.importTransactions(newTxs).catch((e) => console.warn('[API] Failed to sync imported transactions:', e));
    get().addToast({
      title: 'Transactions Imported',
      description: `Successfully added ${newTxs.length} records.`,
      type: 'success',
    });
  },

  addAccount: (accData) => {
    const newAcc: Account = {
      ...accData,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    set((state) => ({
      accounts: [...state.accounts, newAcc],
    }));
    get().saveToStorage();
    api.addAccount(newAcc).catch((e) => console.warn('[API] Failed to sync account:', e));
    get().addToast({
      title: 'Account Created',
      description: `${accData.name} is ready.`,
      type: 'success',
    });
  },

  updateAccount: (id, updates) => {
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    get().saveToStorage();
    api.updateAccount(id, updates).catch((e) => console.warn('[API] Failed to sync update account:', e));
    get().addToast({ title: 'Account Updated', type: 'info' });
  },

  deleteAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    }));
    get().saveToStorage();
    api.deleteAccount(id).catch((e) => console.warn('[API] Failed to sync delete account:', e));
    get().addToast({ title: 'Account Removed', type: 'warning' });
  },

  transferBetweenAccounts: (fromAccountId, toAccountId, amount, note, date) => {
    const tx: Transaction = {
      id: `tx-tr-${Date.now()}`,
      type: 'transfer',
      amount,
      categoryId: '',
      accountId: fromAccountId,
      toAccountId,
      date: date || new Date().toISOString().split('T')[0],
      note: note || 'Transfer between accounts',
      tags: ['transfer'],
    };

    set((state) => ({
      transactions: [tx, ...state.transactions],
    }));
    get().saveToStorage();
    api.transferBetweenAccounts(fromAccountId, toAccountId, amount, note, date).catch((e) =>
      console.warn('[API] Failed to sync transfer:', e)
    );
    get().addToast({
      title: 'Transfer Completed',
      description: note || 'Funds transferred successfully.',
      type: 'success',
    });
  },

  addCategory: (catData) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    set((state) => ({
      categories: [...state.categories, newCat],
    }));
    get().saveToStorage();
    api.addCategory(newCat).catch((e) => console.warn('[API] Failed to sync category:', e));
    get().addToast({ title: 'Category Created', type: 'success' });
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().saveToStorage();
    api.updateCategory(id, updates).catch((e) => console.warn('[API] Failed to sync category update:', e));
    get().addToast({ title: 'Category Updated', type: 'info' });
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      budgets: state.budgets.filter((b) => b.categoryId !== id),
    }));
    get().saveToStorage();
    api.deleteCategory(id).catch((e) => console.warn('[API] Failed to sync category deletion:', e));
    get().addToast({ title: 'Category Deleted', type: 'warning' });
  },

  setCategoryBudget: (categoryId, monthlyLimit) => {
    set((state) => {
      const existing = state.budgets.find((b) => b.categoryId === categoryId);
      if (existing) {
        return {
          budgets: state.budgets.map((b) =>
            b.categoryId === categoryId ? { ...b, monthlyLimit } : b
          ),
        };
      } else {
        const newBudget: Budget = {
          id: `b-${Date.now()}`,
          categoryId,
          monthlyLimit,
        };
        return {
          budgets: [...state.budgets, newBudget],
        };
      }
    });
    get().saveToStorage();
    api.setCategoryBudget(categoryId, monthlyLimit).catch((e) => console.warn('[API] Failed to sync budget:', e));
    get().addToast({ title: 'Budget Limit Saved', type: 'success' });
  },

  deleteBudget: (id) => {
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    }));
    get().saveToStorage();
    api.deleteBudget(id).catch((e) => console.warn('[API] Failed to sync budget deletion:', e));
    get().addToast({ title: 'Budget Removed', type: 'info' });
  },

  addGoal: (goalData) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g-${Date.now()}`,
      savedAmount: 0,
    };
    set((state) => ({
      goals: [...state.goals, newGoal],
    }));
    get().saveToStorage();
    api.addGoal(newGoal).catch((e) => console.warn('[API] Failed to sync goal creation:', e));
    get().addToast({ title: 'Savings Goal Created', type: 'success' });
  },

  updateGoal: (id, updates) => {
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    get().saveToStorage();
    api.updateGoal(id, updates).catch((e) => console.warn('[API] Failed to sync goal update:', e));
    get().addToast({ title: 'Goal Updated', type: 'info' });
  },

  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
    get().saveToStorage();
    api.deleteGoal(id).catch((e) => console.warn('[API] Failed to sync goal deletion:', e));
    get().addToast({ title: 'Goal Removed', type: 'warning' });
  },

  contributeToGoal: (goalId, amount, fromAccountId) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g
      ),
    }));

    if (fromAccountId) {
      const goal = get().goals.find((g) => g.id === goalId);
      const tx: Transaction = {
        id: `tx-goal-${Date.now()}`,
        type: 'expense',
        amount,
        categoryId: 'cat-savings-deposit',
        accountId: fromAccountId,
        date: new Date().toISOString().split('T')[0],
        note: `Contribution to ${goal?.name || 'Savings Goal'}`,
        tags: ['goal-contribution', 'savings'],
      };
      set((state) => ({
        transactions: [tx, ...state.transactions],
      }));
    }

    get().saveToStorage();
    api.contributeToGoal(goalId, amount, fromAccountId).catch((e) =>
      console.warn('[API] Failed to sync goal contribution:', e)
    );
    get().addToast({
      title: 'Contribution Added',
      description: 'Progress updated towards your goal.',
      type: 'success',
    });
  },

  toggleMandate: (id) => {
    set((state) => ({
      mandates: (state.mandates || []).map((m) =>
        m.id === id ? { ...m, status: m.status === 'Active' ? 'Paused' : 'Active' } : m
      ),
    }));
    get().saveToStorage();
    api.toggleMandate(id).catch((e) => console.warn('[API] Failed to sync mandate toggle:', e));
  },

  addRecurringRule: (ruleData) => {
    const newRule: RecurringRule = {
      ...ruleData,
      id: `rec-${Date.now()}`,
    };
    set((state) => ({
      recurringRules: [...state.recurringRules, newRule],
    }));
    get().saveToStorage();
    get().addToast({ title: 'Recurring Rule Added', type: 'success' });
  },

  updateRecurringRule: (id, updates) => {
    set((state) => ({
      recurringRules: state.recurringRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    get().saveToStorage();
    get().addToast({ title: 'Recurring Rule Updated', type: 'info' });
  },

  deleteRecurringRule: (id) => {
    set((state) => ({
      recurringRules: state.recurringRules.filter((r) => r.id !== id),
    }));
    get().saveToStorage();
    get().addToast({ title: 'Recurring Rule Deleted', type: 'warning' });
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
    get().saveToStorage();
    api.updateSettings(updates).catch((e) => console.warn('[API] Failed to sync settings:', e));
    if (updates.theme) {
      get().setTheme(updates.theme);
    }
    get().addToast({ title: 'Settings Updated', type: 'info' });
  },

  setTheme: (theme) => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    const duration = toast.duration || 4000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterAccount: (filterAccount) => set({ filterAccount }),
  setFilterType: (filterType) => set({ filterType }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  setAmountRange: (minAmount, maxAmount) => set({ minAmount, maxAmount }),
  setSort: (sortField, sortOrder) => set({ sortField, sortOrder }),
  resetFilters: () =>
    set({
      searchQuery: '',
      filterCategory: 'all',
      filterAccount: 'all',
      filterType: 'all',
      startDate: '',
      endDate: '',
      minAmount: null,
      maxAmount: null,
      sortField: 'date',
      sortOrder: 'desc',
    }),

  deleteData: async () => {
    try {
      await api.clearAllData();
    } catch (e) {
      console.warn('[API] Failed to clear remote data:', e);
    }
    await storage.clearData();
    set({
      transactions: [],
      accounts: DEFAULT_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      goals: [],
      recurringRules: [],
      mandates: [],
    });
    get().addToast({
      title: 'Data Deleted',
      description: 'All transactions, accounts, budgets, and goals have been permanently deleted.',
      type: 'warning',
    });
  },

  clearDemoData: async () => {
    await get().deleteData();
  },

  resetToDemoData: async () => {
    await get().deleteData();
  },

  importBackupJson: async (data: FinanceData) => {
    await storage.saveData(data);
    set({
      ...data,
    });
    get().setTheme(data.settings?.theme || 'system');
    get().addToast({
      title: 'Backup Restored',
      description: 'Your financial data backup was successfully imported.',
      type: 'success',
    });
  },
}));
