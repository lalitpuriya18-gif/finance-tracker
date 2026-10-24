import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  calculateAccountBalances,
  calculatePercentageChange,
  calculateBudgetStatus,
  calculateGoalProgress,
} from '../lib/calculations';
import { Transaction, Account, Budget, Goal } from '../types/finance';

describe('Financial Calculation Helpers', () => {
  it('calculateTotals correctly aggregates income, expenses, and savings rate in minor units', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 500000, // $5,000.00
        categoryId: 'cat-1',
        accountId: 'acc-1',
        date: '2026-10-01',
        note: 'Salary',
        tags: [],
      },
      {
        id: '2',
        type: 'expense',
        amount: 200000, // $2,000.00
        categoryId: 'cat-2',
        accountId: 'acc-1',
        date: '2026-10-02',
        note: 'Rent',
        tags: [],
      },
      {
        id: '3',
        type: 'expense',
        amount: 100000, // $1,000.00
        categoryId: 'cat-3',
        accountId: 'acc-1',
        date: '2026-10-05',
        note: 'Food',
        tags: [],
      },
    ];

    const result = calculateTotals(transactions);
    expect(result.income).toBe(500000);
    expect(result.expense).toBe(300000);
    expect(result.net).toBe(200000);
    // Savings rate: ((500000 - 300000) / 500000) * 100 = 40%
    expect(result.savingsRate).toBe(40);
  });

  it('calculateTotals safely handles zero income without dividing by zero', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        type: 'expense',
        amount: 15000,
        categoryId: 'cat-1',
        accountId: 'acc-1',
        date: '2026-10-01',
        note: 'Coffee',
        tags: [],
      },
    ];

    const result = calculateTotals(transactions);
    expect(result.income).toBe(0);
    expect(result.expense).toBe(15000);
    expect(result.net).toBe(-15000);
    expect(result.savingsRate).toBe(0);
  });

  it('calculateAccountBalances properly handles opening balances, income, expense, and transfers', () => {
    const accounts: Account[] = [
      { id: 'acc-checking', name: 'Checking', type: 'bank', openingBalance: 100000 }, // $1,000
      { id: 'acc-savings', name: 'Savings', type: 'bank', openingBalance: 500000 }, // $5,000
    ];

    const transactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 200000,
        categoryId: 'c1',
        accountId: 'acc-checking',
        date: '2026-10-01',
        note: 'Paycheck',
        tags: [],
      },
      {
        id: '2',
        type: 'expense',
        amount: 50000,
        categoryId: 'c2',
        accountId: 'acc-checking',
        date: '2026-10-02',
        note: 'Groceries',
        tags: [],
      },
      {
        id: '3',
        type: 'transfer',
        amount: 100000,
        categoryId: '',
        accountId: 'acc-checking',
        toAccountId: 'acc-savings',
        date: '2026-10-03',
        note: 'Move to savings',
        tags: [],
      },
    ];

    const balances = calculateAccountBalances(accounts, transactions);
    // Checking: 100,000 + 200,000 (inc) - 50,000 (exp) - 100,000 (transfer out) = 150,000
    expect(balances['acc-checking']).toBe(150000);
    // Savings: 500,000 + 100,000 (transfer in) = 600,000
    expect(balances['acc-savings']).toBe(600000);
  });

  it('calculatePercentageChange calculates MoM delta correctly', () => {
    expect(calculatePercentageChange(120, 100)).toBe(20);
    expect(calculatePercentageChange(80, 100)).toBe(-20);
    expect(calculatePercentageChange(100, 0)).toBe(100);
    expect(calculatePercentageChange(0, 0)).toBe(0);
  });

  it('calculateBudgetStatus determines spent, remaining, percentage, and pace projection', () => {
    const budget: Budget = {
      id: 'b-1',
      categoryId: 'cat-groceries',
      monthlyLimit: 50000, // $500.00
    };

    const monthTx: Transaction[] = [
      {
        id: '1',
        type: 'expense',
        amount: 20000,
        categoryId: 'cat-groceries',
        accountId: 'acc-1',
        date: '2026-10-05',
        note: 'Market',
        tags: [],
      },
    ];

    // Reference date: Day 10 of a 31-day month
    const refDate = new Date('2026-10-10T12:00:00Z');
    const result = calculateBudgetStatus(budget, monthTx, refDate);

    expect(result.spent).toBe(20000);
    expect(result.remaining).toBe(30000);
    expect(result.percent).toBe(40);
    expect(result.status).toBe('under');
    // Daily pace: 20000 / 10 = 2000 per day
    expect(result.dailyPace).toBe(2000);
    // Projected month spend: 2000 * 31 = 62,000
    expect(result.projectedSpend).toBe(62000);
    // 62,000 > 50,000, so projected overspend should be true!
    expect(result.isProjectedOverspend).toBe(true);
  });

  it('calculateGoalProgress calculates remaining amount and estimated months remaining', () => {
    const goal: Goal = {
      id: 'g-1',
      name: 'Holiday Trip',
      targetAmount: 300000, // $3,000
      savedAmount: 180000, // $1,800
      targetDate: '2027-01-01',
    };

    const result = calculateGoalProgress(goal, 40000); // $400/mo contribution
    expect(result.remaining).toBe(120000); // $1,200 remaining
    expect(result.percent).toBe(60);
    expect(result.isCompleted).toBe(false);
    // 120,000 / 40,000 = 3 months
    expect(result.estimatedMonthsRemaining).toBe(3);
  });
});
