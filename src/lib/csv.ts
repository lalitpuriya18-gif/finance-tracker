import { Transaction, Category, Account, CurrencyCode } from '../types/finance';
import { parseMoneyToMinor, minorToDecimal } from './currency';

export interface ColumnMapping {
  dateIndex: number;
  amountIndex: number;
  noteIndex: number;
  categoryIndex: number;
  typeIndex: number;
}

/**
 * Parses raw CSV text into headers and row values handling quotes.
 */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine).filter((r) => r.length > 1);

  return { headers, rows };
}

/**
 * Attempts to automatically guess the column index based on common header names
 */
export function autoGuessColumnMapping(headers: string[]): ColumnMapping {
  const lower = headers.map((h) => h.toLowerCase());

  const findIdx = (keywords: string[]): number => {
    return lower.findIndex((h) => keywords.some((k) => h.includes(k)));
  };

  return {
    dateIndex: findIdx(['date', 'time', 'posted', 'day']),
    amountIndex: findIdx(['amount', 'price', 'total', 'debit', 'cost', 'sum']),
    noteIndex: findIdx(['description', 'note', 'memo', 'payee', 'name', 'merchant']),
    categoryIndex: findIdx(['category', 'tag', 'group', 'class']),
    typeIndex: findIdx(['type', 'direction', 'flow', 'credit/debit']),
  };
}

/**
 * Converts mapped rows into Transaction objects
 */
export function convertRowsToTransactions(
  rows: string[][],
  mapping: ColumnMapping,
  defaultAccountId: string,
  categories: Category[],
  currency: CurrencyCode
): Transaction[] {
  const defaultCategory = categories[0]?.id || 'cat-general';
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

  const transactions: Transaction[] = [];

  for (const row of rows) {
    const rawDate = mapping.dateIndex >= 0 ? row[mapping.dateIndex] : '';
    const rawAmount = mapping.amountIndex >= 0 ? row[mapping.amountIndex] : '0';
    const rawNote = mapping.noteIndex >= 0 ? row[mapping.noteIndex] : 'Imported Transaction';
    const rawCategory = mapping.categoryIndex >= 0 ? row[mapping.categoryIndex] : '';
    const rawType = mapping.typeIndex >= 0 ? row[mapping.typeIndex] : '';

    // Standardize date to YYYY-MM-DD
    let formattedDate = new Date().toISOString().split('T')[0];
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        formattedDate = parsed.toISOString().split('T')[0];
      }
    }

    const minorAmount = Math.abs(parseMoneyToMinor(rawAmount, currency));
    if (minorAmount === 0) continue;

    // Determine type
    let type: 'income' | 'expense' | 'transfer' = 'expense';
    const typeLower = rawType.toLowerCase();
    const rawAmtClean = rawAmount.trim();
    if (typeLower.includes('income') || typeLower.includes('credit') || rawAmtClean.startsWith('+')) {
      type = 'income';
    } else if (typeLower.includes('transfer')) {
      type = 'transfer';
    }

    // Match category
    let categoryId = defaultCategory;
    if (rawCategory) {
      const match = categoryByName.get(rawCategory.toLowerCase());
      if (match) {
        categoryId = match;
      }
    }

    transactions.push({
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      amount: minorAmount,
      categoryId,
      accountId: defaultAccountId,
      date: formattedDate,
      note: rawNote || 'Imported Transaction',
      tags: ['imported'],
    });
  }

  return transactions;
}

/**
 * Exports transactions to CSV string
 */
export function exportTransactionsToCsv(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  currency: CurrencyCode
): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));

  const headers = ['Date', 'Type', 'Amount', 'Category', 'Account', 'Note', 'Tags'];
  const lines = [headers.join(',')];

  for (const t of transactions) {
    const dec = minorToDecimal(t.amount, currency);
    const catName = catMap.get(t.categoryId) || 'Uncategorized';
    const accName = accMap.get(t.accountId) || 'Unknown Account';
    const tagsStr = (t.tags || []).join(';');
    const cleanNote = `"${(t.note || '').replace(/"/g, '""')}"`;

    lines.push([
      t.date,
      t.type,
      dec.toFixed(2),
      `"${catName}"`,
      `"${accName}"`,
      cleanNote,
      `"${tagsStr}"`,
    ].join(','));
  }

  return lines.join('\n');
}

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
