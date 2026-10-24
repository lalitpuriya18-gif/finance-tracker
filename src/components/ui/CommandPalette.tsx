import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  Search,
  Plus,
  LayoutGrid,
  ArrowLeftRight,
  PieChart,
  Flag,
  TrendingUp,
  Settings,
  Sun,
  Moon,
  Download,
  RefreshCw,
  Wallet,
  Keyboard,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandPaletteProps {
  onOpenAddTransaction: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onOpenAddTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const { settings, updateSettings, addToast } = useFinanceStore();

  const commands = [
    {
      id: 'new-tx',
      title: 'Add New Transaction',
      shortcut: 'N',
      icon: Plus,
      category: 'Actions',
      action: () => onOpenAddTransaction(),
    },
    {
      id: 'nav-dashboard',
      title: 'Go to Financial Cockpit',
      shortcut: 'G D',
      icon: LayoutGrid,
      category: 'Navigation',
      action: () => navigate('/'),
    },
    {
      id: 'nav-transactions',
      title: 'Go to Transactions Ledger',
      shortcut: 'G T',
      icon: ArrowLeftRight,
      category: 'Navigation',
      action: () => navigate('/transactions'),
    },
    {
      id: 'nav-budgets',
      title: 'Go to Monthly Budgets',
      shortcut: 'G B',
      icon: PieChart,
      category: 'Navigation',
      action: () => navigate('/budgets'),
    },
    {
      id: 'nav-goals',
      title: 'Go to Financial Goals',
      shortcut: 'G G',
      icon: Flag,
      category: 'Navigation',
      action: () => navigate('/goals'),
    },
    {
      id: 'nav-reports',
      title: 'Go to Executive Analytics & Reports',
      shortcut: 'G R',
      icon: TrendingUp,
      category: 'Navigation',
      action: () => navigate('/reports'),
    },
    {
      id: 'nav-accounts',
      title: 'Go to Bank & Card Accounts',
      shortcut: 'G A',
      icon: Wallet,
      category: 'Navigation',
      action: () => navigate('/accounts'),
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings & Preferences',
      shortcut: 'G S',
      icon: Settings,
      category: 'Navigation',
      action: () => navigate('/settings'),
    },
    {
      id: 'toggle-theme',
      title: settings.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      shortcut: 'T',
      icon: settings.theme === 'dark' ? Sun : Moon,
      category: 'Appearance',
      action: () => {
        updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
        addToast({
          title: 'Theme Changed',
          description: `Visual theme updated to ${settings.theme === 'dark' ? 'light' : 'dark'}.`,
          type: 'info',
        });
      },
    },
    {
      id: 'sync-accounts',
      title: 'Sync Live Bank Accounts',
      shortcut: 'S',
      icon: RefreshCw,
      category: 'Actions',
      action: () => {
        addToast({
          title: 'Accounts Synced',
          description: 'Refreshed balances across ICICI Bank, HDFC Card, and Paytm UPI.',
          type: 'success',
        });
      },
    },
    {
      id: 'view-shortcuts',
      title: 'View Keyboard Shortcuts',
      shortcut: '?',
      icon: Keyboard,
      category: 'Help',
      action: () => setIsShortcutsHelpOpen(true),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // If palette is open:
      if (isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
            setSearch('');
          }
          return;
        }
      }

      // Global single-key shortcuts (only when NOT in an input):
      if (!isInput && !isOpen && !isShortcutsHelpOpen) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          onOpenAddTransaction();
        } else if (e.key === '?') {
          e.preventDefault();
          setIsShortcutsHelpOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isShortcutsHelpOpen, filteredCommands, selectedIndex, onOpenAddTransaction]);

  return (
    <>
      {/* Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search (e.g. 'Add', 'Goals', 'Theme')..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
                ESC
              </span>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                        setSearch('');
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#065f46] text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold">{cmd.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {cmd.category}
                        </span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {cmd.shortcut}
                        </kbd>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">FinTrack OS</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {isShortcutsHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setIsShortcutsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Open Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Ctrl + K
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Add New Transaction</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  N
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Close Open Modal / Dialog</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ESC
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Show Keyboard Shortcuts</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ?
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setIsShortcutsHelpOpen(false)}
              className="w-full py-2 text-xs font-bold text-white bg-[#065f46] hover:bg-[#054c37] rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
