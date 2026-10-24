import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  getDaysInMonth,
  getDate,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { Transaction, Account, Budget, Goal } from '../types/finance';

/**
 * Calculates current net balance, total income, and total expenses across transactions.
 */
export function calculateTotals(transactions: Transaction[]) {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      income += t.amount;
    } else if (t.type === 'expense') {
      expense += t.amount;
    }
  }

  const net = income - expense;
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

  return { income, expense, net, savingsRate };
}

/**
 * Calculates balances for all accounts:
 * openingBalance + incomes - expenses + incoming transfers - outgoing transfers
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const acc of accounts) {
    balances[acc.id] = acc.openingBalance;
  }

  for (const t of transactions) {
    if (t.type === 'income' && balances[t.accountId] !== undefined) {
      balances[t.accountId] += t.amount;
    } else if (t.type === 'expense' && balances[t.accountId] !== undefined) {
      balances[t.accountId] -= t.amount;
    } else if (t.type === 'transfer') {
      if (balances[t.accountId] !== undefined) {
        balances[t.accountId] -= t.amount;
      }
      if (t.toAccountId && balances[t.toAccountId] !== undefined) {
        balances[t.toAccountId] += t.amount;
      }
    }
  }

  return balances;
}

/**
 * Filter transactions for a given month reference date
 */
export function getMonthTransactions(
  transactions: Transaction[],
  refDate: Date = new Date(),
  monthStartDay: number = 1
): Transaction[] {
  // Simple month boundary based on standard calendar month or start day
  const start = startOfMonth(refDate);
  const end = endOfMonth(refDate);

  return transactions.filter((t) => {
    try {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start, end });
    } catch {
      return false;
    }
  });
}

/**
 * Computes month-over-month percentage change safely
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

/**
 * Computes budget progress, remaining amount, and projected pace
 */
export function calculateBudgetStatus(
  budget: Budget,
  monthTransactions: Transaction[],
  now: Date = new Date()
) {
  const categoryExpenses = monthTransactions
    .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
    .reduce((sum, t) => sum + t.amount, 0);

  const spent = categoryExpenses;
  const remaining = budget.monthlyLimit - spent;
  const percent = budget.monthlyLimit > 0 ? Math.round((spent / budget.monthlyLimit) * 100) : 0;

  // Pace projection
  const daysInMonth = getDaysInMonth(now);
  const dayOfMonth = Math.max(1, getDate(now));
  const dailyPace = spent / dayOfMonth;
  const projectedSpend = Math.round(dailyPace * daysInMonth);
  const isProjectedOverspend = projectedSpend > budget.monthlyLimit;

  let status: 'under' | 'warning' | 'over' = 'under';
  if (percent > 100) {
    status = 'over';
  } else if (percent >= 80) {
    status = 'warning';
  }

  return {
    spent,
    remaining,
    percent,
    status,
    dailyPace: Math.round(dailyPace),
    projectedSpend,
    isProjectedOverspend,
  };
}

/**
 * 6-Month Income vs Expenses summary for Bar Charts
 */
export function getSixMonthSummary(transactions: Transaction[], refDate: Date = new Date()) {
  const result: Array<{
    monthKey: string;
    monthLabel: string;
    income: number;
    expense: number;
    net: number;
  }> = [];

  for (let i = 5; i >= 0; i--) {
    const targetMonth = subMonths(refDate, i);
    const start = startOfMonth(targetMonth);
    const end = endOfMonth(targetMonth);
    const monthLabel = format(targetMonth, 'MMM yyyy');
    const monthKey = format(targetMonth, 'yyyy-MM');

    const monthlyTx = transactions.filter((t) => {
      try {
        const d = parseISO(t.date);
        return isWithinInterval(d, { start, end });
      } catch {
        return false;
      }
    });

    const { income, expense, net } = calculateTotals(monthlyTx);

    result.push({
      monthKey,
      monthLabel,
      income,
      expense,
      net,
    });
  }

  return result;
}

/**
 * Calculates daily spending for line chart in current month
 */
export function getDailySpendingTrend(transactions: Transaction[], refDate: Date = new Date()) {
  const daysInMonth = getDaysInMonth(refDate);
  const currentMonthPrefix = format(refDate, 'yyyy-MM');
  const nowDay = getDate(refDate);

  const dailyMap: Record<number, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = 0;
  }

  for (const t of transactions) {
    if (t.type === 'expense' && t.date.startsWith(currentMonthPrefix)) {
      const day = parseInt(t.date.split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        dailyMap[day] = (dailyMap[day] || 0) + t.amount;
      }
    }
  }

  return Object.keys(dailyMap).map((dayStr) => {
    const day = parseInt(dayStr, 10);
    return {
      day: `Day ${day}`,
      dayNum: day,
      amount: dailyMap[day],
      isFuture: day > nowDay,
    };
  });
}

/**
 * Estimates savings goal completion date based on saved amount and monthly contribution pace
 */
export function calculateGoalProgress(goal: Goal, estimatedMonthlyContribution: number = 20000) {
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const percent = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
    : 0;

  let estimatedMonthsRemaining = 0;
  if (remaining > 0 && estimatedMonthlyContribution > 0) {
    estimatedMonthsRemaining = Math.ceil(remaining / estimatedMonthlyContribution);
  }

  return {
    remaining,
    percent,
    isCompleted: goal.savedAmount >= goal.targetAmount,
    estimatedMonthsRemaining,
  };
}
