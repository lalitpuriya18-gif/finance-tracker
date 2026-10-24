import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Transaction,
  Account,
  Category,
  Budget,
  Goal,
  SavingsMandate,
  Settings,
  FinanceData,
} from '../src/types/finance';
import { getSeedData, DEFAULT_CATEGORIES } from '../src/lib/seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.resolve(DATA_DIR, 'fintrack.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for high performance and durability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export interface DbNotification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  time_text: string;
  type: string;
  is_unread: number;
  link: string;
  created_at: string;
}

export function initDb() {
  // 1. Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 2. Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      currency TEXT NOT NULL DEFAULT 'INR',
      theme TEXT NOT NULL DEFAULT 'light',
      month_start_day INTEGER NOT NULL DEFAULT 1,
      user_name TEXT NOT NULL DEFAULT 'Arjun Mehta',
      user_email TEXT NOT NULL DEFAULT 'arjun@fintrack.io',
      updated_at TEXT NOT NULL
    );
  `);

  // 3. Accounts
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'user-default',
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      opening_balance INTEGER NOT NULL DEFAULT 0,
      account_number TEXT,
      color TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 4. Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'user-default',
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // 5. Transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'user-default',
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      to_account_id TEXT,
      date TEXT NOT NULL,
      time TEXT,
      note TEXT NOT NULL DEFAULT '',
      description_detail TEXT,
      merchant TEXT,
      tags TEXT, -- JSON array
      status TEXT DEFAULT 'Completed',
      created_at TEXT NOT NULL
    );
  `);

  // 6. Budgets
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'user-default',
      category_id TEXT NOT NULL,
      monthly_limit INTEGER NOT NULL,
      subtitle TEXT,
      daily_allowance INTEGER,
      created_at TEXT NOT NULL
    );
  `);

  // 7. Goals
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'user-default',
      name TEXT NOT NULL,
      subtitle TEXT,
      target_amount INTEGER NOT NULL,
      saved_amount INTEGER NOT NULL DEFAULT 0,
      target_date TEXT NOT NULL,
      color TEXT,
      priority TEXT,
      monthly_contribution INTEGER,
      funding_method TEXT,
      pace_status_text TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 8. Mandates
  db.exec(`
    CREATE TABLE IF NOT EXISTS mandates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'user-default',
      goal_name TEXT NOT NULL,
      mandate_type TEXT NOT NULL,
      cycle_date TEXT NOT NULL,
      monthly_allocation INTEGER NOT NULL,
      est_completion TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT NOT NULL
    );
  `);

  // 9. Notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'user-default',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      time_text TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_unread INTEGER NOT NULL DEFAULT 1,
      link TEXT NOT NULL DEFAULT '/dashboard',
      created_at TEXT NOT NULL
    );
  `);

  // Initialize default categories if none exist
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (catCount.count === 0) {
    seedDefaultCategories('user-default');
  }

  // Initialize default settings if none exist
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT OR REPLACE INTO settings (user_id, currency, theme, month_start_day, user_name, user_email, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('user-default', 'INR', 'light', 1, 'FinTrack User', 'user@fintrack.io', new Date().toISOString());
  }
}

export function seedDefaultCategories(userId = 'user-default') {
  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO categories (id, user_id, name, icon, color, type, is_archived, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cat of DEFAULT_CATEGORIES) {
    insertCat.run(cat.id, userId, cat.name, cat.icon, cat.color, cat.type, 0, new Date().toISOString());
  }
}

export function seedDatabase(userId = 'user-default') {
  const seed = getSeedData();

  // 1. User
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, avatar, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertUser.run(userId, seed.settings.userName, seed.settings.userEmail, '', new Date().toISOString());

  // 2. Settings
  const insertSettings = db.prepare(`
    INSERT OR REPLACE INTO settings (user_id, currency, theme, month_start_day, user_name, user_email, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertSettings.run(
    userId,
    seed.settings.currency,
    seed.settings.theme,
    seed.settings.monthStartDay,
    seed.settings.userName,
    seed.settings.userEmail,
    new Date().toISOString()
  );

  // 3. Accounts
  const insertAccount = db.prepare(`
    INSERT OR REPLACE INTO accounts (id, user_id, name, type, opening_balance, account_number, color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const acc of seed.accounts) {
    insertAccount.run(acc.id, userId, acc.name, acc.type, acc.openingBalance, acc.accountNumber || '', acc.color || '', new Date().toISOString());
  }

  // 4. Categories
  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO categories (id, user_id, name, icon, color, type, is_archived, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cat of seed.categories) {
    insertCat.run(cat.id, userId, cat.name, cat.icon, cat.color, cat.type, cat.isArchived ? 1 : 0, new Date().toISOString());
  }

  // 5. Transactions
  const insertTx = db.prepare(`
    INSERT OR REPLACE INTO transactions (id, user_id, type, amount, category_id, account_id, to_account_id, date, time, note, description_detail, merchant, tags, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const tx of seed.transactions) {
    insertTx.run(
      tx.id,
      userId,
      tx.type,
      tx.amount,
      tx.categoryId,
      tx.accountId,
      tx.toAccountId || '',
      tx.date,
      tx.time || '',
      tx.note || '',
      tx.descriptionDetail || '',
      tx.merchant || '',
      JSON.stringify(tx.tags || []),
      tx.status || 'Completed',
      new Date().toISOString()
    );
  }

  // 6. Budgets
  const insertBudget = db.prepare(`
    INSERT OR REPLACE INTO budgets (id, user_id, category_id, monthly_limit, subtitle, daily_allowance, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const b of seed.budgets) {
    insertBudget.run(b.id, userId, b.categoryId, b.monthlyLimit, b.subtitle || '', b.dailyAllowance || 0, new Date().toISOString());
  }

  // 7. Goals
  const insertGoal = db.prepare(`
    INSERT OR REPLACE INTO goals (id, user_id, name, subtitle, target_amount, saved_amount, target_date, color, priority, monthly_contribution, funding_method, pace_status_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const g of seed.goals) {
    insertGoal.run(
      g.id,
      userId,
      g.name,
      g.subtitle || '',
      g.targetAmount,
      g.savedAmount,
      g.targetDate,
      g.color || '',
      g.priority || 'MEDIUM',
      g.monthlyContribution || 0,
      g.fundingMethod || '',
      g.paceStatusText || '',
      new Date().toISOString()
    );
  }

  // 8. Mandates
  const insertMandate = db.prepare(`
    INSERT OR REPLACE INTO mandates (id, user_id, goal_name, mandate_type, cycle_date, monthly_allocation, est_completion, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  if (seed.mandates) {
    for (const m of seed.mandates) {
      insertMandate.run(m.id, userId, m.goalName, m.mandateType, m.cycleDate, m.monthlyAllocation, m.estCompletion, m.status, new Date().toISOString());
    }
  }

  // 9. Default Notifications
  const insertNotif = db.prepare(`
    INSERT OR REPLACE INTO notifications (id, user_id, title, description, time_text, type, is_unread, link, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const initialNotifs = [
    {
      id: 'notif-1',
      title: 'Upcoming Subscription Renewal',
      description: 'Cult.fit Pass (₹14,990) scheduled for auto-debit on Nov 12.',
      time_text: '10m ago',
      type: 'warning',
      is_unread: 1,
      link: '/reports',
    },
    {
      id: 'notif-2',
      title: 'Real-time Bank Feed Synchronized',
      description: 'ICICI Bank, HDFC Card, and Paytm balances successfully updated in SQLite database.',
      time_text: '25m ago',
      type: 'success',
      is_unread: 1,
      link: '/transactions',
    },
    {
      id: 'notif-3',
      title: 'Savings Milestone Accelerated',
      description: 'You maintained a 52.8% savings velocity in October, beating target.',
      time_text: '2h ago',
      type: 'info',
      is_unread: 1,
      link: '/goals',
    },
  ];

  for (const n of initialNotifs) {
    insertNotif.run(n.id, userId, n.title, n.description, n.time_text, n.type, n.is_unread, n.link, new Date().toISOString());
  }
}

// -------------------------------------------------------------
// Database Access Helpers
// -------------------------------------------------------------

export function getFullBootstrap(userId = 'user-default'): FinanceData & { notifications: DbNotification[] } {
  // Settings
  const sRow = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId) as any;
  const settings: Settings = sRow
    ? {
        currency: sRow.currency,
        theme: sRow.theme,
        monthStartDay: sRow.month_start_day,
        userName: sRow.user_name,
        userEmail: sRow.user_email,
      }
    : {
        currency: 'INR',
        theme: 'light',
        monthStartDay: 1,
        userName: 'FinTrack User',
        userEmail: 'user@fintrack.io',
      };

  // Accounts
  const aRows = db.prepare('SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
  const accounts: Account[] = aRows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    openingBalance: r.opening_balance,
    accountNumber: r.account_number || undefined,
    color: r.color || undefined,
  }));

  // Categories
  const cRows = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC').all(userId) as any[];
  const categories: Category[] = cRows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    type: r.type,
    isArchived: r.is_archived === 1,
  }));

  // Transactions
  const tRows = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC').all(userId) as any[];
  const transactions: Transaction[] = tRows.map((r) => ({
    id: r.id,
    type: r.type,
    amount: r.amount,
    categoryId: r.category_id,
    accountId: r.account_id,
    toAccountId: r.to_account_id || undefined,
    date: r.date,
    time: r.time || undefined,
    note: r.note,
    descriptionDetail: r.description_detail || undefined,
    merchant: r.merchant || undefined,
    tags: r.tags ? JSON.parse(r.tags) : [],
    status: r.status,
  }));

  // Budgets
  const bRows = db.prepare('SELECT * FROM budgets WHERE user_id = ?').all(userId) as any[];
  const budgets: Budget[] = bRows.map((r) => ({
    id: r.id,
    categoryId: r.category_id,
    monthlyLimit: r.monthly_limit,
    subtitle: r.subtitle || undefined,
    dailyAllowance: r.daily_allowance || undefined,
  }));

  // Goals
  const gRows = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
  const goals: Goal[] = gRows.map((r) => ({
    id: r.id,
    name: r.name,
    subtitle: r.subtitle || undefined,
    targetAmount: r.target_amount,
    savedAmount: r.saved_amount,
    targetDate: r.target_date,
    color: r.color || undefined,
    priority: r.priority || undefined,
    monthlyContribution: r.monthly_contribution || undefined,
    fundingMethod: r.funding_method || undefined,
    paceStatusText: r.pace_status_text || undefined,
  }));

  // Mandates
  const mRows = db.prepare('SELECT * FROM mandates WHERE user_id = ?').all(userId) as any[];
  const mandates: SavingsMandate[] = mRows.map((r) => ({
    id: r.id,
    goalName: r.goal_name,
    mandateType: r.mandate_type,
    cycleDate: r.cycle_date,
    monthlyAllocation: r.monthly_allocation,
    estCompletion: r.est_completion,
    status: r.status,
  }));

  // Notifications
  const nRows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  const notifications: DbNotification[] = nRows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    title: r.title,
    description: r.description,
    time_text: r.time_text,
    type: r.type,
    is_unread: r.is_unread,
    link: r.link,
    created_at: r.created_at,
  }));

  return {
    transactions,
    accounts,
    categories,
    budgets,
    goals,
    recurringRules: [],
    mandates,
    settings,
    notifications,
  };
}

// Transactions
export function dbAddTransaction(tx: Omit<Transaction, 'id'> & { id?: string }, userId = 'user-default'): Transaction {
  const newTx: Transaction = {
    ...tx,
    id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  const stmt = db.prepare(`
    INSERT INTO transactions (id, user_id, type, amount, category_id, account_id, to_account_id, date, time, note, description_detail, merchant, tags, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    newTx.id,
    userId,
    newTx.type,
    newTx.amount,
    newTx.categoryId,
    newTx.accountId,
    newTx.toAccountId || '',
    newTx.date,
    newTx.time || '',
    newTx.note || '',
    newTx.descriptionDetail || '',
    newTx.merchant || '',
    JSON.stringify(newTx.tags || []),
    newTx.status || 'Completed',
    new Date().toISOString()
  );
  return newTx;
}

export function dbUpdateTransaction(id: string, updates: Partial<Transaction>, userId = 'user-default') {
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) return null;

  const type = updates.type !== undefined ? updates.type : existing.type;
  const amount = updates.amount !== undefined ? updates.amount : existing.amount;
  const categoryId = updates.categoryId !== undefined ? updates.categoryId : existing.category_id;
  const accountId = updates.accountId !== undefined ? updates.accountId : existing.account_id;
  const toAccountId = updates.toAccountId !== undefined ? updates.toAccountId : existing.to_account_id;
  const date = updates.date !== undefined ? updates.date : existing.date;
  const time = updates.time !== undefined ? updates.time : existing.time;
  const note = updates.note !== undefined ? updates.note : existing.note;
  const descriptionDetail = updates.descriptionDetail !== undefined ? updates.descriptionDetail : existing.description_detail;
  const merchant = updates.merchant !== undefined ? updates.merchant : existing.merchant;
  const tags = updates.tags !== undefined ? JSON.stringify(updates.tags) : existing.tags;
  const status = updates.status !== undefined ? updates.status : existing.status;

  db.prepare(`
    UPDATE transactions
    SET type = ?, amount = ?, category_id = ?, account_id = ?, to_account_id = ?, date = ?, time = ?, note = ?, description_detail = ?, merchant = ?, tags = ?, status = ?
    WHERE id = ? AND user_id = ?
  `).run(type, amount, categoryId, accountId, toAccountId, date, time, note, descriptionDetail, merchant, tags, status, id, userId);

  return { id, ...updates };
}

export function dbDeleteTransaction(id: string, userId = 'user-default') {
  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);
}

export function dbBulkDeleteTransactions(ids: string[], userId = 'user-default') {
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
  for (const id of ids) {
    stmt.run(id, userId);
  }
}

// Accounts
export function dbAddAccount(acc: Omit<Account, 'id'> & { id?: string }, userId = 'user-default'): Account {
  const newAcc: Account = {
    ...acc,
    id: acc.id || `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  db.prepare(`
    INSERT INTO accounts (id, user_id, name, type, opening_balance, account_number, color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newAcc.id, userId, newAcc.name, newAcc.type, newAcc.openingBalance, newAcc.accountNumber || '', newAcc.color || '', new Date().toISOString());
  return newAcc;
}

export function dbUpdateAccount(id: string, updates: Partial<Account>, userId = 'user-default') {
  const existing = db.prepare('SELECT * FROM accounts WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) return null;

  const name = updates.name !== undefined ? updates.name : existing.name;
  const type = updates.type !== undefined ? updates.type : existing.type;
  const openingBalance = updates.openingBalance !== undefined ? updates.openingBalance : existing.opening_balance;
  const accountNumber = updates.accountNumber !== undefined ? updates.accountNumber : existing.account_number;
  const color = updates.color !== undefined ? updates.color : existing.color;

  db.prepare(`
    UPDATE accounts SET name = ?, type = ?, opening_balance = ?, account_number = ?, color = ? WHERE id = ? AND user_id = ?
  `).run(name, type, openingBalance, accountNumber, color, id, userId);

  return { id, ...updates };
}

export function dbDeleteAccount(id: string, userId = 'user-default') {
  db.prepare('DELETE FROM accounts WHERE id = ? AND user_id = ?').run(id, userId);
  db.prepare('DELETE FROM transactions WHERE (account_id = ? OR to_account_id = ?) AND user_id = ?').run(id, id, userId);
}

// Categories
export function dbAddCategory(cat: Omit<Category, 'id'> & { id?: string }, userId = 'user-default'): Category {
  const newCat: Category = {
    ...cat,
    id: cat.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  db.prepare(`
    INSERT INTO categories (id, user_id, name, icon, color, type, is_archived, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newCat.id, userId, newCat.name, newCat.icon, newCat.color, newCat.type, newCat.isArchived ? 1 : 0, new Date().toISOString());
  return newCat;
}

export function dbUpdateCategory(id: string, updates: Partial<Category>, userId = 'user-default') {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) return null;

  const name = updates.name !== undefined ? updates.name : existing.name;
  const icon = updates.icon !== undefined ? updates.icon : existing.icon;
  const color = updates.color !== undefined ? updates.color : existing.color;
  const type = updates.type !== undefined ? updates.type : existing.type;
  const isArchived = updates.isArchived !== undefined ? (updates.isArchived ? 1 : 0) : existing.is_archived;

  db.prepare(`
    UPDATE categories SET name = ?, icon = ?, color = ?, type = ?, is_archived = ? WHERE id = ? AND user_id = ?
  `).run(name, icon, color, type, isArchived, id, userId);

  return { id, ...updates };
}

export function dbDeleteCategory(id: string, userId = 'user-default') {
  db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(id, userId);
  db.prepare('DELETE FROM budgets WHERE category_id = ? AND user_id = ?').run(id, userId);
}

// Budgets
export function dbSetCategoryBudget(categoryId: string, monthlyLimit: number, userId = 'user-default'): Budget {
  const existing = db.prepare('SELECT * FROM budgets WHERE category_id = ? AND user_id = ?').get(categoryId, userId) as any;
  if (existing) {
    db.prepare('UPDATE budgets SET monthly_limit = ? WHERE category_id = ? AND user_id = ?').run(monthlyLimit, categoryId, userId);
    return {
      id: existing.id,
      categoryId,
      monthlyLimit,
    };
  } else {
    const id = `b-${Date.now()}`;
    db.prepare(`
      INSERT INTO budgets (id, user_id, category_id, monthly_limit, subtitle, daily_allowance, created_at)
      VALUES (?, ?, ?, ?, '', 0, ?)
    `).run(id, userId, categoryId, monthlyLimit, new Date().toISOString());
    return {
      id,
      categoryId,
      monthlyLimit,
    };
  }
}

export function dbDeleteBudget(id: string, userId = 'user-default') {
  db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(id, userId);
}

// Goals
export function dbAddGoal(goal: Omit<Goal, 'id' | 'savedAmount'> & { id?: string; savedAmount?: number }, userId = 'user-default'): Goal {
  const newGoal: Goal = {
    ...goal,
    id: goal.id || `g-${Date.now()}`,
    savedAmount: goal.savedAmount || 0,
  };
  db.prepare(`
    INSERT INTO goals (id, user_id, name, subtitle, target_amount, saved_amount, target_date, color, priority, monthly_contribution, funding_method, pace_status_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newGoal.id,
    userId,
    newGoal.name,
    newGoal.subtitle || '',
    newGoal.targetAmount,
    newGoal.savedAmount,
    newGoal.targetDate,
    newGoal.color || '',
    newGoal.priority || 'MEDIUM',
    newGoal.monthlyContribution || 0,
    newGoal.fundingMethod || '',
    newGoal.paceStatusText || '',
    new Date().toISOString()
  );
  return newGoal;
}

export function dbUpdateGoal(id: string, updates: Partial<Goal>, userId = 'user-default') {
  const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) return null;

  const name = updates.name !== undefined ? updates.name : existing.name;
  const subtitle = updates.subtitle !== undefined ? updates.subtitle : existing.subtitle;
  const targetAmount = updates.targetAmount !== undefined ? updates.targetAmount : existing.target_amount;
  const savedAmount = updates.savedAmount !== undefined ? updates.savedAmount : existing.saved_amount;
  const targetDate = updates.targetDate !== undefined ? updates.targetDate : existing.target_date;
  const color = updates.color !== undefined ? updates.color : existing.color;
  const priority = updates.priority !== undefined ? updates.priority : existing.priority;

  db.prepare(`
    UPDATE goals SET name = ?, subtitle = ?, target_amount = ?, saved_amount = ?, target_date = ?, color = ?, priority = ? WHERE id = ? AND user_id = ?
  `).run(name, subtitle, targetAmount, savedAmount, targetDate, color, priority, id, userId);

  return { id, ...updates };
}

export function dbContributeToGoal(id: string, amount: number, fromAccountId?: string, userId = 'user-default') {
  const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) return null;

  const newSaved = existing.saved_amount + amount;
  db.prepare('UPDATE goals SET saved_amount = ? WHERE id = ? AND user_id = ?').run(newSaved, id, userId);

  if (fromAccountId) {
    dbAddTransaction(
      {
        type: 'expense',
        amount,
        categoryId: 'cat-savings-deposit',
        accountId: fromAccountId,
        date: new Date().toISOString().split('T')[0],
        note: `Contribution to ${existing.name}`,
        tags: ['goal-contribution', 'savings'],
      },
      userId
    );
  }

  return { id, savedAmount: newSaved };
}

export function dbDeleteGoal(id: string, userId = 'user-default') {
  db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, userId);
}

// Mandates
export function dbToggleMandate(id: string, userId = 'user-default') {
  const existing = db.prepare('SELECT * FROM mandates WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) return null;

  const newStatus = existing.status === 'Active' ? 'Paused' : 'Active';
  db.prepare('UPDATE mandates SET status = ? WHERE id = ? AND user_id = ?').run(newStatus, id, userId);
  return { id, status: newStatus };
}

// Notifications
export function dbMarkAllNotificationsRead(userId = 'user-default') {
  db.prepare('UPDATE notifications SET is_unread = 0 WHERE user_id = ?').run(userId);
}

// Settings
export function dbUpdateSettings(updates: Partial<Settings>, userId = 'user-default') {
  const existing = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId) as any;
  const currency = updates.currency || existing?.currency || 'INR';
  const theme = updates.theme || existing?.theme || 'light';
  const monthStartDay = updates.monthStartDay || existing?.month_start_day || 1;
  const userName = updates.userName || existing?.user_name || 'FinTrack User';
  const userEmail = updates.userEmail || existing?.user_email || 'user@fintrack.io';

  db.prepare(`
    INSERT OR REPLACE INTO settings (user_id, currency, theme, month_start_day, user_name, user_email, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, currency, theme, monthStartDay, userName, userEmail, new Date().toISOString());

  return { currency, theme, monthStartDay, userName, userEmail };
}

// Reset & Clear
export function dbResetToDemo(userId = 'user-default') {
  dbClearAll(userId);
}

export function dbClearAll(userId = 'user-default') {
  db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM accounts WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM mandates WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);

  db.prepare(`
    INSERT OR REPLACE INTO settings (user_id, currency, theme, month_start_day, user_name, user_email, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, 'INR', 'light', 1, 'FinTrack User', 'user@fintrack.io', new Date().toISOString());

  // Ensure standard categories exist so user can immediately create transactions
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories WHERE user_id = ?').get(userId) as { count: number };
  if (catCount.count === 0) {
    seedDefaultCategories(userId);
  }
}
