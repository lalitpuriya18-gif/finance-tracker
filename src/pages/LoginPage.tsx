import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  CheckCircle2,
  Sun,
  Moon,
  Smartphone,
  Database,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, settings, updateSettings } = useFinanceStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('Arjun Mehta');
  const [email, setEmail] = useState('arjun@fintrack.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle standard credential submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, isSignUp ? name : undefined);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant demo user login as Arjun Mehta
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setEmail('arjun@fintrack.io');
    setName('Arjun Mehta');
    setPassword('arjun2023');
    try {
      await login('arjun@fintrack.io', 'arjun2023', 'Arjun Mehta');
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth simulation
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login('arjun.mehta@gmail.com', 'google-oauth-session', 'Arjun Mehta');
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            F
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight leading-none text-slate-900 dark:text-white block">
              Fintrack
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold tracking-wider uppercase">
              PERSONAL FINANCE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
            title="Toggle theme"
            aria-label="Toggle light or dark theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 py-6 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand Showcase & Dashboard UI Preview */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Wealth Operating System</span>
            </div>

            <div>
              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Consolidated Wealth, <br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Zero Manual Hassle.
                </span>
              </h1>
              <p className="text-sm xl:text-base text-slate-600 dark:text-slate-400 mt-3 max-w-xl leading-relaxed">
                Experience real-time net worth tracking, automated bank SMS parsing,
                and category budgeting with bank-grade privacy right on your machine.
              </p>
            </div>

            {/* Live Financial Dashboard Preview Card (matches user's screenshot) */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4 max-w-xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    AM
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      Welcome back, Arjun 👋
                    </h2>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                      Consolidated overview for October 2023
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  All 4 accounts synced
                </span>
              </div>

              {/* 4 Mini KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Total Balance
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                    ₹4,82,450
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    +12.4% vs last mo
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Monthly Income
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                    ₹1,45,000
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    +5.2% vs last mo
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Expenses
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                    ₹68,320
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    -3.8% less spend
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Savings Rate
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                    52.8%
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    Target: 50%
                  </span>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  Instant SMS Background Ingestion
                </span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  Zero Bank API Fees (100% Local)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="w-full lg:col-span-5 max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-7 sm:p-9 shadow-xl shadow-slate-200/60 dark:shadow-none space-y-6">
              {/* Card Header */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {isSignUp
                    ? 'Start tracking your financial freedom in 30 seconds'
                    : 'Sign in to access your wealth management dashboard'}
                </p>
              </div>

              {/* ⚡ One-Click Quick Demo Login Button */}
              {!isSignUp && (
                <div
                  onClick={handleDemoLogin}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 transition-all hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        AM
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Arjun Mehta
                          </span>
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-200/70 dark:bg-emerald-900/80 px-1.5 py-0.2 rounded">
                            Demo User
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium block">
                          arjun@fintrack.io
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Quick Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Login Button: Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  or with email
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Arjun Mehta"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-600 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="arjun@fintrack.io"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => alert('Demo password is: password123')}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-600 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember this machine</span>
                  </label>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Free Account' : 'Sign In to FinTrack'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Sign In / Sign Up */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMessage('');
                  }}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  {isSignUp ? (
                    <span>
                      Already have an account?{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Sign In
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Don't have an account?{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Create One
                      </strong>
                    </span>
                  )}
                </button>
              </div>

              {/* Security Trust Badge */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Bank Grade Simulation • 100% Local Privacy</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-5 text-center text-[11px] text-slate-600 dark:text-slate-300">
        FinTrack Wealth OS &copy; {new Date().getFullYear()} &bull; Built with React, TypeScript &amp; Python Flask
      </footer>
    </div>
  );
};

export default LoginPage;
