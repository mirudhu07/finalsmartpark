import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@smartpark.ai');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-brand-border overflow-hidden">
        {/* Brand Banner with Official Logo */}
        <div className="bg-brand-navy p-8 text-center text-white relative">
          <div className="inline-block p-2 bg-white rounded-2xl shadow-md mb-4">
            <img
              src="/smartpark-logo.png"
              alt="SmartPark AI Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">SmartPark AI</h2>
          <p className="text-sm text-sky-200 mt-1">Operator &amp; Administration Portal</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@smartpark.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-brand-blue hover:bg-brand-blueDark text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seed Account Quick-Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill('admin@smartpark.ai', 'Admin@123456')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 flex flex-col items-center transition-colors border border-slate-200/80"
              >
                <span className="font-bold text-brand-navy">System Admin</span>
                <span className="text-[10px] text-slate-500">Full Permissions</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('operator@smartpark.ai', 'Operator@123456')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 flex flex-col items-center transition-colors border border-slate-200/80"
              >
                <span className="font-bold text-brand-navy">Facility Operator</span>
                <span className="text-[10px] text-slate-500">Live Management</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
