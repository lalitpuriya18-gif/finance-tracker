# FinTrack — Personal Wealth OS & Finance Tracker

A production-quality, responsive personal finance tracking web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Recharts**, **Zustand**, and **date-fns**.

Designed with a modern fintech aesthetic inspired by Google Stitch: calm backgrounds, clean 12px rounded cards, subtle shadows, Inter typography, emerald/teal primary highlights, and tabular figures for aligned numbers.

---

## ⚡ Quick Start

### 1. Install & Run Locally

```bash
# Navigate to project directory
cd fintrack

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit the local development URL (typically `http://localhost:5173/`) in your browser.

### 2. Run Automated Unit Tests

```bash
npm run test:run
```

Runs the Vitest suite covering integer money math, account balance calculations, budget pace projections, and savings rates.

### 3. Build for Production

```bash
npm run build
```

---

## 🎓 Beginner-Friendly & Academic Architecture Guide

FinTrack is built using fundamental, clean programming technologies so that a college student can easily understand, explain in an academic viva, and maintain the entire project:

| Technology | Role in FinTrack | Key Implementation File |
| :--- | :--- | :--- |
| **HTML5** | Semantic structure for all pages, navigation, tables, and dialog forms | [`backend/templates/*.html`](file:///C:/Users/Asus/.gemini/antigravity/scratch/fintrack/backend/templates) |
| **CSS3** | Responsive layouts using Flexbox, CSS Grid, custom variables & dark mode | [`backend/static/css/style.css`](file:///C:/Users/Asus/.gemini/antigravity/scratch/fintrack/backend/static/css/style.css) |
| **JavaScript** | DOM manipulation, modal controls, real-time search, filters, and `fetch()` API | [`backend/static/js/app.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/fintrack/backend/static/js/app.js) |
| **Python (Flask)** | Web server routing, template rendering (Jinja2), and JSON REST endpoints | [`backend/app.py`](file:///C:/Users/Asus/.gemini/antigravity/scratch/fintrack/backend/app.py) |
| **SQLite** | Local relational database with ACID transactions, foreign keys, and indexes | [`backend/database.py`](file:///C:/Users/Asus/.gemini/antigravity/scratch/fintrack/backend/database.py) |

### 🚀 Running the Python (Flask) Web Application
```bash
# Start the Flask web application
python backend/app.py
```
Open **[http://127.0.0.1:5000/](http://127.0.0.1:5000/)** in your browser. All pages (`Dashboard`, `Transactions`, `Budgets`, `Goals`, `Reports`, `Accounts`, `Settings`) render directly via pure HTML5, CSS3, and JavaScript connected to SQLite!

### 🧪 Running the Complete Automated Test Suite (37 Tests)
```bash
# Run all tests (Vitest + Pytest)
npm run test:all

# Or run only the Python backend tests (21 tests)
npm run test:py
# or: pytest backend/tests -v
```

---

## 📁 Project Architecture & Structure

```
fintrack/
├── src/
│   ├── types/
│   │   └── finance.ts         # TypeScript models: Transaction, Account, Category, Budget, Goal, RecurringRule, Settings
│   ├── lib/
│   │   ├── currency.ts        # Precision minor-units conversion and currency formatting
│   │   ├── calculations.ts    # Pure math functions: net cash flow, savings rate, budget pace projections
│   │   ├── insights.ts        # Rule-based intelligence engine (MoM comparison, anomaly detector, subscriptions)
│   │   ├── csv.ts             # CSV parser with column mapping detection and CSV exporter
│   │   ├── storage.ts         # IStorageProvider abstraction layer (LocalStorage & Supabase migration ready)
│   │   └── seedData.ts        # Rich realistic demo dataset (3 months, 4 accounts, 40+ transactions)
│   ├── store/
│   │   └── useFinanceStore.ts # Central Zustand state store with reactive local persistence and undo toasts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx    # Desktop left navigation with Net Worth indicator
│   │   │   ├── MobileTabBar.tsx # Mobile bottom navigation
│   │   │   ├── Header.tsx     # Top bar with currency badge, theme switch, and quick transaction trigger
│   │   │   └── Layout.tsx     # Primary responsive application shell
│   │   ├── ui/
│   │   │   ├── Card.tsx, Button.tsx, Modal.tsx, Badge.tsx, Input.tsx, Select.tsx, ProgressBar.tsx
│   │   │   └── Toast.tsx      # Undo-enabled toast notification container
│   │   ├── dashboard/
│   │   │   ├── KpiCards.tsx   # Net balance, Income, Expense, Savings rate with MoM deltas
│   │   │   ├── SmartInsights.tsx # Plain-language financial insights and anomaly warnings
│   │   │   ├── ChartsSection.tsx # Recharts: 6-mo Bar, Donut Category Share, Daily Spend Trend
│   │   │   ├── BudgetQuickList.tsx # Monthly budget pace indicators
│   │   │   └── RecentTransactions.tsx # Recent entries and upcoming recurring commitments
│   │   ├── transactions/
│   │   │   ├── TransactionFilters.tsx # Search, Category, Account, Type, Date range filters
│   │   │   ├── TransactionTable.tsx # Sortable, paginated table with bulk delete and undo toast
│   │   │   ├── TransactionModal.tsx # Add/Edit transaction with validation
│   │   │   └── CsvImportModal.tsx   # Bank statement CSV import with auto-column mapping preview
│   │   ├── budgets/
│   │   │   ├── BudgetCard.tsx # Spent vs Limit, daily pace, and projected overspend alert
│   │   │   └── BudgetModal.tsx # Set and edit category budgets
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx   # Circular progress ring, estimated completion date, contribution action
│   │   │   ├── GoalModal.tsx  # Add/edit goal
│   │   │   └── ContributionModal.tsx # Quick deposit from an account into a savings goal
│   │   ├── accounts/
│   │   │   ├── AccountCard.tsx # Balance card with bank/card/wallet styling
│   │   │   ├── AccountModal.tsx # Add/edit account
│   │   │   └── TransferModal.tsx # Inter-account transfers (non-income/expense)
│   │   └── reports/
│   │       ├── ReportSummary.tsx # Monthly/yearly summary, net worth trend, category distribution, top 5 merchants
│   │       └── PrintView.tsx     # Clean print stylesheet for PDF exports
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── BudgetsPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── AccountsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   └── tests/
│       ├── calculations.test.ts
│       └── currency.test.ts
└── index.html
```

---

## 💰 Integer Minor Units Money Math

Floating-point numbers in JavaScript suffer from IEEE 754 precision issues (e.g. `0.1 + 0.2 === 0.30000000000000004`).

To guarantee 100% calculation accuracy:
- All monetary amounts are stored as **integers in minor units** (e.g., USD cents: `$45.99` $\rightarrow$ `4599`, JPY yen: `¥500` $\rightarrow$ `500`).
- Formatting utilities in [`src/lib/currency.ts`](src/lib/currency.ts) convert values strictly for display.
- Inputs parse strings safely into integers using `parseMoneyToMinor(str, currency)`.

---

## 🔄 How to Swap LocalStorage for Supabase

FinTrack is built with a decoupled storage abstraction in [`src/lib/storage.ts`](src/lib/storage.ts) implementing the `IStorageProvider` interface:

```typescript
export interface IStorageProvider {
  loadData(): Promise<FinanceData | null>;
  saveData(data: FinanceData): Promise<void>;
  clearData(): Promise<void>;
}
```

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Tables

Execute this schema in your Supabase SQL Editor:

```sql
-- Create user finance document table
create table public.user_finance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  payload jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.user_finance enable row level security;

create policy "Users can view own data"
  on public.user_finance for select
  using (auth.uid() = user_id);

create policy "Users can insert/update own data"
  on public.user_finance for all
  using (auth.uid() = user_id);
```

### Step 3: Implement `SupabaseStorageProvider` in `src/lib/storage.ts`

Replace the default export in `src/lib/storage.ts` with:

```typescript
import { createClient } from '@supabase/supabase-js';
import { FinanceData } from '../types/finance';
import { IStorageProvider } from './storage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseStorageProvider implements IStorageProvider {
  async loadData(): Promise<FinanceData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_finance')
      .select('payload')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) return null;
    return data.payload as FinanceData;
  }

  async saveData(data: FinanceData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_finance')
      .upsert({
        user_id: user.id,
        payload: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
  }

  async clearData(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_finance')
      .delete()
      .eq('user_id', user.id);
  }
}

// Export Supabase as the active provider:
export const storage: IStorageProvider = new SupabaseStorageProvider();
```

Because the entire application reads and writes exclusively through `storage.loadData()` and `storage.saveData()`, **zero changes** are required in the UI components, pages, or store.

---

## 💡 Key Features Included

1. **Dashboard**:
   - 4 KPI cards (Net balance, Income, Expenses, Savings rate) with Month-over-Month (% and pp) change indicators.
   - Smart Insights Card: 3-4 plain-language rule-based insights + anomaly warnings.
   - 6-month comparative bar chart, category donut breakdown, and daily spend line chart.
   - Budget pace quick list and upcoming recurring payment widget.
2. **Transactions**:
   - Full filtering by search query, category, account, type, and date range.
   - Table sorting (Date, Amount, Note) and pagination.
   - Bulk select and delete.
   - Delete action with 6-second undo toast notification.
   - CSV statement import with column auto-mapping preview.
   - CSV export matching current ledger state.
3. **Budgets**:
   - Category limits with real-time daily spending pace calculation.
   - Automated month-end projected overspend alerts.
4. **Goals**:
   - Savings goals with circular progress rings.
   - Quick "Contribute" deposit action linked to accounts.
   - Automatic estimated completion date projection.
5. **Accounts**:
   - Balances across checking, savings, credit cards, and cash wallets.
   - Inter-account transfers (moves money without altering income or expense metrics).
6. **Reports**:
   - Monthly and yearly breakdowns.
   - Net cash flow trend chart.
   - Top 5 merchants/payees ranking.
   - Clean print / PDF export view (`window.print()`).
7. **Settings**:
   - 7 selectable base currencies with precision decimal handling.
   - Dark mode / Light mode / System theme synchronization.
   - Custom month start day (1–28).
   - Custom category manager (add, edit, recolor, icon select, delete).
   - Full JSON backup export and restore.
   - "Clear demo data" and "Reset to demo data" actions.
