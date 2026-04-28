import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Initial Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    
    await new Promise(r => setTimeout(r, 500));

    try {
      const response = await api.post('/auth/register', { name, email, password, purpose });
      
      setSuccessMsg("Account successfully created! Redirecting to login...");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-600 via-slate-900 to-slate-800 animate-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[420px] max-h-[95vh] overflow-y-auto no-scrollbar bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-5 sm:p-8 relative z-10 box-border">
        <div className="text-center mb-4 sm:mb-5">
          <div className="bg-gradient-to-br from-slate-700 to-slate-700 w-10 h-10 sm:w-12 sm:h-12 rounded-3xl sm:rounded-3xl mx-auto flex items-center justify-center mb-2 sm:mb-3 shadow-lg shadow-black/50 border border-slate-700/50">
            <span className="text-[12px] sm:text-[14px] font-black tracking-widest text-white">TP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-500 tracking-tight mb-0.5 sm:mb-1">Create Account</h1>
          <p className="text-slate-400 text-[11px] sm:text-sm font-semibold">Join TaskPilot workspace today.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-2 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-3 py-2 rounded-lg mb-4 text-sm text-center font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-9 pr-3 py-2 sm:py-2.5 text-sm font-medium bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 transition-all outline-none"
                  placeholder="User Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-9 pr-10 py-2 sm:py-2.5 text-sm font-medium bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 transition-all outline-none"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="block w-full pl-9 pr-10 py-2 sm:py-2.5 text-sm font-medium bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-9 pr-10 py-2 sm:py-2.5 text-sm font-medium bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 transition-all outline-none"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Why do you want to join us?</label>
            <textarea
              required
              rows={2}
              className="block w-full px-4 py-2.5 text-sm font-medium bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 transition-all outline-none resize-none"
              placeholder="e.g. Collaborating on the XYZ project and managing tasks..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
            <p className="text-[10px] text-slate-600 font-medium ml-1">This will be reviewed by administrators.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || successMsg}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 rounded-xl text-white text-sm font-bold transition-all shadow-lg",
              (isSubmitting || successMsg) ? "bg-emerald-600/70 cursor-not-allowed" : "bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 hover:shadow-blue-500/20 active:scale-[0.98]"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Sign Up <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-80" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
