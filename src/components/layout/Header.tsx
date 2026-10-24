import React, { useState } from 'react';
import { Calendar, Bell, Plus, Menu, X, CheckCircle2, LogOut, User, Sparkles, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenAddTransaction: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction, onToggleSidebar }) => {
  const { settings, updateSettings, addToast } = useFinanceStore();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'warning' | 'success' | 'info';
    isUnread: boolean;
    link: string;
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const handleGoogleAuth = () => {
    if (isSignedIn) {
      setIsGoogleModalOpen(true);
    } else {
      setIsSignedIn(true);
      api.googleAuth(settings.userName, settings.userEmail).catch((e) => console.warn(e));
      addToast({
        title: 'Signed in with Google',
        description: `Welcome back, ${settings.userName}!`,
        type: 'success',
      });
      setIsGoogleModalOpen(false);
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setIsGoogleModalOpen(false);
    api.logout().catch((e) => console.warn(e));
    addToast({
      title: 'Signed Out',
      description: 'You have been signed out of Google account.',
      type: 'info',
    });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    setUnreadCount(0);
    api.markAllNotificationsRead().catch((e) => console.warn(e));
    addToast({
      title: 'Notifications Cleared',
      description: 'All notifications marked as read.',
      type: 'info',
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        {/* Left: Hamburger menu (mobile/tablet) + Date Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors md:hidden"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Wednesday, October 25, 2023</span>
          </div>
        </div>

        {/* Right Actions: Google Sign-In, Notifications, Add Transaction */}
        <div className="flex items-center gap-2.5 sm:gap-3 relative">
          {/* Sign in with Google Button (matching Stitch screenshot) */}
          <button
            onClick={handleGoogleAuth}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-[0.98]"
            title="Google Account"
          >
            {/* Google Multi-color G logo */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">
              {isSignedIn ? 'Sign in with Google' : 'Sign in with Google'}
            </span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notification Popover Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                      <p className="font-medium text-slate-600 dark:text-slate-400">No unread notifications</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          n.isUnread ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : n.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {n.description}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {n.time}
                                </span>
                                <Link
                                  to={n.link}
                                  onClick={() => setIsNotificationsOpen(false)}
                                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                >
                                  View details <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                          {n.isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stitch Dark Emerald Primary Action Button */}
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#065f46] hover:bg-[#054c37] rounded-lg shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Transaction</span>
          </button>
        </div>
      </header>

      {/* Google Account Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Google Account
                </h3>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {(settings.userName || 'FinTrack User')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'FT'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {settings.userName || 'FinTrack User'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {settings.userEmail || 'user@fintrack.io'}
                </p>
              </div>
              <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Your Stitch financial telemetry and local encrypted vault are securely linked to your account.
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#065f46] hover:bg-[#054c37] rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
