export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'bank' | 'card' | 'wallet';
export type CategoryType = 'income' | 'expense';
export type Frequency = 'weekly' | 'monthly' | 'yearly';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Stored in minor units (e.g. 105000 = ₹1,050.00)
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: string; // ISO 'YYYY-MM-DD'
  time?: string; // e.g. "08:15 PM"
  note: string;
  descriptionDetail?: string; // e.g. "Evening dairy, veggies & essentials"
  merchant?: string;
  tags: string[];
  status?: 'Completed' | 'Pending' | 'Flagged';
  recurringId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number; // Stored in minor units
  accountNumber?: string; // e.g. "..8921"
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isArchived?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number; // Stored in minor units
  statusLabel?: 'On Track' | 'Near Limit' | 'Caution' | 'Well Managed' | 'Critical';
  subtitle?: string; // e.g. "14 logged transactions" or "Electricity, WiFi, Water"
  dailyAllowance?: number; // Minor units
}

export interface Goal {
  id: string;
  name: string;
  subtitle?: string; // e.g. "Workstation Upgrade" or "6 Months Living Expenses"
  targetAmount: number; // Stored in minor units
  savedAmount: number; // Stored in minor units
  targetDate: string; // ISO 'YYYY-MM-DD' or "Dec 2023"
  color?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'RECURRING' | 'LONG TERM';
  monthlyContribution?: number; // Minor units
  fundingMethod?: string; // e.g. "₹30,000/mo via ICICI AutoPay"
  paceStatusText?: string; // e.g. "On Pace (+₹12,700/mo)"
}

export interface SavingsMandate {
  id: string;
  goalName: string;
  mandateType: string; // e.g. "Standing Instruction (e-NACH)"
  cycleDate: string; // e.g. "01st of month"
  monthlyAllocation: number; // Minor units
  estCompletion: string; // e.g. "Dec 2023"
  status: 'Active' | 'Manual' | 'Paused';
}

export interface RecurringRule {
  id: string;
  name: string;
  amount: number; // Stored in minor units
  type: TransactionType;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  frequency: Frequency;
  nextDate: string; // ISO 'YYYY-MM-DD'
}

export interface Settings {
  currency: CurrencyCode;
  theme: ThemeMode;
  monthStartDay: number;
  userName: string;
  userEmail: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  undoAction?: () => void;
  duration?: number;
}

export interface SmartInsight {
  id: string;
  type: 'increase' | 'saving' | 'recurring' | 'anomaly' | 'positive';
  badge?: 'Alert' | 'Praise' | 'Opportunity' | 'Insight';
  title: string;
  message: string;
  subtext?: string;
  highlight?: string;
}

export interface FinanceData {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  recurringRules: RecurringRule[];
  mandates?: SavingsMandate[];
  settings: Settings;
}
