import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RejectedUser() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-red-500/20 rounded-3xl shadow-2xl p-8 text-center relative z-10">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Access Denied</h1>
        <div className="h-1.5 w-12 bg-red-500 mx-auto rounded-full mb-6" />

        <p className="text-slate-300 font-medium leading-relaxed mb-4">
            Hello <span className="text-white font-bold">{user?.name}</span>, unfortunately your request to join the <span className="text-emerald-400 font-bold">TaskPilot</span> workspace has been rejected by the administrator.
        </p>
        
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 mb-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Reason for Denial</h4>
            <p className="text-sm text-slate-400 italic">"The administrator did not find the provided purpose sufficient for platform access at this time."</p>
        </div>

        <div className="space-y-3">
          <a
            href="mailto:suyalpriyanshu2@gmail.com"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-100 text-slate-900 rounded-2xl text-sm font-black transition-all hover:bg-white active:scale-95 shadow-xl shadow-white/5"
          >
            <Mail className="w-4 h-4" />
            CONTACT SUPPORT
          </a>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-700/40 text-slate-300 rounded-2xl text-sm font-bold border border-slate-600/30 transition-all hover:bg-slate-700/60 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT & GO BACK
          </button>
        </div>

        <p className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">TaskPilot Security Protocol</p>
      </div>
    </div>
  );
}
