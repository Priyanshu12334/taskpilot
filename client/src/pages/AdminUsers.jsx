import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, Shield, ShieldOff, Users, CheckCircle2,
  AlertCircle, Search, X, MessageSquare, ToggleLeft, ToggleRight,
  Clock, Trash2, Check, XCircle
} from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';

// ─── Toast ───────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-16 sm:top-5 right-4 z-50 flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(
            'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium',
            'animate-[slideIn_0.25s_ease-out]',
            t.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 backdrop-blur'
              : 'bg-red-950/90 border-red-500/40 text-red-200 backdrop-blur'
          )}
        >
          {t.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            : <AlertCircle   className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          }
          <span className="flex-1 leading-snug">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}



// ─── Status Badge ────────────────────────────────────────
function StatusBadge({ status }) {
  const isBlocked = status === 'blocked';
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-tighter',
      isBlocked
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    )}>
      {status || 'active'}
    </span>
  );
}

// ─── Role Badge ──────────────────────────────────────────
function RoleBadge({ role }) {
  const r = role?.toLowerCase();
  const isAdmin    = r === 'admin';
  const isMember   = r === 'member';
  const isSimple   = r === 'simpleuser' || r === 'pending';

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border',
      isAdmin
        ? 'bg-blue-600/20 text-blue-100 border-blue-500/30'
        : isMember
          ? 'bg-emerald-600/20 text-emerald-100 border-emerald-500/30'
          : isSimple
            ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    )}>
      {isAdmin ? <Shield className="w-3 h-3" /> : isSimple ? <Clock className="w-3 h-3" /> : <Users className="w-3 h-3" />}
      {role}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function AdminUsers() {
  const { user, updateUserData } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rowLoading, setRowLoading] = useState({});
  const [search, setSearch]   = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [toasts, setToasts]   = useState([]);
  const [stats, setStats]     = useState({
    totalUsers: 0,
    blockedUsers: 0,
    simpleUsers: 0,
    members: 0,
    admins: 0
  });

  useEffect(() => { 
    if (user?.role?.toLowerCase() === 'admin') {
      fetchUsers(); 
      fetchStats();
    }
  }, [user]);

  // ── Toast helpers ──
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);
  const removeToast = useCallback(id =>
    setToasts(prev => prev.filter(t => t.id !== id)), []);

  // ── Fetch users ──
  const fetchUsers = async (isRefresh = false) => {
    if (!user || user.role?.toLowerCase() !== 'admin') return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.get('/user/all');
      setUsers(res.data);
    } catch {
      addToast('Failed to load users. Please try again.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    if (!user || user.role?.toLowerCase() !== 'admin') return;
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  // ── Actions ──
  const handlePromote = async (targetUser) => {
    setRowLoading(prev => ({ ...prev, [targetUser._id]: true }));
    try {
      const res = await api.put(`/admin/promote-user/${targetUser._id}`);
      setUsers(prev => prev.map(u => u._id === res.data._id ? { ...u, role: res.data.role, status: res.data.status } : u));
      fetchStats();
      addToast(`✓ ${targetUser.name} promoted to Member!`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to promote user.', 'error');
    } finally {
      setRowLoading(prev => ({ ...prev, [targetUser._id]: false }));
    }
  };

  const handleBlock = async (targetUser) => {
    const isConfirmed = window.confirm(`Are you sure you want to BLOCK "${targetUser.name}"? They will lose all access immediately.`);
    if (!isConfirmed) return;

    setRowLoading(prev => ({ ...prev, [targetUser._id]: true }));
    try {
      const res = await api.put(`/admin/block-user/${targetUser._id}`);
      setUsers(prev => prev.map(u => u._id === res.data._id ? { ...u, status: 'blocked' } : u));
      fetchStats();
      addToast(`✓ ${targetUser.name} has been blocked.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to block user.', 'error');
    } finally {
      setRowLoading(prev => ({ ...prev, [targetUser._id]: false }));
    }
  };

  const handleUnblock = async (targetUser) => {
    setRowLoading(prev => ({ ...prev, [targetUser._id]: true }));
    try {
      const res = await api.put(`/admin/unblock-user/${targetUser._id}`);
      setUsers(prev => prev.map(u => u._id === res.data._id ? { ...u, status: 'active' } : u));
      fetchStats();
      addToast(`✓ ${targetUser.name} has been unblocked.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to unblock user.', 'error');
    } finally {
      setRowLoading(prev => ({ ...prev, [targetUser._id]: false }));
    }
  };

  const requestRoleChange = async (targetUser, newRole) => {
    const verb = newRole === 'Admin' ? 'Promote' : 'Demote';
    const isConfirmed = window.confirm(`${verb} "${targetUser.name}" to ${newRole}? Access levels will change immediately.`);
    if (!isConfirmed) return;

    setRowLoading(prev => ({ ...prev, [targetUser._id]: true }));
    try {
      const res = await api.patch(`/user/${targetUser._id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === res.data._id ? res.data : u));
      fetchStats();
      if (res.data._id === user?._id) updateUserData({ role: res.data.role });
      addToast(`✓ ${targetUser.name} is now ${newRole}.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setRowLoading(prev => ({ ...prev, [targetUser._id]: false }));
    }
  };

  const handleToggleChat = async (targetUser) => {
    const newStatus = !targetUser.canAccessChat;
    setRowLoading(prev => ({ ...prev, [targetUser._id]: true }));
    try {
      const res = await api.patch(`/user/${targetUser._id}/chat-access`, { canAccessChat: newStatus });
      setUsers(prev => prev.map(u => u._id === res.data._id ? { ...u, canAccessChat: res.data.canAccessChat } : u));
      
      // If the admin is toggling THEIR OWN chat access, update globally
      if (res.data._id === user?._id) {
        updateUserData({ canAccessChat: res.data.canAccessChat });
      }

      addToast(`✓ Chat access ${newStatus ? 'granted' : 'revoked'} for ${targetUser.name}.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update chat access.', 'error');
    } finally {
      setRowLoading(prev => ({ ...prev, [targetUser._id]: false }));
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    
    if (!matchesSearch) return false;

    if (filterRole === 'Blocked') {
      return u.status === 'blocked';
    }

    if (filterRole === 'All') {
      return true;
    }

    // Role filters: Show only active users of that role
    return u.role?.toLowerCase() === filterRole?.toLowerCase() && u.status !== 'blocked';
  });

  // ── Action Buttons ──
  const ActionButton = ({ u }) => {
    const isSelf     = u._id === user?._id;
    const r          = u.role?.toLowerCase();
    const isAdmin    = r === 'admin';
    const isMember   = r === 'member';
    const isSimple   = r === 'simpleuser' || r === 'pending';
    const isBlocked  = u.status === 'blocked';
    const isLoading  = !!rowLoading[u._id];

    if (isSelf) return (
      <span className="text-xs italic text-slate-600 cursor-not-allowed">Your account</span>
    );

    if (isLoading) return (
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> Processing...
      </div>
    );

    if (isBlocked) return (
      <button
        onClick={() => handleUnblock(u)}
        className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all active:scale-95 shadow-lg shadow-emerald-500/5 whitespace-nowrap"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Restore Access
      </button>
    );

    if (isSimple) return (
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={() => handlePromote(u)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Check className="w-3.5 h-3.5" />
          Promote to Member
        </button>
        <button
          onClick={() => handleBlock(u)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all active:scale-95"
        >
          <XCircle className="w-3.5 h-3.5" />
          Block User
        </button>
      </div>
    );

    return isAdmin ? (
      <button
        onClick={() => requestRoleChange(u, 'Member')}
        className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all"
      >
        <ShieldOff className="w-3.5 h-3.5 shrink-0" />
        Demote Admin
      </button>
    ) : (
      <div className="flex gap-2">
        <button
          onClick={() => requestRoleChange(u, 'Admin')}
          className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 active:scale-95 transition-all"
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          Make Admin
        </button>
        <button
          onClick={() => handleBlock(u)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          title="Block User"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const ChatAccessButton = ({ u }) => {
    const isSelf     = u._id === user?._id;
    const isAdmin    = u.role === 'Admin';
    const isPending  = u.role === 'Pending';
    const isRejected = u.role === 'Rejected';
    const isBlocked  = u.status === 'blocked';
    const isLoading  = !!rowLoading[u._id];

    if (isSelf || isAdmin || isPending || isRejected || isBlocked) return null; // Admins always have access, pending/rejected/blocked cannot chat yet

    if (isLoading) return null;

    return (
      <button
        onClick={() => handleToggleChat(u)}
        className={clsx(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border active:scale-95",
          u.canAccessChat 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            : "bg-slate-700/40 text-slate-400 border-slate-600/50 hover:bg-slate-700/60"
        )}
        title={u.canAccessChat ? "Revoke chat access" : "Allow chat access"}
      >
        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
        {u.canAccessChat ? "Revoke Chat" : "Allow Chat"}
        {u.canAccessChat ? <ToggleRight className="w-4 h-4 ml-1 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 ml-1 text-slate-500" />}
      </button>
    );
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white flex overflow-hidden relative">

        <Sidebar />

        <main className="flex-1 overflow-y-auto no-scrollbar pt-20 sm:pt-0">
          <div className="p-4 sm:p-12 max-w-7xl mx-auto w-full">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-white">
                    User Management
                  </h1>
                </div>
                <p className="text-slate-400 text-sm font-medium ml-1">
                  Manage roles, permissions, and platform access for your entire organization.
                </p>
              </div>
              
              <button 
                onClick={() => { fetchUsers(true); fetchStats(); }}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              >
                <Loader2 className={clsx("w-4 h-4", refreshing && "animate-spin")} />
                {refreshing ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {[{ label: 'Total Users', val: stats.totalUsers, color: 'slate' },
                  { label: 'Simple User', val: stats.simpleUsers, color: 'yellow' },
                  { label: 'Team Members', val: stats.members, color: 'emerald' },
                  { label: 'Admins', val: stats.admins, color: 'blue' },
                  { label: 'Blocked', val: stats.blockedUsers, color: 'red' }
                ].map((stat) => (
                  <div 
                    key={stat.label} 
                    className={clsx(
                      "border p-6 rounded-2xl transition-all hover:shadow-xl",
                      stat.color === 'slate'   ? 'bg-slate-500/10 border-slate-700/50 hover:shadow-black/20' :
                      stat.color === 'yellow'  ? 'bg-yellow-500/10 border-yellow-500/20 hover:shadow-black/20' :
                      stat.color === 'red'     ? 'bg-red-500/10 border-red-500/20 hover:shadow-black/20' :
                      stat.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 hover:shadow-black/20' :
                      stat.color === 'blue'    ? 'bg-blue-500/10 border-blue-500/20 hover:shadow-black/20' :
                      'bg-slate-900 border-slate-700/50'
                    )}
                  >
                    <div>
                      <p className={clsx(
                        "text-2xl font-bold",
                        stat.color === 'slate' ? 'text-white' : 
                        stat.color === 'yellow' ? 'text-yellow-400' :
                        stat.color === 'red' ? 'text-red-400' :
                        stat.color === 'emerald' ? 'text-emerald-400' : 
                        stat.color === 'blue' ? 'text-blue-400' : 'text-white'
                      )}>{stat.val}</p>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by name, email, or role..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-200 placeholder-slate-500 outline-none focus:border-slate-500/50 transition-colors"
                />
              </div>
              <div className="flex p-1 bg-slate-900/50 border border-slate-700/50 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                {['All', 'simpleUser', 'member', 'admin', 'Blocked'].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRole(r)}
                    className={clsx(
                      'flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap border',
                      filterRole === r
                        ? r === 'All' ? 'bg-slate-800 text-white border-slate-700 shadow-lg' :
                          r === 'simpleUser' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30 shadow-lg shadow-yellow-500/10' :
                          r === 'member' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' :
                          r === 'admin' ? 'bg-blue-500/20 text-blue-100 border-blue-500/30 shadow-lg shadow-blue-500/10' :
                          r === 'Blocked' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-lg shadow-red-500/10' :
                          'bg-slate-800 text-white'
                        : 'text-slate-500 hover:text-slate-300 border-transparent'
                    )}
                  >
                    {r === 'simpleUser' ? 'SimpleUser' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block bg-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-700/50">
                      <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">#</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-24">
                          <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            <p className="text-sm font-medium animate-pulse">Fetching users...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                             <div className="p-4 bg-slate-800/50 rounded-full mb-2">
                               <Users className="w-8 h-8 text-slate-600" />
                             </div>
                             <p className="text-slate-400 font-medium">No results found</p>
                             <p className="text-slate-600 text-sm">Try adjusting your filters or search query.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((u, idx) => {
                        const isAdmin = u.role === 'Admin';
                        return (
                          <tr key={u._id} className="hover:bg-slate-700/20 transition-colors group">
                            <td className="px-6 py-5">
                              <span className="text-xs font-medium text-slate-600 group-hover:text-slate-400 transition-colors">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className={clsx(
                                  'w-11 h-11 rounded-[14px] flex items-center justify-center font-bold text-base shrink-0 border-2 transition-transform group-hover:scale-105',
                                  isAdmin ? 'bg-blue-600/10 text-blue-400 border-blue-500/20'
                                          : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
                                )}>
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate uppercase tracking-tight">
                                      {u.name}
                                    </p>
                                    {u._id === user?._id && (
                                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[9px] font-black uppercase">You</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{u.email}</p>
                                  <div 
                                    className="mt-2 py-1 px-2 bg-slate-900/40 rounded-lg text-[10px] text-slate-500 font-medium border border-slate-700/30 group-hover:border-slate-700/60 transition-all cursor-help"
                                    title={u.purpose || "No purpose provided"}
                                  >
                                    <span className="text-slate-600 font-bold uppercase text-[9px] mr-1">Purpose:</span>
                                    <span className="italic">
                                      {u.purpose 
                                        ? `"${u.purpose.length > 80 ? u.purpose.substring(0, 80) + '...' : u.purpose}"`
                                        : "Not provided"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1 items-start">
                                <RoleBadge role={u.role} />
                                <StatusBadge status={u.status} />
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                                <ChatAccessButton u={u} />
                                <div className="h-6 w-px bg-slate-700/50" />
                                <ActionButton u={u} />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Mobile Card List ── */}
            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="text-sm">Loading users...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  {search || filterRole !== 'All' ? 'No users match your filter.' : 'No users found.'}
                </div>
              ) : (
                filtered.map((u) => {
                  const isAdmin = u.role === 'Admin';
                  const isSelf  = u._id === user?._id;
                  return (
                    <div
                      key={u._id}
                      className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border-2',
                          isAdmin ? 'bg-blue-600/10 text-blue-400 border-blue-500/20'
                                  : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
                        )}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-base font-bold text-white uppercase tracking-tight">{u.name}</p>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[8px] font-black uppercase">You</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">{u.email}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic mt-1 pb-1 border-b border-slate-700/30">
                            {u.purpose 
                              ? `"${u.purpose.length > 60 ? u.purpose.substring(0, 60) + '...' : u.purpose}"`
                              : "No purpose provided"}
                          </p>
                        </div>
                        <RoleBadge role={u.role} />
                      </div>

                      <div className="pt-4 border-t border-slate-700/50 flex flex-col gap-2.5">
                        <ChatAccessButton u={u} />
                        <ActionButton u={u} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {users.length > 0 && !loading && (
              <p className="mt-8 text-center text-xs font-semibold text-slate-600 uppercase tracking-widest opacity-60">
                Administrative changes reflect on next user session
              </p>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

    </>
  );
}
