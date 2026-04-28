import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PendingApproval() {
  const { logout, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // Auto-redirect once role changes
  useEffect(() => {
    if (user && user.role !== 'Pending') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      const refreshedUser = await refreshProfile();
      if (refreshedUser && refreshedUser.role !== 'Pending') {
        // Redirect will be handled by useEffect, but we can speed it up
        navigate('/dashboard', { replace: true });
      }
    } finally {
      // Simulate small delay for better UX feel
      setTimeout(() => setChecking(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md relative z-10 text-center space-y-8 animate-[slideIn_0.4s_ease-out]">
        
        {/* Animated Icon Composition */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-slate-800 border border-slate-700/50 rounded-[2rem] shadow-inner">
            <Clock className="w-10 h-10 text-emerald-400 animate-[spin_8s_linear_infinite]" />
            <div className="absolute -top-1 -right-1 bg-yellow-500 p-1.5 rounded-lg shadow-lg border-2 border-slate-900">
               <ShieldCheck className="w-4 h-4 text-slate-900" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-white italic">Welcome, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your account is currently <span className="text-yellow-400 font-bold uppercase tracking-wide">Pending Approval</span>. 
            An administrator will verify your request shortly.
          </p>
        </div>

        <div className="p-5 bg-slate-900/50 border border-slate-700/50 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-center gap-3 text-emerald-400 relative z-10">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">Verifying Identity</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-2 relative z-10">
            Access to dashboard and team chat is restricted until your role is updated by the system admin.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            className="group w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all border border-emerald-500/20 active:scale-95 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            )}
            {checking ? 'Syncing...' : 'Check Status'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 text-slate-500 hover:text-white rounded-2xl font-semibold text-sm transition-all bg-transparent border border-transparent hover:border-slate-700 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
