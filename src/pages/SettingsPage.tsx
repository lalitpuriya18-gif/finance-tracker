import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { Category, CurrencyCode, ThemeMode } from '../types/finance';
import { CURRENCY_CONFIGS } from '../lib/currency';
import { downloadFile } from '../lib/csv';
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  Calendar,
  Layers,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Plus,
  Edit2,
  AlertTriangle,
  Check,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    categories,
    transactions,
    accounts,
    budgets,
    goals,
    recurringRules,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    clearDemoData,
    resetToDemoData,
    importBackupJson,
  } = useFinanceStore();

  // Category modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catColor, setCatColor] = useState('#10b981');

  // Confirmation dialogs
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatType(cat.type);
      setCatIcon(cat.icon);
      setCatColor(cat.color);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatType('expense');
      setCatIcon('Tag');
      setCatColor('#10b981');
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        type: catType,
        icon: catIcon,
        color: catColor,
      });
    } else {
      addCategory({
        name: catName.trim(),
        type: catType,
        icon: catIcon,
        color: catColor,
      });
    }
    setIsCatModalOpen(false);
  };

  const handleExportJson = () => {
    const backup = {
      transactions,
      accounts,
      categories,
      budgets,
      goals,
      recurringRules,
      settings,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonStr, `fintrack-backup-${dateStr}.json`, 'application/json');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && parsed.accounts) {
          importBackupJson(parsed);
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const categoryIcons = [
    'Tag',
    'ShoppingCart',
    'Utensils',
    'Car',
    'Home',
    'Zap',
    'Tv',
    'HeartPulse',
    'ShoppingBag',
    'Briefcase',
    'Laptop',
    'TrendingUp',
    'Coffee',
    'Plane',
    'Gift',
    'Smartphone',
    'Shield',
  ];

  const categoryColors = [
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#64748b',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Application Preferences & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure currency formatting, appearance, categories, and database backups
        </p>
      </div>

      {/* General Preferences */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          General Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Currency */}
          <Select
            label="Base Currency"
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value as CurrencyCode })}
            helperText="Formats all money values using minor units"
          >
            {Object.values(CURRENCY_CONFIGS).map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name} ({curr.symbol}) — {curr.code}
              </option>
            ))}
          </Select>

          {/* Theme */}
          <Select
            label="Visual Theme"
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as ThemeMode })}
            helperText="Light, dark, or system synchronized"
          >
            <option value="system">System Default</option>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </Select>

          {/* Month start day */}
          <Select
            label="Month Start Day"
            value={settings.monthStartDay.toString()}
            onChange={(e) => updateSettings({ monthStartDay: parseInt(e.target.value, 10) })}
            helperText="Day of month when budget periods reset"
          >
            {[1, 5, 10, 15, 20, 25, 28].map((day) => (
              <option key={day} value={day}>
                Day {day} of the month
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Category Management */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Manage Categories
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize income and expense classifications with icons and colors
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenCatModal()}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CategoryIcon icon={cat.icon} color={cat.color} size={15} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{cat.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenCatModal(cat)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Backup & Restore */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          Data Backup & Migration
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Save your full financial database as a single portable JSON file, or restore a previous snapshot.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            icon={<Download className="w-4 h-4" />}
          >
            Export Backup (JSON)
          </Button>

          <label className="inline-block">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Restore Backup (JSON)
            </span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </Card>

      {/* Demo Data Management */}
      <Card className="space-y-4 border-rose-500/20">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          Demo Data & Database Reset
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Switch between the realistic seeded test dataset and a pristine blank workspace.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmClearOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Clear Demo Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmResetOpen(true)}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset to Demo Data
          </Button>
        </div>
      </Card>

      {/* Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions, Pet Care, Education"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            autoFocus
          />

          <Select
            label="Category Type"
            value={catType}
            onChange={(e) => setCatType(e.target.value as 'income' | 'expense')}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {categoryColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCatColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    catColor === c ? 'scale-110 border-slate-900 dark:border-white shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {categoryIcons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setCatIcon(ic)}
                  className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
                    catIcon === ic
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CategoryIcon icon={ic} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal: Clear Data */}
      <Modal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear All Financial Data?"
        description="This will permanently remove all transactions, accounts, and budgets from your local storage."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>Are you sure? You can export a JSON backup beforehand if you wish to keep a copy.</span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearDemoData();
                setConfirmClearOpen(false);
              }}
            >
              Yes, Clear Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Reset to Demo Data */}
      <Modal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reset to Demo Data?"
        description="This will overwrite current data with the realistic sample fintech dataset."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This restores 4 sample accounts, 40+ transactions across 3 months, category budgets, savings goals, and recurring rules.
          </p>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                resetToDemoData();
                setConfirmResetOpen(false);
              }}
            >
              Reset to Demo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
