import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import {
  parseCsv,
  autoGuessColumnMapping,
  convertRowsToTransactions,
  ColumnMapping,
} from '../../lib/csv';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { categories, accounts, settings, importTransactions } = useFinanceStore();

  const [rawText, setRawText] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateIndex: -1,
    amountIndex: -1,
    noteIndex: -1,
    categoryIndex: -1,
    typeIndex: -1,
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      setRawText(content);

      const parsed = parseCsv(content);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError('The selected file appears to be empty or does not have valid CSV data.');
        return;
      }

      setHeaders(parsed.headers);
      setSampleRows(parsed.rows.slice(0, 3));
      setAllRows(parsed.rows);

      // Auto-detect columns
      const guessed = autoGuessColumnMapping(parsed.headers);
      setMapping(guessed);

      // Default account
      if (accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accounts[0].id);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!selectedAccountId) {
      setError('Please select a destination account for imported records.');
      return;
    }

    if (mapping.amountIndex === -1) {
      setError('Please map the Amount column.');
      return;
    }

    const txs = convertRowsToTransactions(
      allRows,
      mapping,
      selectedAccountId,
      categories,
      settings.currency
    );

    if (txs.length === 0) {
      setError('Could not extract any valid transactions from the file.');
      return;
    }

    importTransactions(txs);
    onClose();
    resetState();
  };

  const resetState = () => {
    setRawText('');
    setHeaders([]);
    setSampleRows([]);
    setAllRows([]);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetState();
      }}
      title="Import CSV Transactions"
      description="Upload a bank or card statement CSV file with column mapping."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Upload Zone */}
        {headers.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <UploadCloud className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag and drop your bank CSV here
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports statements from Chase, Bank of America, Wells Fargo, Amex, Monzo, etc.
            </p>
            <label className="mt-4 inline-block">
              <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-sm">
                Browse CSV File
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>
                  Found <strong>{allRows.length}</strong> transaction rows in CSV.
                </span>
              </div>
              <button
                onClick={resetState}
                className="text-xs text-emerald-700 dark:text-emerald-400 underline font-semibold"
              >
                Choose another file
              </button>
            </div>

            {/* Target Account */}
            <Select
              label="Import Into Account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </Select>

            {/* Column Mappings */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Match CSV Columns
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Date Column
                  </label>
                  <select
                    value={mapping.dateIndex}
                    onChange={(e) =>
                      setMapping({ ...mapping, dateIndex: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                  >
                    <option value={-1}>-- Ignore / Use Today --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Amount Column *
                  </label>
                  <select
                    value={mapping.amountIndex}
                    onChange={(e) =>
                      setMapping({ ...mapping, amountIndex: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                  >
                    <option value={-1}>-- Select Column --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Description / Note Column
                  </label>
                  <select
                    value={mapping.noteIndex}
                    onChange={(e) =>
                      setMapping({ ...mapping, noteIndex: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                  >
                    <option value={-1}>-- Default: Imported --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Category Column (Optional)
                  </label>
                  <select
                    value={mapping.categoryIndex}
                    onChange={(e) =>
                      setMapping({ ...mapping, categoryIndex: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                  >
                    <option value={-1}>-- Uncategorized --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview of first 3 rows */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sample Rows Preview
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="p-2 border-r border-slate-200 dark:border-slate-700">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-t border-slate-100 dark:border-slate-800">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="p-2 border-r border-slate-100 dark:border-slate-800 truncate max-w-[120px]"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {headers.length > 0 && (
            <Button variant="primary" onClick={handleImport} icon={<Check className="w-4 h-4" />}>
              Import Transactions
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
