import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, MessageCircle, Mail } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';

export default function AccountBlocked() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {}
    finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/50 border border-red-500/20 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl relative z-10">
        
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white mb-3 uppercase">
          Access <span className="text-red-500">Denied</span>
        </h1>
        
        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
          Your account <span className="text-slate-200">({user?.email})</span> has been temporarily blocked by an administrator. You no longer have access to the TaskPilot platform.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-left">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inquiry</p>
              <p className="text-sm font-semibold text-slate-200">support@taskpilot.app</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-left">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Chat</p>
              <p className="text-sm font-semibold text-slate-200">Contact via Organization Slack</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-600/20"
        >
          <LogOut className="w-5 h-5" />
          Sign Out of Account
        </button>

      </div>

      <p className="mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
        TaskPilot Security Protocol v2.4.0
      </p>

    </div>
  );
}
