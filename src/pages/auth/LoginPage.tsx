import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Headphones
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Target destination after login
  const rawFrom = (location.state as any)?.from;
  const from = (typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname) || (location.state as any)?.returnUrl || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred during sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#FAFBFD]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Apply365 Customer Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to track your documents, manage applications & upload proofs.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email or 10-Digit Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or 9876543210"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#104A96] focus:border-transparent text-sm bg-slate-50/50 hover:bg-white transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#104A96] hover:text-[#FF8500] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#104A96] focus:border-transparent text-sm bg-slate-50/50 hover:bg-white transition-all text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#104A96] hover:bg-[#07366F] disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Customer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={async () => {
              setIdentifier('9876543210');
              setPassword('password123');
              setLoading(true);
              const res = await login('9876543210', 'password123');
              setLoading(false);
              if (res.success) {
                navigate(from, { replace: true });
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-[#104A96] font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#FF8500]" />
            <span>1-Click Demo Login (Auto-fill: 9876543210 / password123)</span>
          </button>
        </form>

        {/* Registration CTA */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs sm:text-sm text-slate-600">
            Don't have a customer account?{' '}
            <Link
              to="/register"
              className="font-bold text-[#FF8500] hover:text-[#e67700] hover:underline"
            >
              Create Account Free &rarr;
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Secure 256-bit Session</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Headphones className="w-3.5 h-3.5 text-[#104A96] shrink-0" />
            <span>Dedicated Assistance</span>
          </div>
        </div>

      </div>
    </div>
  );
};

