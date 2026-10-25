import { describe, it, expect, beforeEach } from 'vitest';
import {
  initDb,
  getFullBootstrap,
  dbAddTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbSetCategoryBudget,
  dbDeleteBudget,
  dbAddGoal,
  dbContributeToGoal,
  dbDeleteGoal,
  dbAddAccount,
  dbToggleMandate,
  dbUpdateSettings,
  dbResetToDemo,
} from '../../server/db';

describe('FinTrack Backend & SQLite Engine', () => {
  beforeEach(() => {
    initDb();
    dbResetToDemo();
  });

  it('initializes and bootstraps database with clean initial dataset', () => {
    const data = getFullBootstrap();
    expect(data.accounts.length).toBeGreaterThan(0);
    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.transactions.length).toBe(0);
    expect(data.budgets.length).toBe(0);
    expect(data.goals.length).toBe(0);
    expect(data.settings.currency).toBe('INR');
  });

  it('performs full CRUD for transactions in SQLite', () => {
    const newTx = dbAddTransaction({
      type: 'expense',
      amount: 150000, // ₹1,500.00
      categoryId: 'cat-groceries',
      accountId: 'acc-icici-sal',
      date: '2023-10-25',
      note: 'Supermarket Grocery Run',
      tags: ['groceries', 'household'],
    });

    expect(newTx.id).toBeDefined();

    // Verify it is in bootstrap
    let data = getFullBootstrap();
    let found = data.transactions.find((t) => t.id === newTx.id);
    expect(found).toBeDefined();
    expect(found?.amount).toBe(150000);
    expect(found?.note).toBe('Supermarket Grocery Run');

    // Update transaction
    dbUpdateTransaction(newTx.id, { amount: 175000, note: 'Updated Grocery Run' });
    data = getFullBootstrap();
    found = data.transactions.find((t) => t.id === newTx.id);
    expect(found?.amount).toBe(175000);
    expect(found?.note).toBe('Updated Grocery Run');

    // Delete transaction
    dbDeleteTransaction(newTx.id);
    data = getFullBootstrap();
    found = data.transactions.find((t) => t.id === newTx.id);
    expect(found).toBeUndefined();
  });

  it('sets, updates and deletes budget limits in SQLite', () => {
    const budget = dbSetCategoryBudget('cat-dining', 2500000); // ₹25,000
    expect(budget.monthlyLimit).toBe(2500000);

    let data = getFullBootstrap();
    let found = data.budgets.find((b) => b.categoryId === 'cat-dining');
    expect(found).toBeDefined();
    expect(found?.monthlyLimit).toBe(2500000);

    // Update ceiling
    dbSetCategoryBudget('cat-dining', 3500000);
    data = getFullBootstrap();
    found = data.budgets.find((b) => b.categoryId === 'cat-dining');
    expect(found?.monthlyLimit).toBe(3500000);

    // Delete budget
    if (found) {
      dbDeleteBudget(found.id);
      data = getFullBootstrap();
      expect(data.budgets.find((b) => b.id === found?.id)).toBeUndefined();
    }
  });

  it('creates goal and processes contributions with linked transactions', () => {
    const goal = dbAddGoal({
      name: 'Japan Autumn Trip',
      targetAmount: 30000000, // ₹3,00,000
      targetDate: '2024-10-01',
      subtitle: 'Tokyo & Kyoto 10 Days',
    });

    expect(goal.id).toBeDefined();

    // Contribute ₹25,000 from Salary Account
    const res = dbContributeToGoal(goal.id, 2500000, 'acc-icici-sal');
    expect(res?.savedAmount).toBe(2500000);

    const data = getFullBootstrap();
    const foundGoal = data.goals.find((g) => g.id === goal.id);
    expect(foundGoal?.savedAmount).toBe(2500000);

    // Verify linked transaction was logged
    const tx = data.transactions.find((t) => t.note.includes('Japan Autumn Trip'));
    expect(tx).toBeDefined();
    expect(tx?.amount).toBe(2500000);

    // Cleanup
    dbDeleteGoal(goal.id);
  });

  it('toggles mandates status between Active and Paused', () => {
    const data = getFullBootstrap();
    const firstMandate = data.mandates?.[0];
    if (firstMandate) {
      const initialStatus = firstMandate.status;
      const toggled = dbToggleMandate(firstMandate.id);
      expect(toggled?.status).not.toBe(initialStatus);

      // Toggle back
      const restored = dbToggleMandate(firstMandate.id);
      expect(restored?.status).toBe(initialStatus);
    }
  });

  it('updates application settings in SQLite', () => {
    dbUpdateSettings({ currency: 'INR', userName: 'Arjun M.', theme: 'dark' });
    const data = getFullBootstrap();
    expect(data.settings.userName).toBe('Arjun M.');
    expect(data.settings.theme).toBe('dark');
  });
});
