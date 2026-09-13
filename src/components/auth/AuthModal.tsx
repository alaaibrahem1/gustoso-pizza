import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const { login, register } = useAuth();
  const { cart, favorites, showToast } = useCart();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(loginEmail, loginPassword);
      showToast({
        title: `Welcome back, ${res.user.name}! 👋`,
        message: res.user.role === 'ADMIN' ? 'Logged in with Administrator privileges' : 'Your cart and favorites have been synced.',
        type: 'success',
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await register({
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
      });

      showToast({
        title: `Welcome to Gustoso, ${res.user.name}! 🍕`,
        message: 'Your account has been created successfully.',
        type: 'success',
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setActiveTab('login');
    setLoginEmail('customer@gustoso.sa');
    setLoginPassword('customer123');
    setErrorMessage(null);
  };

  const fillDemoAdmin = () => {
    setActiveTab('login');
    setLoginEmail('admin@gustoso.sa');
    setLoginPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Background Pattern */}
        <div className="relative bg-gradient-to-br from-stone-900 via-stone-850 to-red-950 px-6 pt-6 pb-5 text-white">
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🍕</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Gustoso Pizza Co. Saudi
            </span>
          </div>

          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            {activeTab === 'login' ? 'Sign In to Your Account' : 'Create a New Account'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {activeTab === 'login'
              ? 'Access your saved addresses, live order tracking, and synced cart.'
              : 'Join Gustoso to save delivery addresses and reorder in 1-click.'}
          </p>

          {/* Quick Demo Logins Bar */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-stone-300">Quick Demo:</span>
            <button
              id="demo-customer-login-btn"
              type="button"
              onClick={fillDemoCustomer}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <UserIcon className="w-3 h-3 text-amber-300" />
              Customer
            </button>
            <button
              id="demo-admin-login-btn"
              type="button"
              onClick={fillDemoAdmin}
              className="text-[11px] px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium transition-colors flex items-center gap-1 cursor-pointer border border-amber-400/30"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Admin
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
              activeTab === 'login'
                ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
              activeTab === 'register'
                ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. customer@gustoso.sa"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="e.g. tariq@domain.sa"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Saudi Mobile (+966)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="register-phone-input"
                    type="tel"
                    required
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Confirm
                  </label>
                  <input
                    id="register-confirm-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Feature highlights */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-around text-[11px] text-stone-500">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Synced Cart</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved Addresses</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Reorder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
