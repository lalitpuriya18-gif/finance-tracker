import { subMonths, format } from 'date-fns';
import {
  Transaction,
  Category,
  Goal,
  RecurringRule,
  SmartInsight,
  CurrencyCode,
} from '../types/finance';
import { getMonthTransactions } from './calculations';
import { formatMoney } from './currency';

export function generateSmartInsights(
  transactions: Transaction[],
  categories: Category[],
  goals: Goal[],
  recurringRules: RecurringRule[],
  currency: CurrencyCode = 'USD',
  refDate: Date = new Date()
): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const currentMonthTx = getMonthTransactions(transactions, refDate);
  const prevMonthTx = getMonthTransactions(transactions, subMonths(refDate, 1));

  // 1. Category Month-over-Month Spike Check
  const currentCatSpend: Record<string, number> = {};
  const prevCatSpend: Record<string, number> = {};

  for (const t of currentMonthTx) {
    if (t.type === 'expense') {
      currentCatSpend[t.categoryId] = (currentCatSpend[t.categoryId] || 0) + t.amount;
    }
  }

  for (const t of prevMonthTx) {
    if (t.type === 'expense') {
      prevCatSpend[t.categoryId] = (prevCatSpend[t.categoryId] || 0) + t.amount;
    }
  }

  let topSpikeCatId = '';
  let highestPercentageSpike = 0;

  for (const [catId, currentAmt] of Object.entries(currentCatSpend)) {
    const prevAmt = prevCatSpend[catId] || 0;
    if (prevAmt > 5000 && currentAmt > prevAmt) {
      const pctIncrease = Math.round(((currentAmt - prevAmt) / prevAmt) * 100);
      if (pctIncrease > highestPercentageSpike) {
        highestPercentageSpike = pctIncrease;
        topSpikeCatId = catId;
      }
    }
  }

  if (topSpikeCatId && highestPercentageSpike >= 15) {
    const cat = categoryMap.get(topSpikeCatId);
    const catName = cat?.name || 'Category';
    insights.push({
      id: 'insight-spike',
      type: 'increase',
      title: `${catName} spending is up`,
      message: `${catName} spending is ${highestPercentageSpike}% higher than last month. Consider reviewing recent expenses.`,
      highlight: `+${highestPercentageSpike}%`,
    });
  }

  // 2. Subscriptions & Recurring Commitments Total
  let recurringMonthlyTotal = 0;
  for (const rule of recurringRules) {
    if (rule.type === 'expense') {
      if (rule.frequency === 'monthly') {
        recurringMonthlyTotal += rule.amount;
      } else if (rule.frequency === 'weekly') {
        recurringMonthlyTotal += rule.amount * 4;
      } else if (rule.frequency === 'yearly') {
        recurringMonthlyTotal += Math.round(rule.amount / 12);
      }
    }
  }

  if (recurringMonthlyTotal > 0) {
    const formattedRecurring = formatMoney(recurringMonthlyTotal, currency);
    insights.push({
      id: 'insight-recurring',
      type: 'recurring',
      title: 'Fixed Subscriptions & Bills',
      message: `Your active recurring rules total ${formattedRecurring} per month across streaming, utilities, and services.`,
      highlight: formattedRecurring,
    });
  }

  // 3. Goal Progress Trajectory
  const activeGoal = goals.find((g) => g.savedAmount < g.targetAmount);
  if (activeGoal) {
    const progressPct = Math.round((activeGoal.savedAmount / activeGoal.targetAmount) * 100);
    const remainingAmt = formatMoney(activeGoal.targetAmount - activeGoal.savedAmount, currency);
    insights.push({
      id: 'insight-goal',
      type: 'saving',
      title: `Savings Goal: ${activeGoal.name}`,
      message: `You've reached ${progressPct}% of your goal! Only ${remainingAmt} remaining to complete it by ${activeGoal.targetDate}.`,
      highlight: `${progressPct}%`,
    });
  } else if (goals.length > 0) {
    insights.push({
      id: 'insight-goal-complete',
      type: 'positive',
      title: 'Savings Milestones Achieved',
      message: 'All your current savings targets are 100% funded! Create a new goal to keep building wealth.',
    });
  }

  // 4. Anomaly Detection: Single large transactions compared to category historical average
  const categoryHistory: Record<string, { total: number; count: number }> = {};
  for (const t of transactions) {
    if (t.type === 'expense') {
      if (!categoryHistory[t.categoryId]) {
        categoryHistory[t.categoryId] = { total: 0, count: 0 };
      }
      categoryHistory[t.categoryId].total += t.amount;
      categoryHistory[t.categoryId].count += 1;
    }
  }

  let flaggedAnomaly: { transaction: Transaction; average: number; ratio: number } | null = null;
  for (const t of currentMonthTx) {
    if (t.type === 'expense') {
      const hist = categoryHistory[t.categoryId];
      if (hist && hist.count >= 3) {
        const avg = hist.total / hist.count;
        if (t.amount > avg * 2.2 && t.amount > 5000) {
          const ratio = Math.round(t.amount / avg);
          if (!flaggedAnomaly || ratio > flaggedAnomaly.ratio) {
            flaggedAnomaly = { transaction: t, average: avg, ratio };
          }
        }
      }
    }
  }

  if (flaggedAnomaly) {
    const cat = categoryMap.get(flaggedAnomaly.transaction.categoryId);
    const amtStr = formatMoney(flaggedAnomaly.transaction.amount, currency);
    const avgStr = formatMoney(Math.round(flaggedAnomaly.average), currency);
    insights.push({
      id: 'insight-anomaly',
      type: 'anomaly',
      title: 'Unusually Large Expense Detected',
      message: `"${flaggedAnomaly.transaction.note || cat?.name || 'Expense'}" for ${amtStr} is ~${flaggedAnomaly.ratio}x higher than your typical ${cat?.name || 'category'} average of ${avgStr}.`,
      highlight: amtStr,
    });
  }

  // Fallback tip if we have fewer than 3 insights
  if (insights.length < 3) {
    insights.push({
      id: 'insight-tip',
      type: 'positive',
      title: 'Budget Discipline',
      message: 'Tracking every expense daily helps reduce impulse purchases by up to 23%. Keep it up!',
    });
  }

  return insights;
}
