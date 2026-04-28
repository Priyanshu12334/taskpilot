import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, MessageSquare, Settings, Users,
  LogOut, Loader2, X, Menu, Lock, HelpCircle
} from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import NotificationDropdown from './NotificationDropdown';

// ─── Nav config ──────────────────────────────────────────
const BASE_NAV = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard'   },
  { label: 'Team Chat',   icon: MessageSquare,   path: '/chat', requiresChat: true },
  { label: 'Settings',    icon: Settings,        path: '/settings'    },
  { label: 'Contact Us',  icon: HelpCircle,      path: '/contact'     },
];
const ADMIN_NAV = { label: 'Users', icon: Users, path: '/admin/users' };

// ─── Reusable SidebarItem ────────────────────────────────
function SidebarItem({ path, icon: Icon, label, onClick, disabled, lockedMessage }) {
  const content = (isActive) => (
    <>
      <div className={clsx(
        "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
      )}>
        <Icon className="w-5 h-5 shrink-0" />
      </div>
      <span className="flex-1 text-sm font-medium tracking-wide text-left">{label}</span>
      {disabled && (
        <div className="bg-slate-800/50 p-1.5 rounded-md border border-white/5 ml-auto">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
        </div>
      )}
    </>
  );

  if (disabled) {
    return (
      <li className="relative group/item list-none">
        <button
          onClick={() => alert(lockedMessage || "Access Restricted")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-200 opacity-60 cursor-not-allowed transition-all duration-200"
        >
          {content(false)}
        </button>
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-[11px] text-slate-200 rounded-lg border border-white/10 opacity-0 group-hover/item:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover/item:translate-x-0 shadow-2xl z-50 backdrop-blur-xl whitespace-nowrap">
          {lockedMessage}
        </div>
      </li>
    );
  }

  return (
    <li className="list-none">
      <NavLink
        to={path}
        onClick={onClick}
        className={({ isActive }) =>
          clsx(
            'group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200 select-none border-l-1 border-transparent',
            isActive
              ? 'bg-gradient-to-r from-white/5 to-transparent text-white border-l-white/5 shadow-sm'
              : 'text-slate-500 hover:text-white hover:bg-white/5'
          )
        }
      >
        {({ isActive }) => content(isActive)}
      </NavLink>
    </li>
  );
}

// ─── Main Sidebar ────────────────────────────────────────
const SidebarContent = ({ user, navItems, setOpen, handleLogout, isLoggingOut }) => (
  <div className="flex flex-col h-full">
    {/* Header / Logo */}
    <div className="flex items-center justify-between mb-10 px-2">
      <div className="flex items-center gap-2 group">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-900 rounded-3xl flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/50 transform transition-transform group-hover:scale-105">
            <span className="text-[12px] font-black tracking-widest text-white">TP</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl tracking-tight text-white">
            Task<span className="font-bold text-emerald-500">Pilot</span>
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {['admin', 'member'].includes(user?.role?.toLowerCase()) && (
          <div className="hidden sm:block">
            <NotificationDropdown />
          </div>
        )}
        <button
          className="sm:hidden p-2 text-slate-100 hover:text-white hover:bg-white/5 transition rounded-xl"
          onClick={() => setOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Nav Section */}
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
      <div>
        <p className="px-4 text-[10px] font-bold text-slate-200 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        <ul className="space-y-1">
          {navItems.map(item => {
            const isSimpleUser = user?.role?.toLowerCase() === 'simpleuser';
            const isChatDisabled = item.requiresChat && (isSimpleUser || (!user?.canAccessChat && user?.role?.toLowerCase() !== 'admin'));
            
            return (
              <SidebarItem
                key={item.path}
                {...item}
                disabled={isChatDisabled}
                lockedMessage={isSimpleUser ? "Promote to Member to unlock" : "Admin restricted access"}
                onClick={() => setOpen(false)}
              />
            );
          })}
        </ul>
      </div>
    </div>

    {/* Footer / User Profile */}
    <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
      <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-800 border-none group hover:bg-white/5 transition-colors duration-200">
        <div className="relative">
          <div className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow-inner',
            user?.role?.toLowerCase() === 'admin'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-500/10 text-slate-300 border-slate-500'
          )}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate text-white tracking-wide">{user?.name}</p>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{user?.role}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className=" flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-500/10 hover:text-slate-400 transition-all active:scale-[0.98] disabled:opacity-50 group"
      >
        {isLoggingOut
          ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          : <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        }
        {isLoggingOut ? 'Logging out...' : 'Log Out'}
      </button>
    </div>
  </div>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    setIsLoggingOut(true);
    try { await api.post('/auth/logout'); } catch {}
    finally { setTimeout(() => { logout(); navigate('/login', { replace: true }); }, 600); }
  };

  const role = user?.role?.toLowerCase();
  const navItems = role === 'admin'
    ? [...BASE_NAV, ADMIN_NAV]
    : BASE_NAV;

  const contentProps = { user, navItems, setOpen, handleLogout, isLoggingOut };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-4 bg-gradient-to-br from-slate-600/30 to-slate-900 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-900 rounded-3xl flex items-center justify-center shadow-lg shadow-black/30 border border-slate-700/30">
             <span className="text-[12px] font-black tracking-widest text-white">TP</span>
          </div>
          <h2 className="text-lg font-medium text-white tracking-tight">
            Task<span className="font-bold text-emerald-500">Pilot</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {['admin', 'member'].includes(user?.role?.toLowerCase()) && <NotificationDropdown />}
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={clsx(
        'sm:hidden fixed top-0 left-0 h-full w-72 z-[70] bg-gradient-to-br from-slate-900 to-slate-900 p-6 transition-transform duration-300 ease-in-out shadow-2xl',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent {...contentProps} />
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden sm:flex w-64 shrink-0 bg-gradient-to-br from-slate-900 to-slate-900 p-5 flex-col sticky top-0 h-screen z-50">
        <SidebarContent {...contentProps} />
      </nav>
    </>
  );
}