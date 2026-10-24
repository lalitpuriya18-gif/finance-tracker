import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ArrowLeftRight,
  PieChart,
  Flag,
  TrendingUp,
  Settings,
  Sun,
  Moon,
  MoreVertical,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile }) => {
  const { settings, updateSettings } = useFinanceStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutGrid },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/goals', label: 'Goals', icon: Flag },
    { to: '/reports', label: 'Reports', icon: TrendingUp },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleToggleTheme = (mode: 'light' | 'dark') => {
    updateSettings({ theme: mode });
  };

  return (
    <aside
      className={`${
        isMobile ? 'flex w-full' : 'hidden md:flex w-64'
      } flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 min-h-screen justify-between`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs tracking-wider shadow-xs">
            img
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight leading-none">
              Fintrack
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-1">
              Personal Finance
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-4 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#eef2ff] dark:bg-indigo-950/50 text-[#1e1b4b] dark:text-indigo-200 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-800" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        {/* Theme Mode Toggle Box */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 pl-1">
            Theme Mode
          </span>
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => handleToggleTheme('light')}
              title="Light theme"
              aria-label="Switch to light theme"
              className={`p-1 rounded-md transition-colors ${
                settings.theme === 'light'
                  ? 'bg-slate-100 text-amber-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">Light theme</span>
            </button>
            <button
              onClick={() => handleToggleTheme('dark')}
              title="Dark theme"
              aria-label="Switch to dark theme"
              className={`p-1 rounded-md transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-slate-800 text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">Dark theme</span>
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <NavLink
              to="/settings"
              className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                {(settings.userName || 'FinTrack User')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'FT'}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {settings.userName || 'FinTrack User'}
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate">
                  {settings.userEmail || 'user@fintrack.io'}
                </p>
              </div>
            </NavLink>

            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
              title="Profile menu"
              aria-label="Open profile options menu"
            >
              <MoreVertical className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Open profile options menu</span>
            </button>
          </div>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-12 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <NavLink
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Account Settings</span>
              </NavLink>
              <NavLink
                to="/accounts"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                <span>Bank & Card Accounts</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
