import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Edit2, Trash2, Check, User, AlertTriangle, X, History, Clock, RefreshCw, CheckCircle2, UserPlus, MessageSquare, Send, Lock, LayoutGrid, Calendar } from 'lucide-react';
import api from '../services/api';
import { socket } from '../socket';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Loader from '../components/Loader';

dayjs.extend(relativeTime);

// ─── Helper Functions ────────────────────────────────────
const isDueTomorrow = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  return due.getTime() === tomorrow.getTime();
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🛡️ Loading Guard: Ensure user data is available before rendering any dependent logic
  if (!user) return <Loader message="Initializing Dashboard..." />;
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Form states for creating a new task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // States for inline editing
  const [editingTask, setEditingTask] = useState(null); 
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [usersList, setUsersList] = useState([]);
  
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, inProgress: 0 });
  const [showReminder, setShowReminder] = useState(false);
  const [urgentTasksCount, setUrgentTasksCount] = useState(0);
  const [selectedHistoryTask, setSelectedHistoryTask] = useState(null);
  const [completionAlert, setCompletionAlert] = useState(null); 
  const [extraCount, setExtraCount] = useState(0); 
  const alertTimer = useRef(null);
  
  // Chat States
  const [activeChatTask, setActiveChatTask] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
 
  // Custom Dropdown States
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditAssignOpen, setIsEditAssignOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const statusRef = useRef(null);
  const editStatusRef = useRef(null);
  const assignRef = useRef(null);
  const editAssignRef = useRef(null);
  const sortRef = useRef(null);
 
  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
      if (editStatusRef.current && !editStatusRef.current.contains(e.target)) setIsEditStatusOpen(false);
      if (assignRef.current && !assignRef.current.contains(e.target)) setIsAssignOpen(false);
      if (editAssignRef.current && !editAssignRef.current.contains(e.target)) setIsEditAssignOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, sortOrder]);

  // Fetch users for assignments
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/user/all');
        setUsersList(res.data);
      } catch (err) { }
    };
    fetchUsers();

    // Listen for completion alerts (Admin only)
    if (user?.role?.toLowerCase() === 'admin') {
      socket.on('taskCompletedAlert', (data) => {
        if (data.userId !== user._id) {
          setCompletionAlert(prev => {
            if (prev) {
              setExtraCount(c => c + 1);
            } else {
              setExtraCount(0);
            }
            return data;
          });

          if (alertTimer.current) clearTimeout(alertTimer.current);
          alertTimer.current = setTimeout(() => {
            setCompletionAlert(null);
            setExtraCount(0);
          }, 5000);
        }
      });
      return () => {
        socket.disconnect();
        if (alertTimer.current) clearTimeout(alertTimer.current);
      };
    }
  }, [user]);

  // 1. Fetch Tasks from Backend
  useEffect(() => {
    fetchTasks();
  }, [currentPage, filter, sortOrder, searchQuery]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', {
        params: {
          page: currentPage,
          limit: 5,
          search: searchQuery,
          status: filter,
          sort: sortOrder
        }
      });
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages);
      setStats(res.data.stats);

      // Check for tasks due tomorrow or pending tasks (Role-based: only for non-admins)
      if (user?.role?.toLowerCase() !== 'admin') {
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const urgent = res.data.tasks.filter(t => 
          t.status !== 'Completed' && 
          t.dueDate && 
          new Date(t.dueDate).setHours(0,0,0,0) === tomorrow.getTime()
        );

        // Show reminder if there are urgent tasks OR general pending tasks
        if (urgent.length > 0 || res.data.stats.pending > 0) {
          setUrgentTasksCount(urgent.length);
          setShowReminder(true);
        } else {
          setShowReminder(false);
        }
      } else {
        setShowReminder(false);
      }
      
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // 2. Handle Add Task Submit
  const [taskError, setTaskError] = useState('');
  
  const handleAddTask = async (e) => {
    e.preventDefault();
    console.log('[handleAddTask] Form submitted');
    setTaskError('');
    
    if (!title.trim()) {
      console.warn('[handleAddTask] Title is empty, aborting');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      dueDate, // Send due date
      ...(assignedTo ? { assignedTo } : {})
    };
    console.log('[handleAddTask] Sending payload:', payload);

    setIsAddingTask(true);
    try {
      const res = await api.post('/tasks', payload);
      console.log('[handleAddTask] ✅ Task created:', res.data);
      await fetchTasks();
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setAssignedTo('');
      setDueDate('');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create task';
      console.error('[handleAddTask] ❌ Error:', error.response?.status, msg);
      console.error('[handleAddTask] Full error:', error);
      setTaskError(`Error ${error.response?.status || ''}: ${msg}`);
    } finally {
      setIsAddingTask(false);
    }
  };

  // 3. Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
    } catch (error) {
      alert("Failed to delete task.");
      console.error(error);
    }
  };

  // 4. Initiate Edit State
  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
    setEditAssignedTo(task.assignedTo?._id || '');
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setUpdateError('');
  };

  // 5. Submit Updated Task
  const [updateError, setUpdateError] = useState('');

  const handleUpdateTask = async (e, taskId) => {
    e.preventDefault();
    setUpdateError('');

    // Members can only update status — don't require title
    if (user?.role?.toLowerCase() === 'admin' && !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      // Admin sends full payload; Member only sends status
      const payload = user?.role?.toLowerCase() === 'admin'
        ? { title: editTitle, description: editDescription, status: editStatus, assignedTo: editAssignedTo || null, dueDate: editDueDate }
        : { status: editStatus };

      console.log('[handleUpdateTask] Sending payload:', payload);
      await api.put(`/tasks/${taskId}`, payload);
      await fetchTasks();
      setEditingTask(null);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update task';
      console.error('[handleUpdateTask] ❌', error.response?.status, msg);
      setUpdateError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // 6. Chat Logic
  const fetchChatMessages = async (task) => {
    setActiveChatTask(task);
    setIsLoadingChat(true);
    try {
      const res = await api.get(`/chat/${task._id}`);
      setChatMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch chat:", error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const res = await api.post('/chat/send', {
        taskId: activeChatTask._id,
        message: newMessage.trim()
      });
      setChatMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {} 
    finally {
      setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, 600);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white flex overflow-hidden relative">

      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pt-24 sm:pt-10 p-5 sm:p-14">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Hi, <span className="text-emerald-500">{user?.name || 'User'}</span></h1>
            <p className="text-slate-400 text-sm font-medium">
              {user?.role?.toLowerCase() === 'simpleuser' 
                ? 'Your account has limited access. Contact an admin to unlock more features.'
                : 'Here are your active tasks for today.'}
            </p>
          </div>
        </header>

        {/* Top Completion Alert (Admin Only) */}
        {completionAlert && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-md animate-in slide-in-from-top-4 duration-500">
            <div className="bg-emerald-600/90 backdrop-blur-xl border border-emerald-400/50 rounded-2xl p-4 flex items-center gap-4 shadow-2xl shadow-emerald-500/20">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                {extraCount > 0 ? <LayoutGrid className="w-6 h-6 text-white" /> : <CheckCircle2 className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-bold">
                  {extraCount > 0 ? "Multiple Tasks Finalized" : "Task Completed!"}
                </p>
                <p className="text-emerald-50 text-xs opacity-90">
                  <span className="font-black underline">{completionAlert.user}</span> finalized <span className="font-bold italic">"{completionAlert.taskTitle}"</span>
                  {extraCount > 0 && <span className="ml-1 font-bold text-white bg-white/20 px-1.5 py-0.5 rounded text-[10px]">+{extraCount} more update(s)</span>}
                </p>
              </div>
              <button 
                onClick={() => {
                  setCompletionAlert(null);
                  setExtraCount(0);
                }}
                className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 🛡️ LIMITED ACCESS BANNER */}
        {user?.role?.toLowerCase() === 'simpleuser' && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_15px_rgba(251,146,60,0.05)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-yellow-400">Limited Access Active</h4>
                  <p className="text-sm text-slate-400">
                    You cannot create or assign tasks yet. 
                    <span className="text-yellow-200/60 ml-1">An administrator needs to promote your account to 'Member'.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* One-time Urgency Toast (Hidden for Admin) */}
        {showReminder && user?.role?.toLowerCase() !== 'admin' && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-500">Action Required</h4>
                  <p className="text-xs text-slate-400">
                    {urgentTasksCount > 0 
                      ? <>You have <span className="text-amber-200 font-bold">{urgentTasksCount} task(s)</span> due tomorrow. Don't forget to check them!</>
                      : <>You have <span className="text-amber-200 font-bold">{stats.pending} pending task(s)</span>. Keep up the great work!</>
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReminder(false)}
                className="p-2 hover:bg-amber-500/10 rounded-xl text-slate-500 hover:text-amber-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-12">
          {/* Total Tasks */}
          <div className="bg-slate-700/50 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-500/10">
            <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider">Total Tasks</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
          </div>
          
          {/* Pending Tasks */}
          <div className="bg-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:bg-yellow-500/15">
            <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider">Pending</h3>
            <p className="text-2xl sm:text-3xl font-bold text-amber-500">{stats.pending}</p>
          </div>
          
          {/* In Progress Tasks */}
          <div className="bg-sky-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:bg-sky-500/15">
            <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider">In Progress</h3>
            <p className="text-2xl sm:text-3xl font-bold text-sky-500">{stats.inProgress || 0}</p>
          </div>
          
          {/* Completed Tasks */}
          <div className="bg-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-500/15">
            <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider">Completed</h3>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-500">{stats.completed}</p>
          </div>
          
          {/* Overdue Tasks */}
          <div className="bg-red-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:bg-red-500/15">
            <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider">Overdue</h3>
            <p className="text-2xl sm:text-3xl font-bold text-red-500">{stats.overdue || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Task Form Section */}
          {user?.role?.toLowerCase() === 'admin' && (
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border-slate-900/50 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Create Task
              </h2>
              
              {taskError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm mb-4">
                  {taskError}
                </div>
              )}
              
              <form onSubmit={handleAddTask} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design homepage"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none min-h-[120px] resize-none overflow-y-auto"
                  />
                </div>
                  <div className="relative" ref={statusRef}>
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Status</label>
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none"
                    >
                      {status}
                      <Clock className={clsx("w-4 h-4 transition-transform", isStatusOpen && "rotate-180")} />
                    </button>
                    
                    {isStatusOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-48 overflow-y-auto no-scrollbar">
                          {[
                            { val: 'Pending', color: 'hover:bg-amber-500/10 hover:text-amber-400' },
                            { val: 'In Progress', color: 'hover:bg-sky-500/10 hover:text-sky-400' },
                            { val: 'Completed', color: 'hover:bg-emerald-500/10 hover:text-emerald-400' }
                          ].map(opt => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => { setStatus(opt.val); setIsStatusOpen(false); }}
                              className={clsx(
                                "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-slate-700/50 last:border-0",
                                status === opt.val ? "bg-slate-700 text-white" : "text-slate-300",
                                opt.color
                              )}
                            >
                              {opt.val}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={assignRef}>
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Assign To</label>
                    <button
                      type="button"
                      onClick={() => setIsAssignOpen(!isAssignOpen)}
                      className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none"
                    >
                      <span className="truncate">{usersList.find(u => u._id === assignedTo)?.name || "Unassigned"}</span>
                      <User className={clsx("w-4 h-4 transition-transform", isAssignOpen && "scale-110")} />
                    </button>
                    
                    {isAssignOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-48 overflow-y-auto no-scrollbar">
                          <button
                            type="button"
                            onClick={() => { setAssignedTo(''); setIsAssignOpen(false); }}
                            className={clsx(
                              "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-slate-700/50 last:border-0 hover:bg-sky-600 hover:text-white",
                              assignedTo === '' ? "bg-slate-700 text-white" : "text-slate-300"
                            )}
                          >
                            Unassigned
                          </button>
                          {usersList.map(u => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => { setAssignedTo(u._id); setIsAssignOpen(false); }}
                              className={clsx(
                                "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-slate-700/50 last:border-0 hover:bg-sky-600 hover:text-white",
                                assignedTo === u._id ? "bg-slate-700 text-white" : "text-slate-300"
                              )}
                            >
                              {u.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Due Date</label>
                  <div className="date-input-wrapper">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]} // Prevent past dates
                      required 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none transition-colors"
                    />
                    <Calendar className="custom-calendar-icon w-4 h-4 text-white-500" />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isAddingTask || !title.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Task"}
                </button>
              </form>
            </div>
          </div>
          )}

          {/* Task List Section */}
          <div className={user?.role?.toLowerCase() === 'admin' ? "lg:col-span-2" : "col-span-1 lg:col-span-3"}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 min-h-[400px]">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold">Your Tasks</h2>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(f => (
                      <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={clsx(
                          "px-3 py-1.5 text-sm font-semibold rounded-full border transition flex items-center gap-2", 
                          filter === f 
                            ? clsx(
                                f === 'All' && "bg-slate-600 text-white border-slate-800",
                                f === 'Pending' && "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20",
                                f === 'In Progress' && "bg-cyan-600 text-white border-sky-700 shadow-md shadow-sky-600/20",
                                f === 'Completed' && "bg-emerald-600 text-white border-green-600 shadow-md shadow-green-600/20",
                                f === 'Overdue' && "bg-red-800 text-white border-red-700 shadow-md shadow-red-600/20"
                              )
                            : "bg-transparent border-slate-700 text-gray-400 hover:border-slate-500"
                        )}
                      >
                        {f}
                        {f === 'Overdue' && stats.overdue > 0 && (
                          <span className={clsx(
                            "w-2 h-2 rounded-full",
                            filter === 'Overdue' ? "bg-white" : "bg-red-500 animate-pulse"
                          )} />
                        )}
                        {f === 'Overdue' && stats.overdue > 0 && (
                          <span className="text-[10px] opacity-80 bg-black/20 px-1 rounded-sm">
                            {stats.overdue}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-sans text-slate-200 focus:border-slate-500/50 outline-none transition-colors"
                  />
                  <div className="relative sm:w-40" ref={sortRef}>
                    <button
                      type="button"
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="w-full flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 outline-none transition-colors"
                    >
                      <span>{sortOrder === 'latest' ? 'Latest First' : 'Oldest First'}</span>
                      <RefreshCw className={clsx("w-3.5 h-3.5 transition-transform", isSortOpen && "rotate-180")} />
                    </button>
                    
                    {isSortOpen && (
                      <div className="absolute right-0 left-0 sm:left-auto sm:w-40 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {[
                          { val: 'latest', label: 'Latest First' },
                          { val: 'oldest', label: 'Oldest First' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => { setSortOrder(opt.val); setIsSortOpen(false); }}
                            className={clsx(
                              "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-slate-700/50 last:border-0 hover:bg-sky-600 hover:text-white",
                              sortOrder === opt.val ? "bg-slate-700 text-white" : "text-slate-300"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-12">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                  <p>Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-500 pt-12 border-2 border-dashed border-slate-700 rounded-xl p-8">
                  <p>No tasks found. Tasks created will appear here.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {tasks
                    .filter(task => {
                      if (user?.role?.toLowerCase() === 'admin') return true;
                      const taskCreatorId = task.user?._id || task.user;
                      const taskAssigneeId = task.assignedTo?._id || task.assignedTo;
                      return taskCreatorId === user?._id || taskAssigneeId === user?._id;
                    })
                    .map(task => {
                    const todayDate = new Date();
                    todayDate.setHours(0,0,0,0);
                    const tomorrowDate = new Date(todayDate);
                    tomorrowDate.setDate(todayDate.getDate() + 1);

                    const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
                    if (dueDateObj) dueDateObj.setHours(0, 0, 0, 0);
                    
                    const diffDays = dueDateObj ? Math.floor((dueDateObj - todayDate) / (1000 * 60 * 60 * 24)) : null;
                    const isOverdue = task.status !== 'Completed' && diffDays !== null && diffDays < 0;
                    const isDueSoon = task.status !== 'Completed' && diffDays !== null && (diffDays === 0 || diffDays === 1);
                    
                    // Priority-based style classes
                    let cardClass = "bg-slate-900/50 border-slate-700";
                    if (isOverdue) {
                      cardClass = "bg-red-500/10 border-red-400 shadow-red-500/5";
                    } else if (isDueSoon) {
                      cardClass = "bg-amber-500/10 border-amber-400 shadow-amber-500/5";
                    } else if (task.status === "Completed") {
                      cardClass = "border-green-500 bg-slate-900/50";
                    } else if (task.status === "In Progress") {
                      cardClass = "border-sky-400 bg-slate-900/50";
                    } else if (task.status === "Pending") {
                      cardClass = "border-yellow-400 bg-slate-900/50";
                    }

                    return (
                    <div 
                      key={task._id} 
                      className={clsx(
                        "rounded-xl p-5 transition-all duration-300 border shadow-lg",
                        editingTask === task._id ? "overflow-visible" : "overflow-hidden",
                        cardClass
                      )}
                    >
                      
                      {/* === INLINE EDIT MODE === */}
                      {editingTask === task._id ? (
                        <form onSubmit={(e) => handleUpdateTask(e, task._id)} className="edit-task-container space-y-3 py-1 min-h-[150px] flex flex-col justify-between">
                          {updateError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">
                              {updateError}
                            </div>
                          )}
                          {user?.role?.toLowerCase() === 'admin' ? (
                            <>
                              <input
                                type="text"
                                required
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-500 rounded-lg px-2 py-1.5 text-sm text-slate-200 outline-none"
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-500/50 rounded-lg px-2 py-1.5 text-sm text-slate-200 outline-none min-h-[60px] resize-none overflow-y-auto"
                              />
                            </>
                          ) : (
                            <div className="pb-2">
                              <h3 className="text-md font-semibold text-white break-words">{task.title}</h3>
                              {task.description && <p className="text-sm text-slate-400 mt-1 break-words">{task.description}</p>}
                            </div>
                          )}
                          <div className="edit-actions flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                              <div className="relative min-w-[130px] flex-1 sm:flex-none" ref={editStatusRef}>
                                <button
                                  type="button"
                                  onClick={() => setIsEditStatusOpen(!isEditStatusOpen)}
                                  className="w-full flex items-center justify-between gap-2 bg-slate-800 border border-slate-500/50 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-200 outline-none"
                                >
                                  <span className="truncate">{editStatus}</span>
                                  <Clock className={clsx("w-3.5 h-3.5 transition-transform shrink-0", isEditStatusOpen && "rotate-180")} />
                                </button>
                                
                                {isEditStatusOpen && (
                                  <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-40 overflow-y-auto no-scrollbar">
                                      {[
                                        { val: 'Pending', color: 'hover:bg-amber-500/10 hover:text-amber-400' },
                                        { val: 'In Progress', color: 'hover:bg-blue-500/10 hover:text-blue-400' },
                                        { val: 'Completed', color: 'hover:bg-emerald-500/10 hover:text-emerald-400' }
                                      ].map(opt => (
                                        <button
                                          key={opt.val}
                                          type="button"
                                          onClick={() => { setEditStatus(opt.val); setIsEditStatusOpen(false); }}
                                          className={clsx(
                                            "w-full text-left px-3 py-2 text-xs font-semibold transition-colors border-b border-slate-800/50 last:border-0",
                                            editStatus === opt.val ? "bg-slate-800 text-white" : "text-slate-400",
                                            opt.color
                                          )}
                                        >
                                          {opt.val}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {user?.role?.toLowerCase() === 'admin' && (
                                <>
                                  <div className="relative min-w-[140px] flex-1 sm:flex-none" ref={editAssignRef}>
                                    <button
                                      type="button"
                                      onClick={() => setIsEditAssignOpen(!isEditAssignOpen)}
                                      className="w-full flex items-center justify-between gap-2 bg-slate-800 border border-slate-500/50 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-200 outline-none"
                                    >
                                      <span className="truncate">{usersList.find(u => u._id === editAssignedTo)?.name || "Unassigned"}</span>
                                      <User className={clsx("w-3.5 h-3.5 transition-transform shrink-0", isEditAssignOpen && "scale-110")} />
                                    </button>
                                    
                                    {isEditAssignOpen && (
                                      <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="max-h-40 overflow-y-auto no-scrollbar">
                                          <button
                                            type="button"
                                            onClick={() => { setEditAssignedTo(''); setIsEditAssignOpen(false); }}
                                            className={clsx(
                                              "w-full text-left px-3 py-2 text-xs font-semibold transition-colors border-b border-slate-800/50 last:border-0 hover:bg-sky-600 hover:text-white",
                                              editAssignedTo === '' ? "bg-slate-800 text-white" : "text-slate-400"
                                            )}
                                          >
                                            Unassigned
                                          </button>
                                          {usersList.map(u => (
                                            <button
                                              key={u._id}
                                              type="button"
                                              onClick={() => { setEditAssignedTo(u._id); setIsEditAssignOpen(false); }}
                                              className={clsx(
                                                "w-full text-left px-3 py-2 text-xs font-semibold transition-colors border-b border-slate-800/50 last:border-0 hover:bg-sky-600 hover:text-white",
                                                editAssignedTo === u._id ? "bg-slate-800 text-white" : "text-slate-400"
                                              )}
                                            >
                                              {u.name}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="date-input-wrapper min-w-[130px]">
                                    <input
                                      type="date"
                                      value={editDueDate}
                                      onChange={(e) => setEditDueDate(e.target.value)}
                                      className="bg-slate-800 border border-slate-500/50 rounded-lg px-2 py-1.5 text-sm text-slate-200 outline-none w-full"
                                    />
                                    <Calendar className="custom-calendar-icon w-4 h-4 text-slate-200" />
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button 
                                type="button"
                                onClick={cancelEditing} 
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-800 transition"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                disabled={isUpdating}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition flex items-center gap-1"
                              >
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                                Save
                              </button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        /* === NORMAL VIEW MODE === */
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-overflow-hidden">
                            <h3 className="text-md font-semibold text-white break-words">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm mt-1 break-words text-slate-300">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <span className={clsx(
                                  "text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
                                  isOverdue && "bg-red-600 text-red-100 border border-red-400/50 shadow-[0_0_10px_rgba(220,38,38,0.3)]",
                                  !isOverdue && task.status === "Pending" && "bg-amber-600 text-amber-100 border border-amber-400/50 shadow-[0_0_10px_rgba(202,138,4,0.3)]",
                                  !isOverdue && task.status === "In Progress" && "bg-cyan-600 text-cyan-100 border border-cyan-400/50 shadow-[0_0_10px_rgba(2,132,199,0.3)]",
                                  task.status === "Completed" && "bg-emerald-600 text-emerald-100 border border-emerald-400/50 shadow-[0_0_10px_rgba(5,150,105,0.3)]"
                                )}>
                                  {isOverdue ? "Overdue" : task.status}
                                </span>
                                {task.assignedTo && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border shrink-0 bg-slate-800 text-slate-100 border-slate-700">
                                    <User className="w-3.5 h-3.5 text-blue-400" />
                                    {task.assignedTo.name}
                                  </div>
                                )}
                                {task.dueDate && (
                                  <div className={clsx(
                                    "flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border shrink-0",
                                    isOverdue ? "bg-red-500/20 text-red-100 border-red-500/30" : "bg-slate-800 text-slate-100 border-slate-700"
                                  )}>
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                                {/* Urgency Badge (Only if not overdue) */}
                                {isDueSoon && !isOverdue && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full animate-pulse w-100 sm:w-auto mt-1 sm:mt-0 bg-amber-500/20 text-amber-100 border border-amber-500/30">
                                    ⚠️ {diffDays === 0 ? "Due Today" : "1 day left"} 
                                  </div>
                                )}
                            </div>
                            
                            {/* Mini Log Preview */}
                            {task.activityLog?.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-800/50">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                  <Clock className="w-3 h-3" /> Recent Activity
                                </div>
                                <div className="space-y-1.5">
                                  {[...task.activityLog].slice(-2).reverse().map((log, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px]">
                                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                                      <span className="text-slate-300">
                                        <span className="text-slate-100 font-medium">{log.user}</span> {log.action.toLowerCase()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                              <div className="flex gap-2 shrink-0">
                            {(user?.role?.toLowerCase() === 'admin' || (user?.role?.toLowerCase() === 'member' && task.assignedTo?._id === user?._id)) && (
                              <button
                                onClick={() => startEditing(task)}
                                className="p-1.5 text-slate-300 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition"
                                title="Edit Task"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {user?.role?.toLowerCase() === 'admin' && (
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-400/10 rounded-md transition"
                                title="Delete Task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedHistoryTask(task)}
                              className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition"
                              title="View History"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            {(user?.role?.toLowerCase() === 'admin' || user?._id === task.assignedTo?._id) && (
                              <button
                                onClick={() => fetchChatMessages(task)}
                                className="p-1.5 text-slate-300 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition"
                                title="Task Chat"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}) }
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-700/50">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium text-slate-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>

      {/* Activity History Modal */}
      {selectedHistoryTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Activity Log</h2>
                  <p className="text-sm font-medium text-slate-400">History for: {selectedHistoryTask.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedHistoryTask(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {selectedHistoryTask.activityLog?.length > 0 ? (
                  [...selectedHistoryTask.activityLog].reverse().map((log, idx) => {
                    // Logic to determine icon and color
                    let Icon = Clock;
                    let iconColor = "text-slate-400";
                    let bgColor = "bg-slate-800/40";
                    let borderColor = "border-slate-700/30";

                    const actionLower = log.action.toLowerCase();
                    if (actionLower.includes('assigned')) {
                      Icon = UserPlus;
                      iconColor = "text-blue-400";
                      bgColor = "bg-blue-500/5";
                      borderColor = "border-blue-500/20";
                    } else if (actionLower.includes('status changed')) {
                      Icon = RefreshCw;
                      iconColor = "text-yellow-400";
                      bgColor = "bg-yellow-500/5";
                      borderColor = "border-yellow-500/20";
                    } else if (actionLower.includes('completed')) {
                      Icon = CheckCircle2;
                      iconColor = "text-green-400";
                      bgColor = "bg-green-500/5";
                      borderColor = "border-green-500/20";
                    } else if (actionLower.includes('created')) {
                      Icon = Plus;
                      iconColor = "text-emerald-400";
                    }

                    return (
                    <div key={idx} className="relative pl-10 group transition-all">
                      <div className="absolute left-0 top-1 w-[36px] h-[36px] flex items-center justify-center">
                        <div className={clsx(
                          "w-3.5 h-3.5 rounded-full bg-slate-900 border-2 z-10 transition-colors shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                          actionLower.includes('assigned') ? "border-blue-500" :
                          actionLower.includes('status changed') ? "border-yellow-500" :
                          actionLower.includes('completed') ? "border-green-500" : "border-emerald-500"
                        )} />
                      </div>
                      <div className={clsx(
                        "border rounded-xl p-3 transition-all hover:translate-x-1",
                        bgColor, borderColor
                      )}>
                        <div className="flex items-start gap-2">
                          <Icon className={clsx("w-3.5 h-3.5 mt-0.5 shrink-0", iconColor)} />
                          <p className="text-sm font-semibold text-slate-200">{log.action}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                          <span className="text-[11px] text-slate-400 font-medium">By <span className="text-slate-200">{log.user}</span></span>
                          <span className="text-[10px] text-slate-500 italic" title={new Date(log.timestamp).toLocaleString()}>
                            {dayjs(log.timestamp).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )})
                ) : (
                  <p className="text-center text-slate-500 py-4 font-medium italic">No history available for this task.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-transparent border-t border-slate-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedHistoryTask(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Chat Modal */}
      {activeChatTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 w-full max-w-lg h-[600px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-none">Task Chat</h3>
                  <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[200px]">Project: {activeChatTask.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatTask(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent custom-scrollbar">
              {isLoadingChat ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-sm italic">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.sender?._id === user?._id;
                  return (
                    <div key={idx} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className={clsx(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        isMe 
                          ? "bg-emerald-600 text-white rounded-tr-none" 
                          : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                      )}>
                        {!isMe && <p className="text-[10px] font-bold text-emerald-400 mb-1 uppercase tracking-tighter">{msg.sender?.name}</p>}
                        <p>{msg.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">
                        {dayjs(msg.createdAt).format('hh:mm A')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/50 bg-transparent">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 outline-non transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
                >
                  {isSendingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
