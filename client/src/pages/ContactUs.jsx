import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  HelpCircle, Wrench, Lightbulb, UserCheck, Mail, Globe, 
  Github, Linkedin, ChevronDown, Send, CheckCircle2, 
  Loader2, ArrowUpRight, MessageSquare, Inbox, Search,
  X, Check, Clock, Eye, Filter, ChevronLeft, ChevronRight, CheckSquare, Trash2
} from 'lucide-react';
import api from '../services/api';
import { socket } from '../socket';
import { getRoleDetails } from '../utils/roleUtils';
import clsx from 'clsx';
import dayjs from 'dayjs';

export default function ContactUs() {
  const { user } = useAuth();
  const location = useLocation();
  const formRef = useRef(null);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [queryType, setQueryType] = useState('General Query');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Admin Support Messages Inbox State
  const [adminMessages, setAdminMessages] = useState([]);
  const [loadingAdminMsgs, setLoadingAdminMsgs] = useState(false);
  const [adminFilter, setAdminFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Selected Message Modal State
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (user) {
      setFullName(prev => (prev === '' ? user.name || '' : prev));
      setEmail(prev => (prev === '' ? user.email || '' : prev));
    }
  }, [user]);

  // Fetch admin support messages if user is Admin
  useEffect(() => {
    if (!isAdmin) return;

    fetchAdminSupportMessages(currentPage, adminFilter, statusFilter, searchQuery);

    socket.connect();
    socket.on('newContactMessage', () => {
      fetchAdminSupportMessages(currentPage, adminFilter, statusFilter, searchQuery);
    });

    return () => {
      socket.off('newContactMessage');
    };
  }, [isAdmin, currentPage, adminFilter, statusFilter, searchQuery]);

  // Check if navigated from notification with a pre-selected message ID
  useEffect(() => {
    const selectedMsgId = location.state?.selectedMsgId;
    if (isAdmin && selectedMsgId && adminMessages.length > 0) {
      const msg = adminMessages.find(m => m._id === selectedMsgId);
      if (msg) {
        openMessageModal(msg);
      }
    }
  }, [location.state, adminMessages, isAdmin]);

  const fetchAdminSupportMessages = async (page = 1, category = 'All', status = 'All', search = '') => {
    try {
      setLoadingAdminMsgs(true);
      const params = {
        page,
        limit: 5,
        queryType: category,
        status,
        search: search.trim()
      };
      const res = await api.get('/user/contact', { params });
      if (res.data.success) {
        setAdminMessages(res.data.messages || []);
        setTotalPages(res.data.pages || 1);
        setTotalMessages(res.data.total || 0);
        setUnreadMessagesCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch support messages', err);
    } finally {
      setLoadingAdminMsgs(false);
    }
  };

  const openMessageModal = async (msg) => {
    setSelectedMessage(msg);

    // Auto mark as read if message is unread
    if (!msg.isRead) {
      try {
        await api.patch(`/user/contact/${msg._id}/read`);
        setAdminMessages(prev =>
          prev.map(m => (m._id === msg._id ? { ...m, isRead: true } : m))
        );
        setSelectedMessage(prev => (prev ? { ...prev, isRead: true } : null));
        setUnreadMessagesCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark message as read', err);
      }
    }
  };

  const handleManualMarkRead = async (msg) => {
    if (!msg || msg.isRead) return;
    try {
      await api.patch(`/user/contact/${msg._id}/read`);
      setAdminMessages(prev =>
        prev.map(m => (m._id === msg._id ? { ...m, isRead: true } : m))
      );
      setSelectedMessage(prev => (prev ? { ...prev, isRead: true } : null));
      setUnreadMessagesCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark message as read', err);
    }
  };

  const handleToggleResolve = async (msg) => {
    if (!msg) return;
    const nextStatus = msg.status === 'resolved' ? 'pending' : 'resolved';
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/user/contact/${msg._id}/resolve`, { status: nextStatus });
      if (res.data.success) {
        const updated = res.data.data;
        setAdminMessages(prev =>
          prev.map(m => (m._id === msg._id ? { ...m, status: updated.status } : m))
        );
        setSelectedMessage(prev => (prev ? { ...prev, status: updated.status } : null));
      }
    } catch (err) {
      console.error('Failed to update message status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (!msg) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/user/contact/${msg._id}`);
      if (res.data.success) {
        setAdminMessages(prev => prev.filter(m => m._id !== msg._id));
        setTotalMessages(prev => Math.max(0, prev - 1));
        if (!msg.isRead) {
          setUnreadMessagesCount(prev => Math.max(0, prev - 1));
        }
        if (selectedMessage?._id === msg._id) {
          setSelectedMessage(null);
        }
        setMessageToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete support message', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const supportOptions = [
    {
      id: 'general',
      title: 'General Queries',
      description: 'Have a question about TaskPilot or how something works?',
      type: 'General Query',
      icon: HelpCircle,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'Facing a bug, error, or technical issue?',
      type: 'Technical Issue',
      icon: Wrench,
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    },
    {
      id: 'feedback',
      title: 'Feedback & Suggestions',
      description: 'Have an idea that could make TaskPilot better?',
      type: 'Feedback',
      icon: Lightbulb,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'account',
      title: 'Account & Access',
      description: 'Need help with your account, pending approval, or access?',
      type: 'Account / Access',
      icon: UserCheck,
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  ];

  const handleCardClick = (type) => {
    setQueryType(type);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/user/contact', {
        name: fullName.trim(),
        email: email.trim(),
        queryType,
        subject: subject.trim(),
        message: message.trim()
      });

      if (res.data.success) {
        setSubmitted(true);
        setSubject('');
        setMessage('');
      } else {
        setError(res.data.message || 'Unable to submit your message.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const getRoleBadge = (role) => {
    const details = getRoleDetails(role);
    return (
      <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", details.badgeClass)}>
        {details.label}
      </span>
    );
  };

  const getQueryBadge = (type) => {
    const t = type || 'General Query';
    if (t === 'Technical Issue') {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Technical Issue</span>;
    }
    if (t === 'Account / Access') {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Account / Access</span>;
    }
    if (t === 'Feedback') {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Feedback</span>;
    }
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t}</span>;
  };

  return (
    <div className="min-h-screen sm:h-screen bg-slate-900 text-white flex flex-col sm:flex-row sm:overflow-hidden relative overflow-x-hidden">

      {/* Subtle Green Ambient Glows - Top-Left & Bottom-Right */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />

      <Sidebar />

      <main className="flex-1 sm:overflow-y-auto no-scrollbar min-h-screen sm:h-full pt-40 sm:pt-10 p-5 sm:p-14 relative overflow-x-hidden z-10">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Support & Contact</h1>
          <p className="text-slate-400 text-sm font-medium">
            Have a question, found an issue, or need help with TaskPilot? Reach out to us and we'll be happy to help.
          </p>
        </header>

        {/* ROLE-NEUTRAL "NEED HELP?" INFORMATION CARD */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-7 mb-10 shadow-lg relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Need Help?</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Support Center
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-3">
              Have a question, found an issue, or need assistance with your TaskPilot account? Send us a message and our team will get back to you.
            </p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              Whether you're an Admin, Member, or waiting for account approval, you can contact us anytime.
            </p>
          </div>
        </div>

        {/* SUPPORT OPTIONS CARDS */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Choose a Support Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((opt) => {
              const IconComp = opt.icon;
              return (
                <div
                  key={opt.id}
                  className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner shrink-0", opt.badgeColor)}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white leading-tight">{opt.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                      {opt.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCardClick(opt.type)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2 group-hover:text-white border border-slate-700/50"
                  >
                    <span>Contact Support</span>
                    <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ADMIN ONLY: SCALABLE INBOX-STYLE SUPPORT MESSAGES UI */}
        {isAdmin && (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-12 shadow-lg">
            {/* Header & Unread Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                  <h2 className="text-xl font-bold text-white">Received Support Messages</h2>
                  {unreadMessagesCount > 0 && (
                    <span className="text-[10px] sm:text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 sm:px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                      {unreadMessagesCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and respond to support queries from members and pending users.</p>
              </div>
            </div>

            {/* Search Bar & Filters Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              {/* Search Field */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search support messages..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-slate-500/50 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Category:
                </span>
                {['All', 'General Query', 'Technical Issue', 'Account / Access', 'Feedback', 'Other'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setAdminFilter(cat); setCurrentPage(1); }}
                    className={clsx(
                      "px-3 py-1 text-xs font-semibold rounded-full border transition-colors",
                      adminFilter === cat
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter Sub-Row */}
            <div className="flex items-center gap-2 mb-6 text-xs border-b border-slate-800/80 pb-4">
              <span className="font-semibold text-slate-400">Status:</span>
              {['All', 'Unread', 'Read', 'Resolved', 'Pending'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={clsx(
                    "px-2.5 py-0.5 rounded-md font-medium transition-colors border",
                    statusFilter === st
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-slate-800/40 text-slate-400 border-slate-800 hover:text-slate-300"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Compact Message List / Inbox */}
            {loadingAdminMsgs ? (
              <div className="p-12 text-center text-slate-400 font-medium flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Loading support inbox...</span>
              </div>
            ) : adminMessages.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-400">
                <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-500" />
                <p className="text-base font-bold text-slate-300 mb-1">
                  {searchQuery || adminFilter !== 'All' || statusFilter !== 'All' ? 'No support messages found' : 'No support messages yet'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Messages submitted through the Contact Us page will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminMessages.map((msg) => {
                  const isUnread = !msg.isRead;
                  const isResolved = msg.status === 'resolved';

                  return (
                    <div
                      key={msg._id}
                      onClick={() => openMessageModal(msg)}
                      className={clsx(
                        "group p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                        isUnread
                          ? "bg-slate-800/80 border-sky-500/30 hover:border-sky-500/50 shadow-md"
                          : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600"
                      )}
                    >
                      {/* Left Block: Sender Info & Truncated Subject/Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {/* Unread Glow Dot */}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shrink-0"></span>
                          )}

                          <span className={clsx("font-bold text-sm truncate", isUnread ? "text-white" : "text-slate-200")}>
                            {msg.name}
                          </span>
                          <span className="text-xs text-slate-400 truncate">({msg.email})</span>

                          {getRoleBadge(msg.role || msg.sender?.role)}
                          {getQueryBadge(msg.queryType)}

                          {isResolved && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Resolved
                            </span>
                          )}
                        </div>

                        {/* Subject & Line-Clamp Preview */}
                        <p className={clsx("text-sm font-semibold truncate mb-0.5", isUnread ? "text-slate-100" : "text-slate-300")}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-slate-400 truncate line-clamp-1">
                          {msg.message}
                        </p>
                      </div>

                      {/* Right Block: Timestamp & View Details Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                        <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                          {dayjs(msg.createdAt).format('D MMM YYYY, h:mm A')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMessageModal(msg);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Server-Side Pagination Controls (Max 5 Messages Per Page) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-800">
                <span className="text-xs font-medium text-slate-400">
                  Showing {Math.min((currentPage - 1) * 5 + 1, totalMessages)} - {Math.min(currentPage * 5, totalMessages)} of {totalMessages} messages
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={clsx(
                        "w-8 h-8 rounded-lg text-xs font-bold transition-colors border",
                        currentPage === p
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      )}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FULL MESSAGE DETAIL MODAL (DARK SLATE THEME) */}
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Message Details</h3>
                  {getQueryBadge(selectedMessage.queryType)}
                  {selectedMessage.status === 'resolved' ? (
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-5 space-y-5">
                {/* Sender Info Block */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-base">{selectedMessage.name}</span>
                      {getRoleBadge(selectedMessage.role || selectedMessage.sender?.role)}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{selectedMessage.email}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {dayjs(selectedMessage.createdAt).format('D MMMM YYYY, h:mm A')}
                  </span>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Subject</label>
                  <h4 className="text-base font-bold text-white">{selectedMessage.subject}</h4>
                </div>

                {/* Message Body */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Message</label>
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-400">Read Status:</span>
                  <span className={clsx("font-bold uppercase tracking-wider", selectedMessage.isRead ? "text-emerald-400" : "text-sky-400")}>
                    {selectedMessage.isRead ? 'READ' : 'UNREAD'}
                  </span>
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!selectedMessage.isRead && (
                    <button
                      type="button"
                      onClick={() => handleManualMarkRead(selectedMessage)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as Read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleToggleResolve(selectedMessage)}
                    className={clsx(
                      "px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 disabled:opacity-50",
                      selectedMessage.status === 'resolved'
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    )}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckSquare className="w-3.5 h-3.5" />
                    )}
                    <span>{selectedMessage.status === 'resolved' ? 'Mark as Pending' : 'Mark as Resolved'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessageToDelete(selectedMessage)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION MODAL FOR DELETING SUPPORT MESSAGE */}
        {messageToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete this support message?</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setMessageToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDeleteMessage(messageToDelete)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEND US A MESSAGE & CONTACT INFORMATION GRID */}
        <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-stretch">
          {/* Contact Form Column (2 Cols on Desktop) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between h-full">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Send Us a Message</h2>
              <p className="text-xs text-slate-400 font-medium">Fill in the details below and we'll get back to you.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Message Sent Successfully!</h3>
                <p className="text-sm text-slate-300 font-medium max-w-md mx-auto mb-6">
                  Thank you for reaching out. We have received your query and will respond as soon as possible.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:border-slate-500/50 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:border-slate-500/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Query Type
                    </label>
                    <div className="relative">
                      <select
                        value={queryType}
                        onChange={(e) => setQueryType(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:border-slate-500/50 outline-none appearance-none transition-colors cursor-pointer pr-10"
                      >
                        <option value="General Query">General Query</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Account / Access">Account / Access</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Summary of your inquiry"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:border-slate-500/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query or feedback..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm font-medium text-slate-200 focus:border-slate-500/50 outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* CONTACT INFORMATION CARD */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between h-full">
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Get in touch</h2>

              {/* Developer Profile Header */}
              <div className="mb-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700/50">
                <h3 className="text-base font-bold text-white">Priyanshu Suyal</h3>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">Full Stack Developer</p>
              </div>

              {/* Contact Links */}
              <div className="space-y-4">
                {/* Email */}
                <a
                  href="mailto:suyalpriyanshu2@gmail.com"
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-xs lg:text-[11.5px] xl:text-xs font-medium text-slate-200 tracking-tight pr-1.5 transition-colors">
                      suyalpriyanshu2@gmail.com
                    </p>
                  </div>
                </a>

                {/* Portfolio */}
                <a
                  href="https://portfolio-ten-blond-87.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio</p>
                      <p className="text-sm font-medium text-slate-200 transition-colors">
                        Priyanshu Suyal
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 transition-colors" />
                  </div>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/Priyanshu12334"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Github className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GitHub</p>
                      <p className="text-sm font-medium text-slate-200 transition-colors">
                        Priyanshu12334
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 transition-colors" />
                  </div>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/priyanshu-suyal-5732b224a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0A9FE8]/10 border border-[#0A9FE8]/20 text-[#0A9FE8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LinkedIn</p>
                      <p className="text-sm font-medium text-slate-200 transition-colors">
                        Priyanshu Suyal
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 transition-colors" />
                  </div>
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 font-medium">
              <p>Typical response time: Within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800/60 text-center text-slate-500 text-xs font-medium pb-6">
          <p>© TaskPilot Support & Help Center. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
