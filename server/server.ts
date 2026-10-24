import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  initDb,
  getFullBootstrap,
  dbAddTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbBulkDeleteTransactions,
  dbAddAccount,
  dbUpdateAccount,
  dbDeleteAccount,
  dbAddCategory,
  dbUpdateCategory,
  dbDeleteCategory,
  dbSetCategoryBudget,
  dbDeleteBudget,
  dbAddGoal,
  dbUpdateGoal,
  dbContributeToGoal,
  dbDeleteGoal,
  dbToggleMandate,
  dbMarkAllNotificationsRead,
  dbUpdateSettings,
  dbResetToDemo,
  dbClearAll,
} from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize DB schema & seed data
initDb();

// -------------------------------------------------------------
// System & Health Check
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: 'sqlite (node:sqlite)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Bootstrap Data (Hydrate entire application on initial load)
// -------------------------------------------------------------
app.get('/api/bootstrap', (_req: Request, res: Response) => {
  try {
    const data = getFullBootstrap();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve bootstrap data', details: err?.message });
  }
});

// -------------------------------------------------------------
// Auth & Session Simulation
// -------------------------------------------------------------
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { name, email } = req.body || {};
  const updated = dbUpdateSettings({
    userName: name || 'Arjun Mehta',
    userEmail: email || 'arjun@fintrack.io',
  });
  res.json({ success: true, user: updated });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// Transactions API
// -------------------------------------------------------------
app.get('/api/transactions', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.transactions);
});

app.post('/api/transactions', (req: Request, res: Response) => {
  try {
    const { type, amount, categoryId, accountId, date, note, toAccountId, tags, merchant, descriptionDetail } = req.body;
    if (!type || amount === undefined || !accountId || !date) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }
    const created = dbAddTransaction({
      type,
      amount: Number(amount),
      categoryId: categoryId || '',
      accountId,
      toAccountId,
      date,
      note: note || '',
      tags: tags || [],
      merchant,
      descriptionDetail,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create transaction', details: err?.message });
  }
});

app.put('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    const updated = dbUpdateTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update transaction', details: err?.message });
  }
});

app.delete('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    dbDeleteTransaction(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete transaction', details: err?.message });
  }
});

app.post('/api/transactions/bulk-delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    dbBulkDeleteTransactions(ids);
    res.json({ success: true, deletedCount: ids.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to bulk delete transactions', details: err?.message });
  }
});

app.post('/api/transactions/import', (req: Request, res: Response) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) return res.status(400).json({ error: 'transactions array required' });
    const imported = transactions.map((t) => dbAddTransaction(t));
    res.status(201).json({ success: true, count: imported.length, transactions: imported });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to import transactions', details: err?.message });
  }
});

// -------------------------------------------------------------
// Accounts API
// -------------------------------------------------------------
app.get('/api/accounts', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.accounts);
});

app.post('/api/accounts', (req: Request, res: Response) => {
  try {
    const { name, type, openingBalance, accountNumber, color } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
    const created = dbAddAccount({
      name,
      type,
      openingBalance: Number(openingBalance || 0),
      accountNumber,
      color,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create account', details: err?.message });
  }
});

app.put('/api/accounts/:id', (req: Request, res: Response) => {
  try {
    const updated = dbUpdateAccount(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Account not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update account', details: err?.message });
  }
});

app.delete('/api/accounts/:id', (req: Request, res: Response) => {
  try {
    dbDeleteAccount(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete account', details: err?.message });
  }
});

app.post('/api/accounts/transfer', (req: Request, res: Response) => {
  try {
    const { fromAccountId, toAccountId, amount, note, date } = req.body;
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ error: 'fromAccountId, toAccountId, and amount are required' });
    }
    const tx = dbAddTransaction({
      type: 'transfer',
      amount: Number(amount),
      categoryId: '',
      accountId: fromAccountId,
      toAccountId,
      date: date || new Date().toISOString().split('T')[0],
      note: note || 'Transfer between accounts',
      tags: ['transfer'],
    });
    res.status(201).json({ success: true, transaction: tx });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record transfer', details: err?.message });
  }
});

// -------------------------------------------------------------
// Categories API
// -------------------------------------------------------------
app.get('/api/categories', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  try {
    const { name, icon, color, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
    const created = dbAddCategory({
      name,
      icon: icon || 'Tag',
      color: color || '#10b981',
      type,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create category', details: err?.message });
  }
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  try {
    const updated = dbUpdateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update category', details: err?.message });
  }
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  try {
    dbDeleteCategory(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete category', details: err?.message });
  }
});

// -------------------------------------------------------------
// Budgets API
// -------------------------------------------------------------
app.get('/api/budgets', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.budgets);
});

app.post('/api/budgets', (req: Request, res: Response) => {
  try {
    const { categoryId, monthlyLimit } = req.body;
    if (!categoryId || monthlyLimit === undefined) {
      return res.status(400).json({ error: 'categoryId and monthlyLimit are required' });
    }
    const budget = dbSetCategoryBudget(categoryId, Number(monthlyLimit));
    res.status(201).json(budget);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save budget', details: err?.message });
  }
});

app.delete('/api/budgets/:id', (req: Request, res: Response) => {
  try {
    dbDeleteBudget(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete budget', details: err?.message });
  }
});

// -------------------------------------------------------------
// Goals API
// -------------------------------------------------------------
app.get('/api/goals', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.goals);
});

app.post('/api/goals', (req: Request, res: Response) => {
  try {
    const { name, targetAmount, targetDate, subtitle, color, priority, monthlyContribution, fundingMethod, paceStatusText } = req.body;
    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'name, targetAmount, and targetDate are required' });
    }
    const created = dbAddGoal({
      name,
      targetAmount: Number(targetAmount),
      targetDate,
      subtitle,
      color,
      priority,
      monthlyContribution,
      fundingMethod,
      paceStatusText,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create goal', details: err?.message });
  }
});

app.put('/api/goals/:id', (req: Request, res: Response) => {
  try {
    const updated = dbUpdateGoal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Goal not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update goal', details: err?.message });
  }
});

app.delete('/api/goals/:id', (req: Request, res: Response) => {
  try {
    dbDeleteGoal(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete goal', details: err?.message });
  }
});

app.post('/api/goals/:id/contribute', (req: Request, res: Response) => {
  try {
    const { amount, fromAccountId } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Positive contribution amount required' });
    const result = dbContributeToGoal(req.params.id, Number(amount), fromAccountId);
    if (!result) return res.status(404).json({ error: 'Goal not found' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to contribute to goal', details: err?.message });
  }
});

// -------------------------------------------------------------
// Mandates API
// -------------------------------------------------------------
app.get('/api/mandates', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.mandates || []);
});

app.put('/api/mandates/:id/toggle', (req: Request, res: Response) => {
  try {
    const result = dbToggleMandate(req.params.id);
    if (!result) return res.status(404).json({ error: 'Mandate not found' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle mandate', details: err?.message });
  }
});

// -------------------------------------------------------------
// Notifications API
// -------------------------------------------------------------
app.get('/api/notifications', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.notifications);
});

app.post('/api/notifications/mark-read', (_req: Request, res: Response) => {
  try {
    dbMarkAllNotificationsRead();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notifications read', details: err?.message });
  }
});

// -------------------------------------------------------------
// Settings API
// -------------------------------------------------------------
app.get('/api/settings', (_req: Request, res: Response) => {
  const data = getFullBootstrap();
  res.json(data.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  try {
    const updated = dbUpdateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings', details: err?.message });
  }
});

// -------------------------------------------------------------
// Bank Sync Simulation API
// -------------------------------------------------------------
app.post('/api/sync', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'All accounts synced successfully',
    syncedAt: new Date().toISOString(),
    accounts: [
      { name: 'ICICI Salary A/c', status: 'Healthy', pingMs: 142 },
      { name: 'HDFC Card ..4092', status: 'Healthy', pingMs: 98 },
      { name: 'Axis Bank ..5510', status: 'Healthy', pingMs: 110 },
      { name: 'Paytm UPI', status: 'Healthy', pingMs: 45 },
    ],
  });
});

// -------------------------------------------------------------
// Backup & Reset API
// -------------------------------------------------------------
app.post('/api/backup/reset-demo', (_req: Request, res: Response) => {
  try {
    dbResetToDemo();
    const data = getFullBootstrap();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset demo data', details: err?.message });
  }
});

app.post('/api/backup/clear', (_req: Request, res: Response) => {
  try {
    dbClearAll();
    res.json({ success: true, message: 'All data cleared' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear data', details: err?.message });
  }
});

// -------------------------------------------------------------
// Server Start
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[FinTrack Backend] Express server running at http://localhost:${PORT}`);
  console.log(`[FinTrack Backend] SQLite database active at server/data/fintrack.sqlite`);
});
