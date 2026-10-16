import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ListTodo, MessageSquare, Settings, Users,
  X, Menu, Lock, HelpCircle
} from 'lucide-react';
import clsx from 'clsx';
import NotificationDropdown from './NotificationDropdown';
import { getRoleDetails, isApprovalPending } from '../utils/roleUtils';

// ─── Nav config ──────────────────────────────────────────
const BASE_NAV = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard'   },
  { label: 'Your Tasks',  icon: ListTodo,         path: '/tasks'       },
  { label: 'Team Chat',   icon: MessageSquare,   path: '/chat', requiresChat: true },
  { label: 'Settings',    icon: Settings,        path: '/settings'    },
  { label: 'Contact Us',  icon: HelpCircle,      path: '/contact'     },
];
const ADMIN_NAV = { label: 'Users', icon: Users, path: '/admin/users' };

// ─── Reusable SidebarItem ────────────────────────────────
function SidebarItem({ path, icon: Icon, label, onClick, onLockedClick, disabled, lockedMessage }) {
  const content = (isActive) => (
    <>
      <div className={clsx(
        "w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
      )}>
        <Icon className="w-5 h-5 shrink-0" />
      </div>
      <span className="flex-1 text-[13px] font-medium tracking-wide text-left">{label}</span>
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
          type="button"
          onClick={onLockedClick}
          aria-label={`${label} locked: ${lockedMessage}`}
          className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-xl text-slate-200 opacity-60 cursor-not-allowed transition-all duration-200"
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
            'group flex items-center gap-2.5 w-full px-3 py-1.5 rounded-xl transition-all duration-200 select-none border-l-1 border-transparent',
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
const SidebarContent = ({ user, navItems, setOpen, navigate, showNotifications }) => (
  <div className="flex flex-col h-full">
    {/* Header / Logo */}
    <div className="flex items-center justify-between mb-7 px-2">
      <div className="flex items-center gap-2 group">
        <div className="relative">
          <div className="absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-700 rounded-3xl flex items-center justify-center shadow-lg shadow-black/50 border border-slate-800/50 transform transition-transform group-hover:scale-105">
            <span className="text-[12px] font-black tracking-widest text-white">T<span className="text-emerald-600">P</span></span>
          </div>
        </div>
        <div>
          <h2 className="text-xl tracking-tight text-white">
            Task<span className="font-bold text-emerald-500">Pilot</span>
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {showNotifications && ['admin', 'member'].includes(user?.role?.toLowerCase()) && (
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
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
      <div>
        <div className="h-[15px] mb-3" aria-hidden="true" />
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const isSimpleUser = isApprovalPending(user);
            const taskLocked = item.path === '/tasks' && isApprovalPending(user);
            const isChatDisabled = item.requiresChat && (isSimpleUser || (!user?.canAccessChat && user?.role?.toLowerCase() !== 'admin'));
            
            return (
              <SidebarItem
                key={item.path}
                {...item}
                disabled={taskLocked || isChatDisabled}
                lockedMessage={taskLocked ? "Available after admin approval" : isSimpleUser ? "Promote to Member to unlock" : "Admin restricted access"}
                onClick={() => setOpen(false)}
                onLockedClick={taskLocked ? () => { setOpen(false); navigate('/tasks'); } : undefined}
              />
            );
          })}
        </ul>
      </div>
    </div>

    {/* Footer / User Profile */}
    <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
      <button
        type="button"
        onClick={() => { setOpen(false); navigate('/settings'); }}
        aria-label="Open profile settings"
        className="flex w-full items-center gap-2.5 p-1.5 rounded-2xl bg-slate-800 border-none group text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
      >
        <div className="relative">
          <div className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden',
            getRoleDetails(user?.role).sidebarAvatarClass
          )}>
            {user?.profilePhotoUrl
              ? <img src={user.profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
              : user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="min-w-0 flex-1 rounded-lg px-2 py-1 -ml-2 transition-colors duration-200 group-hover:bg-slate-700/30">
          <p className="text-sm font-bold truncate text-white tracking-wide">{user?.name}</p>
          <p className={clsx("text-[10px] font-bold uppercase tracking-wider", getRoleDetails(user?.role).textClass)}>
            {getRoleDetails(user?.role).displayLabel}
          </p>
        </div>
      </button>

    </div>
  </div>
);

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 640px)');
    const updateViewport = (event) => {
      setIsDesktop(event.matches);
      if (event.matches) setOpen(false);
    };
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const role = user?.role?.toLowerCase();
  const navItems = role === 'admin'
    ? [...BASE_NAV, ADMIN_NAV]
    : BASE_NAV;

  const contentProps = { user, navItems, setOpen, navigate, showNotifications: isDesktop };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-4 bg-gradient-to-br from-slate-600/30 to-slate-900 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-700 rounded-3xl flex items-center justify-center shadow-lg shadow-black/50 border border-slate-700/30">
             <span className="text-[12px] font-black tracking-widest text-white">T<span className="text-emerald-600">P</span></span>
          </div>
          <h2 className="text-lg text-white tracking-tight">
            Task<span className="font-bold text-emerald-500">Pilot</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isDesktop && ['admin', 'member'].includes(user?.role?.toLowerCase()) && <NotificationDropdown />}
          <button
            type="button"
            onClick={() => setOpen(current => !current)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation-drawer"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 motion-reduce:transition-none"
          >
            <Menu className={clsx('absolute h-5 w-5 transition-all duration-200 motion-reduce:transition-none', open ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
            <X className={clsx('absolute h-5 w-5 transition-all duration-200 motion-reduce:transition-none', open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0')} />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      <div
        aria-hidden="true"
        className={clsx(
          'sm:hidden fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div className={clsx(
        'sm:hidden fixed inset-y-0 left-0 z-[70] h-dvh w-[min(20rem,calc(100vw_-_2.5rem))] overflow-y-auto bg-slate-900 p-5 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out motion-reduce:transition-none',
        open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
      )}>
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal={open ? 'true' : undefined}
          aria-label="Mobile navigation"
          aria-hidden={!open}
          inert={!open}
          className="h-full"
        >
        <SidebarContent {...contentProps} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden sm:flex w-64 shrink-0 bg-gradient-to-br from-slate-900 to-slate-900 p-4 flex-col sticky top-0 h-screen z-50">
        <SidebarContent {...contentProps} />
      </nav>
    </>
  );
}
