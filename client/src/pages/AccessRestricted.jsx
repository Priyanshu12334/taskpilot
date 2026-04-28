import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, MessageSquare, Lock } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function AccessRestricted() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-slate-900 text-white flex overflow-hidden relative">
      {/* Background Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[150px] pointer-events-none" />

      <Sidebar />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto no-scrollbar">
        <div className="max-w-md w-full text-center space-y-8 animate-[slideIn_0.4s_ease-out]">
          
          {/* Icon Composition */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-24 h-24 bg-slate-800 border border-slate-700/50 rounded-3xl shadow-2xl">
              <MessageSquare className="w-10 h-10 text-slate-500" />
              <div className="absolute -bottom-1 -right-1 bg-red-500 p-2 rounded-xl shadow-lg border-4 border-slate-900">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Access Restricted</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your account currently doesn't have permission to access the team chat. 
              Chat access is managed by administrators based on project requirements.
            </p>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">What can I do?</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  If you believe this is a mistake, please contact your project administrator to request access.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-sm transition-all border border-slate-700 hover:border-slate-600 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
