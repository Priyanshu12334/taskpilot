import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socket } from '../socket';
import api from '../services/api';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const [lastReadTimestamp, setLastReadTimestamp] = useState(
    localStorage.getItem(`lastRead_${user?._id}`) || 0
  );

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => {
    if (n.type === 'registration') {
      return !n.isRead;
    }
    if (user?.role?.toLowerCase() === 'admin') {
      return new Date(n.createdAt).getTime() > lastReadTimestamp;
    }
    return !n.isRead;
  }).length;

  const isAllowed = ['admin', 'member'].includes(user?.role?.toLowerCase());

  useEffect(() => {
    if (!user || !isAllowed) return;

    fetchNotifications();

    socket.connect();
    socket.on(`notification_${user._id}`, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    // Close on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socket.off(`notification_${user._id}`);
      socket.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user, isAllowed]);

  const fetchNotifications = async () => {
    if (!isAllowed) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // Only proceed with marking as read if user is allowed and unread count exists
    if (isAllowed && nextState && unreadCount > 0) {
      if (user?.role?.toLowerCase() === 'admin') {
        const now = Date.now();
        localStorage.setItem(`lastRead_${user._id}`, now);
        setLastReadTimestamp(now);
      } else {
        try {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          await api.patch('/notifications/read-all');
          await fetchNotifications();
        } catch (err) {
          console.error('Failed to mark all as read', err);
        }
      }
    }
  };

  const markAsRead = async (id) => {
    if (!isAllowed) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.type === 'registration') {
      if (!notif.isRead) {
        await markAsRead(notif._id);
      }
      setIsOpen(false);
      navigate('/admin/users');
    }
  };



  if (!isAllowed) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-[calc(90vw-2rem)] sm:w-80 bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
            <h3 className="font-bold text-red-600">Notifications</h3>
            {loading && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
          </div>

          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = notif.type === 'registration' 
                  ? !notif.isRead 
                  : (user?.role?.toLowerCase() === 'admin' 
                      ? new Date(notif.createdAt).getTime() > lastReadTimestamp 
                      : !notif.isRead);

                return (
                  <div 
                    key={notif._id}
                    className={clsx(
                      "p-4 border-b border-slate-700 last:border-0 transition-colors",
                      isUnread ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "hover:bg-slate-700/30"
                    )}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div 
                        className={clsx("flex-1 min-w-0", notif.type === 'registration' && "cursor-pointer")}
                        onClick={() => notif.type === 'registration' && handleNotificationClick(notif)}
                      >
                        {notif.type === 'registration' && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              New Pending User
                            </span>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            )}
                          </div>
                        )}
                        <p className={clsx(
                          "text-sm leading-snug break-words",
                          isUnread ? "text-slate-100 font-medium" : "text-slate-400"
                        )}>
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {dayjs(notif.createdAt).fromNow()}
                        </span>
                      </div>
                      {notif.type !== 'completion' && isUnread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif._id);
                          }}
                          className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


