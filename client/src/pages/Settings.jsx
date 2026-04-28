import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Save, User, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';

export default function Settings() {
  const { user, updateUserData } = useAuth();

  // ── Profile state ──
  const [name, setName]   = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // ── Password state ──
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(prev => (prev === '' ? user.name : prev));
      setEmail(prev => (prev === '' ? user.email : prev));
    }
  }, [user]);

  if (!user) return <Loader message="Loading settings..." />;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsUpdatingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await api.put('/user/update', { name, email });
      updateUserData({ name: res.data.name, email: res.data.email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/user/password', { oldPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const FeedbackBanner = ({ msg }) =>
    msg.text ? (
      <div className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold border mb-6 animate-in fade-in slide-in-from-top-2 duration-300',
        msg.type === 'success'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-red-500/10 text-red-400 border-red-500/20'
      )}>
        {msg.text}
      </div>
    ) : null;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white flex overflow-hidden relative">
    
      <Sidebar />

      <main className="flex-1 overflow-y-auto no-scrollbar pt-28 sm:pt-12 p-5 sm:p-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Maintain your professional profile and security credentials.
            </p>
          </header>

          <div className="flex flex-col gap-10">
            {/* Profile Information */}
            <div className="bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700/30">
                <User className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Profile Details</h2>
              </div>

              <FeedbackBanner msg={profileMsg} />

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:scale-95 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700/30">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Lock className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Change Password</h2>
              </div>

              <FeedbackBanner msg={passwordMsg} />

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPass ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-700/20">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
                      placeholder="New Secure Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
                      placeholder="Repeat New Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
