import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'blocked') {
      setError('Your account has been blocked by an administrator.');
    }
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    await new Promise(r => setTimeout(r, 600))

    const result = await login(email, password)
    
    if (result.success) {
      // Redirect all users to dashboard after login
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-600 via-slate-900 to-slate-800 animate-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[400px] bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 box-border">
        <div className="text-center mb-5">
          <div className="bg-gradient-to-br from-slate-600 to-slate-900 w-12 h-12 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-black/30 border border-slate-700/50">
            <span className="text-[14px] font-black tracking-widest text-white">TP</span>
          </div>
          <h1 className="text-2xl font-bold text-emerald-500 tracking-tight mb-1">Welcome Back</h1>
          <p className="text-slate-400 text-sm font-semibold">Login to your TaskPilot account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-2 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 transition-all outline-none"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full pl-9 pr-12 py-2.5 text-sm font-medium bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 rounded-xl text-white text-sm font-bold transition-all shadow-lg",
              isSubmitting ? "bg-emerald-600/70 cursor-not-allowed" : "bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 hover:shadow-blue-500/20 active:scale-[0.98]"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-80" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
