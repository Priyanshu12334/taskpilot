import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  // Seamlessly redirect to application if they possess existing local storage session
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-900 to-slate-600 animate-gradient text-white overflow-hidden relative font-sans">

      {/* Navbar Grid Layout */}
      <div className="max-w-7xl mx-auto">
        <nav className="relative z-10 px-4 sm:px-12 py-4 sm:py-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-1">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-900 rounded-3xl flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/50">
              <span className="text-[14px] font-black tracking-widest text-white">TP</span>
            </div>
            <h2 className="text-xl sm:text-2xl tracking-tight">Task<span className="font-bold text-emerald-500">Pilot</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all shadow-md hover:shadow-emerald-500/25">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Minimal High Conversion Hero Section */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center pb-20">          
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.2] sm:leading-[1.1] mb-6">
            Manage Tasks with Full<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
            Control
            </span>{' '}
            &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
              Team Visibility
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed px-2 sm:px-0">
            Create tasks, assign them to your team, track progress, set due dates, and monitor every action with real-time updates and activity logs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-2 drop-shadow-xl">
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-8 py-4 sm:px-10 sm:py-5 rounded-full transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 text-base sm:text-lg">
              Get Started
              <ArrowRight className="w-5 h-5 opacity-80" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
