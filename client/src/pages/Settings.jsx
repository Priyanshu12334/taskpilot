import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Save, User, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';

export default function Settings() {
  const { user, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoToast, setPhotoToast] = useState(null);
  const photoInputRef = useRef(null);
  const photoToastTimerRef = useRef(null);

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

  useEffect(() => () => clearTimeout(photoToastTimerRef.current), []);

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

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    setIsLoggingOut(true);
    try { await api.post('/auth/logout'); } catch {}
    finally { setTimeout(() => { logout(); navigate('/login', { replace: true }); }, 600); }
  };

  const showPhotoToast = (toast) => {
    clearTimeout(photoToastTimerRef.current);
    setPhotoToast(toast);
    photoToastTimerRef.current = setTimeout(() => setPhotoToast(null), 4500);
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showPhotoToast({ type: 'error', text: 'Choose a JPEG, PNG, or WebP image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showPhotoToast({ type: 'error', text: 'Profile photos must be 5 MB or smaller.' });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await api.post('/user/profile-photo', formData);
      updateUserData({ profilePhotoUrl: response.data.profilePhotoUrl });
      showPhotoToast({ type: 'success', text: 'Profile photo updated successfully.' });
    } catch (error) {
      showPhotoToast({
        type: 'error',
        text: error.response?.data?.message || 'Unable to upload your profile photo. Please try again.',
      });
    } finally {
      setIsUploadingPhoto(false);
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
    <div className="min-h-screen sm:h-screen bg-slate-900 text-white flex flex-col sm:flex-row sm:overflow-hidden relative overflow-x-hidden">
    
      {/* Subtle Green Ambient Glows - Top-Left & Bottom-Right */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />

      <Sidebar />

      {photoToast && (
        <div
          role={photoToast.type === 'error' ? 'alert' : 'status'}
          className={clsx(
            'fixed top-5 right-5 z-[120] max-w-[calc(100vw-2.5rem)] rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-xl',
            photoToast.type === 'success'
              ? 'border-emerald-500/30 bg-slate-900/95 text-emerald-300'
              : 'border-red-500/30 bg-slate-900/95 text-red-300'
          )}
        >
          {photoToast.text}
        </div>
      )}

      <main className="flex-1 sm:overflow-y-auto no-scrollbar min-h-screen sm:h-full pt-40 sm:pt-12 p-5 sm:p-12 relative z-10">
        <div className="max-w-xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Maintain your professional profile and security credentials.
            </p>
          </header>

          <div className="flex flex-col gap-6">
            {/* Profile Information */}
            <div className="bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-2xl p-5 sm:p-7">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-700/30">
                <User className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Profile Details</h2>
              </div>

              <div className="mb-5 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                  {user.profilePhotoUrl
                    ? <img src={user.profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
                    : user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200">Profile photo</p>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isUploadingPhoto && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                  </button>
                  <p className="mt-1 text-[11px] text-slate-500">JPEG, PNG, or WebP · up to 5 MB</p>
                </div>
              </div>

              <FeedbackBanner msg={profileMsg} />

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full sm:w-auto min-h-9 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors duration-200 shadow-md shadow-emerald-600/15 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-2xl p-5 sm:p-7 shadow-2xl">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-700/30">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Lock className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Change Password</h2>
              </div>

              <FeedbackBanner msg={passwordMsg} />

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPass ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
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

                <div className="space-y-1.5 pt-1 border-t border-slate-700/20">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-slate-500/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 outline-none transition-all placeholder-slate-600 shadow-inner"
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
                    className="w-full sm:w-auto min-h-9 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors duration-200 shadow-md shadow-emerald-600/15 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Update Password
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Logout</h3>
                  <p className="mt-1 text-xs text-slate-500">Sign out of your TaskPilot account.</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
