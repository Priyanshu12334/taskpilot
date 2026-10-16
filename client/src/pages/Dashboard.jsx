import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Plus, Edit2, Trash2, Check, User, AlertTriangle, X, History, Clock, RefreshCw, ChevronDown, CheckCircle2, UserPlus, MessageSquare, Send, Lock, LayoutGrid, Calendar, Sparkles, ChevronLeft, ChevronRight, CheckSquare, ListTodo, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { socket } from '../socket';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import UserAvatar from '../components/UserAvatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Loader from '../components/Loader';
import TaskProgressBar from '../components/TaskProgressBar';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

dayjs.extend(relativeTime);

// ─── Pending User Onboarding Tutorial Component ──────────
const tutorialSteps = [
  {
    step: 1,
    title: 'Register',
    subtitle: 'Account Creation',
    description: 'Your account starts with Pending User access.',
    icon: UserPlus,
    badgeColor: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    step: 2,
    title: 'Admin Review',
    subtitle: 'Account Verification',
    description: 'Your account is awaiting administrator review. For faster access, contact the admin through Contact Us.',
    icon: Clock,
    badgeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    step: 3,
    title: 'Access Granted',
    subtitle: 'Role Assignment',
    description: "You may be approved as a Member or Admin, depending on the administrator's decision.",
    icon: CheckCircle2,
    badgeColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    step: 4,
    title: 'Start Working',
    subtitle: 'Full Authorization',
    description: 'Once approved, the admin can assign Member or Admin access, unlocking the features and permissions for your role. Team chat will also become available.',
    icon: CheckSquare,
    badgeColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
  },
];

function PendingUserTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  const step = tutorialSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 sm:p-8 mb-12 shadow-xl relative overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1">How TaskPilot Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Follow these 4 simple steps to understand how TaskPilot access works.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl">
          <span className="text-xs font-bold text-slate-200">Step {currentStep + 1}</span>
          <span className="text-xs font-semibold text-slate-500">/</span>
          <span className="text-xs font-bold text-slate-400">4</span>
        </div>
      </div>

      {/* Step Tracker Pills Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 relative">
        {tutorialSteps.map((s, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={clsx(
                "flex flex-row items-center justify-start sm:justify-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all duration-300 w-full min-w-0",
                isActive
                  ? "bg-slate-800 border-slate-600 text-white shadow-md shadow-black/20 scale-[1.01]"
                  : isCompleted
                  ? "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "bg-slate-800/30 border-slate-800 text-slate-500 hover:text-slate-400 hover:bg-slate-800/50"
              )}
            >
              <div
                className={clsx(
                  "w-5 h-5 sm:w-[18px] sm:h-[18px] rounded-full flex items-center justify-center text-[10px] sm:text-[9.5px] font-extrabold shrink-0 transition-all",
                  isActive
                    ? "bg-white text-slate-950 font-black"
                    : isCompleted
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-800 text-slate-500"
                )}
              >
                {isCompleted ? <Check className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-slate-300" /> : s.step}
              </div>
              <span className="truncate text-[11px] sm:text-xs leading-none">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Step Display Card with Animation */}
      <div
        key={currentStep}
        className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 sm:p-8 mb-8 animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Desktop Icon Box */}
          <div className={clsx(
            "hidden sm:flex w-12 h-12 border rounded-xl items-center justify-center shrink-0 shadow-lg shadow-black/20",
            step.iconBg
          )}>
            <StepIcon className={clsx("w-6 h-6", step.iconColor)} />
          </div>

          <div className="flex-1 w-full">
            {/* Mobile Icon + Subtitle Badge Row */}
            <div className="flex sm:hidden items-center gap-2.5 mb-3">
              <div className={clsx("w-8 h-8 border rounded-lg flex items-center justify-center shrink-0", step.iconBg)}>
                <StepIcon className={clsx("w-4 h-4", step.iconColor)} />
              </div>
              <span className={clsx("text-[11px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-md", step.badgeColor)}>
                {step.subtitle}
              </span>
            </div>

            {/* Desktop Subtitle Badge */}
            <div className="hidden sm:flex items-center gap-2 mb-1">
              <span className={clsx("text-[11px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-md", step.badgeColor)}>
                {step.subtitle}
              </span>
            </div>

            <h3 className="text-xl sm:text-xl font-extrabold text-white mb-2">
              Step {step.step} — {step.title}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
              "{step.description}"
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 border border-slate-700/50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-xs font-bold text-slate-400 tracking-widest">
          {currentStep + 1} / {tutorialSteps.length}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentStep === tutorialSteps.length - 1}
          className={clsx(
            "px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-lg",
            currentStep === tutorialSteps.length - 1
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
          )}
        >
          {currentStep === tutorialSteps.length - 1 ? (
            <>
              <Check className="w-4 h-4" />
              Done
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

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

// Module-level caches to prevent flashing loading states when user returns to Dashboard
let cachedForUserId = null;
let cachedTasks = null;
let cachedStats = null;
let cachedTotalPages = null;
let cachedWeeklyActivity = null;

const StatsSkeletonCard = () => (
  <div className="bg-slate-700/30 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg shadow-black/10 shimmer-wrapper animate-pulse-subtle min-h-[96px]">
    <div className="h-3 w-16 bg-slate-700/50 rounded mb-2.5"></div>
    <div className="h-8 w-12 bg-slate-700/50 rounded"></div>
  </div>
);

const TaskSkeleton = () => (
  <div className="rounded-xl p-5 border border-slate-800 bg-slate-950/20 shadow-lg relative overflow-hidden shimmer-wrapper animate-pulse-subtle">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex-1 space-y-3">
        <div className="h-5 w-1/3 bg-slate-800 rounded"></div>
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-slate-800 rounded"></div>
          <div className="h-3.5 w-5/6 bg-slate-800 rounded"></div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
          <div className="h-6 w-24 bg-slate-800 rounded-full"></div>
          <div className="h-6 w-28 bg-slate-800 rounded-full"></div>
        </div>
      </div>
      <div className="flex gap-2 shrink-0 self-end sm:self-start">
        <div className="w-8 h-8 bg-slate-800 rounded-md"></div>
        <div className="w-8 h-8 bg-slate-800 rounded-md"></div>
        <div className="w-8 h-8 bg-slate-800 rounded-md"></div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTasksPage = location.pathname === '/tasks';
  const createTaskFormRef = useRef(null);

  useEffect(() => {
    if (!isTasksPage || !location.state?.focusCreateTask) return;

    const frame = requestAnimationFrame(() => {
      createTaskFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navigate(location.pathname, { replace: true, state: null });
    });

    return () => cancelAnimationFrame(frame);
  }, [isTasksPage, location.pathname, location.state, navigate]);

  // 🛡️ Loading Guard: Ensure user data is available before rendering any dependent logic
  if (!user) return <Loader message="Initializing Dashboard..." />;

  // Clear user cache if user changes (e.g. log out and log in as another user)
  if (cachedForUserId !== user?._id) {
    cachedTasks = null;
    cachedStats = null;
    cachedTotalPages = null;
    cachedWeeklyActivity = null;
    cachedForUserId = user?._id;
  }
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tasks, setTasks] = useState(cachedTasks || []);
  const [loadingTasks, setLoadingTasks] = useState(!cachedTasks);
  const displayTasks = tasks.filter(task => {
    if (user?.role?.toLowerCase() === 'admin') return true;
    const taskCreatorId = task.user?._id || task.user;
    const taskAssigneeId = task.assignedTo?._id || task.assignedTo;
    return taskCreatorId === user?._id || taskAssigneeId === user?._id;
  });
  const [weeklyActivity, setWeeklyActivity] = useState(cachedWeeklyActivity || []);
  const [loadingWeekly, setLoadingWeekly] = useState(!cachedWeeklyActivity);
  const [chartError, setChartError] = useState('');

  const isUserAdmin = user?.role?.toLowerCase() === 'admin';
  const chartTitle = isUserAdmin ? "Weekly Task Activity" : "Weekly Assigned Tasks";
  const tooltipLabel = isUserAdmin ? "Tasks Created" : "Tasks Assigned";
  const emptyStateMessage = isUserAdmin ? "No task activity available" : "No assigned tasks available";

  // Form states for creating a new task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // AI Task Description Generator Handler
  const handleGenerateAiDescription = async () => {
    if (!title || !title.trim()) {
      setTaskError('Please enter a task title first before generating AI description.');
      return;
    }

    setIsGeneratingAi(true);
    setTaskError('');

    try {
      const res = await api.post('/tasks/generate-description', {
        title: title.trim(),
        description: description ? description.trim() : ''
      });

      if (res.data && res.data.description) {
        setDescription(res.data.description);
      }
    } catch (err) {
      console.error('[AI Description Generator Error]:', err);
      const errMsg = err.response?.data?.message || 'Failed to generate description with AI. Please try again.';
      setTaskError(errMsg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const taskRequestRef = useRef(null);
  const weeklyActivityRequestRef = useRef(null);
  const [totalPages, setTotalPages] = useState(cachedTotalPages || 1);
  const [stats, setStats] = useState(cachedStats || { total: 0, pending: 0, completed: 0, inProgress: 0 });
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

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  // Fetch users for assignments (Only approved Members)
  const usersFetchedRef = useRef(false);
  const usersFetchRef = useRef(null);
  const fetchUsers = async () => {
    if (usersFetchedRef.current) return;
    if (usersFetchRef.current) return usersFetchRef.current;

    usersFetchRef.current = api.get('/user/assignable')
      .then(res => {
        setUsersList(res.data);
        usersFetchedRef.current = true;
      })
      .catch(() => {})
      .finally(() => {
        usersFetchRef.current = null;
      });
    return usersFetchRef.current;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleProfilePhotoUpdated = ({ userId, name, profilePhotoUrl }) => {
      if (!userId) return;
      const updatedUserId = userId.toString();
      const updateAssignedUser = (task) => {
        const assignedId = task.assignedTo?._id?.toString()
          || (typeof task.assignedTo === 'string' ? task.assignedTo : '');
        if (assignedId !== updatedUserId) return task;

        const currentAssignee = typeof task.assignedTo === 'object' ? task.assignedTo : {};
        return {
          ...task,
          assignedTo: {
            ...currentAssignee,
            _id: updatedUserId,
            name: name || currentAssignee.name,
            profilePhotoUrl: profilePhotoUrl || '',
          },
        };
      };

      setUsersList(current => current.map(assignedUser => (
        assignedUser._id.toString() === updatedUserId
          ? { ...assignedUser, profilePhotoUrl: profilePhotoUrl || '' }
          : assignedUser
      )));
      cachedTasks = cachedTasks?.map(updateAssignedUser) || cachedTasks;
      setTasks(current => current.map(updateAssignedUser));
    };

    socket.on('profilePhotoUpdated', handleProfilePhotoUpdated);
    socket.connect();
    return () => socket.off('profilePhotoUpdated', handleProfilePhotoUpdated);
  }, []);

  // Listen for completion alerts (Admin only)
  useEffect(() => {
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
  }, [user?._id, user?.role]);

  // 1. Fetch Tasks from Backend
  const previousTaskFiltersRef = useRef({ filter, searchQuery: debouncedSearchQuery, sortOrder });
  useEffect(() => {
    const previousFilters = previousTaskFiltersRef.current;
    const filtersChanged = previousFilters.filter !== filter
      || previousFilters.searchQuery !== debouncedSearchQuery
      || previousFilters.sortOrder !== sortOrder;
    previousTaskFiltersRef.current = { filter, searchQuery: debouncedSearchQuery, sortOrder };

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }
    fetchTasks();
  }, [currentPage, filter, sortOrder, debouncedSearchQuery]);

  const fetchTasks = async (force = false) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;
    const { token } = JSON.parse(userInfo || '{}');
    if (!token) return;

    const requestKey = JSON.stringify([currentPage, filter, sortOrder, debouncedSearchQuery]);
    if (!force && taskRequestRef.current?.key === requestKey) {
      return taskRequestRef.current.promise;
    }
    const request = api.get('/tasks', {
      params: {
        page: currentPage,
        limit: 5,
        search: debouncedSearchQuery,
        status: filter,
        sort: sortOrder
      }
    });
    taskRequestRef.current = { key: requestKey, promise: request };

    try {
      console.log('[Dashboard] 📋 Fetching tasks...');
      const res = await request;
      if (taskRequestRef.current?.promise !== request) return;
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages);
      setStats(res.data.stats);

      // Save to cache
      cachedTasks = res.data.tasks;
      cachedStats = res.data.stats;
      cachedTotalPages = res.data.totalPages;

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
      if (taskRequestRef.current?.promise === request) {
        taskRequestRef.current = null;
        setLoadingTasks(false);
      }
    }
  };

  const fetchWeeklyActivity = async (force = false) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;
    const { token } = JSON.parse(userInfo || '{}');
    if (!token) return;

    if (!force && weeklyActivityRequestRef.current) return weeklyActivityRequestRef.current;
    const request = api.get('/tasks/weekly-activity');
    weeklyActivityRequestRef.current = request;

    try {
      console.log('[Dashboard] 📈 Fetching weekly activity...');
      const res = await request;
      if (weeklyActivityRequestRef.current !== request) return;
      setWeeklyActivity(res.data);
      cachedWeeklyActivity = res.data;
      setChartError('');
    } catch (err) {
      console.error("Failed to fetch weekly activity:", err);
      setChartError("Failed to load task activity chart.");
    } finally {
      if (weeklyActivityRequestRef.current === request) {
        weeklyActivityRequestRef.current = null;
        setLoadingWeekly(false);
      }
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchWeeklyActivity();
    }
  }, [user?._id]);

  // 2. Handle Add Task Submit
  const [taskError, setTaskError] = useState('');
  const [taskCreated, setTaskCreated] = useState(false);
  const taskCreatedTimer = useRef(null);
  const taskSubmitLock = useRef(false);
  
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (taskSubmitLock.current || isAddingTask) return;
    console.log('[handleAddTask] Form submitted');
    setTaskError('');
    setTaskCreated(false);
    
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
    taskSubmitLock.current = true;
    try {
      const res = await api.post('/tasks', payload);
      console.log('[handleAddTask] ✅ Task created:', res.data);
      await fetchTasks(true);
      await fetchWeeklyActivity(true);
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setAssignedTo('');
      setDueDate('');
      setTaskCreated(true);
      if (taskCreatedTimer.current) clearTimeout(taskCreatedTimer.current);
      taskCreatedTimer.current = setTimeout(() => setTaskCreated(false), 3500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create task';
      console.error('[handleAddTask] ❌ Error:', error.response?.status, msg);
      console.error('[handleAddTask] Full error:', error);
      setTaskError(`Error ${error.response?.status || ''}: ${msg}`);
    } finally {
      taskSubmitLock.current = false;
      setIsAddingTask(false);
    }
  };

  useEffect(() => () => {
    if (taskCreatedTimer.current) clearTimeout(taskCreatedTimer.current);
  }, []);

  // 3. Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks(true);
      await fetchWeeklyActivity(true);
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
      await fetchTasks(true);
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
      // Clear cache on logout
      cachedTasks = null;
      cachedStats = null;
      cachedTotalPages = null;
      cachedWeeklyActivity = null;
      setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, 600);
    }
  };

  return (
    <div className="min-h-screen sm:h-screen bg-slate-900 text-white flex flex-col sm:flex-row sm:overflow-hidden relative overflow-x-hidden">

      {/* Subtle Green Ambient Glows - Top-Left & Bottom-Right */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />

      <Sidebar />

      {/* Main Content Area */}
      <main className={clsx("flex-1 sm:overflow-y-auto no-scrollbar min-h-screen sm:h-full pt-40 p-5 relative z-10", isTasksPage ? "sm:pt-8 sm:px-8 lg:px-10" : "sm:pt-10 sm:p-14")}>
        <header className={clsx("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", isTasksPage ? "mb-6" : "mb-10")}>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white mb-2">{isTasksPage ? 'Your Tasks' : <>Hi, <span className="text-emerald-500">{user?.name || 'User'}</span></>}</h1>
            <p className="text-slate-400 text-sm font-medium">
              {isTasksPage ? 'Manage tasks, track progress, and keep your team in sync.' : user?.role?.toLowerCase() === 'simpleuser'
                ? "Your account is awaiting admin approval. You'll get full access once your account is approved."
                : 'Here are your active tasks for today.'}
            </p>
          </div>
          {!isTasksPage && user?.role?.toLowerCase() === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('/tasks', { state: { focusCreateTask: true } })}
              className="inline-flex min-h-10 w-auto shrink-0 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              <span>Create Task</span>
            </button>
          )}
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

        {/* 🔒 PENDING APPROVAL BANNER */}
        {user?.role?.toLowerCase() === 'simpleuser' && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(251,146,60,0.05)]">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-yellow-400">🔒 Pending Approval</h4>
                  <p className="text-sm text-slate-400">
                    Your account is awaiting admin approval. Full access to task management and team chat will be unlocked after approval. If you need faster verification, you can contact the administrator.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/contact')}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap shadow-lg shadow-yellow-500/10"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contact Admin
                </button>
                <button
                  disabled
                  className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed select-none whitespace-nowrap text-center animate-pulse-subtle"
                >
                  Status: Pending Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {/* One-time Urgency Toast (Hidden for Admin/Pending User) */}
        {showReminder && user?.role?.toLowerCase() !== 'admin' && user?.role?.toLowerCase() !== 'simpleuser' && (
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

        {/* Pending User Onboarding Tutorial OR Normal Dashboard Content */}
        {['simpleuser', 'pending'].includes(user?.role?.toLowerCase()) ? (
          <PendingUserTutorial />
        ) : (
          <>
            {!isTasksPage && <>
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-3 sm:gap-x-4 mb-12">
          {loadingTasks ? (
            <>
              <StatsSkeletonCard />
              <StatsSkeletonCard />
              <StatsSkeletonCard />
              <StatsSkeletonCard />
              <StatsSkeletonCard />
            </>
          ) : (
            <>
              {/* Total Tasks */}
              <div className="min-h-[104px] rounded-2xl p-3 sm:p-4 flex flex-col justify-center shadow-sm shadow-black/10 transition-transform duration-300 hover:scale-[1.02]" style={{ backgroundColor: '#252B2F' }}>
                <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider">Total Tasks</h3>
                <p className="text-[28px] leading-none font-bold text-white">{stats.total}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Tasks in workspace</p>
              </div>
              
              {/* Pending Tasks */}
              <div className="min-h-[104px] rounded-2xl p-3 sm:p-4 flex flex-col justify-center shadow-sm shadow-black/10 transition-transform duration-300 hover:scale-[1.02]" style={{ backgroundColor: '#252B2F' }}>
                <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider">Pending</h3>
                <p className="text-[28px] leading-none font-bold text-amber-500">{stats.pending}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Not started yet</p>
              </div>
              
              {/* In Progress Tasks */}
              <div className="min-h-[104px] rounded-2xl p-3 sm:p-4 flex flex-col justify-center shadow-sm shadow-black/10 transition-transform duration-300 hover:scale-[1.02]" style={{ backgroundColor: '#252B2F' }}>
                <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider">In Progress</h3>
                <p className="text-[28px] leading-none font-bold text-sky-500">{stats.inProgress || 0}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Work underway</p>
              </div>
              
              {/* Completed Tasks */}
              <div className="min-h-[104px] rounded-2xl p-3 sm:p-4 flex flex-col justify-center shadow-sm shadow-black/10 transition-transform duration-300 hover:scale-[1.02]" style={{ backgroundColor: '#252B2F' }}>
                <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider">Completed</h3>
                <p className="text-[28px] leading-none font-bold text-emerald-500">{stats.completed}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Successfully finished</p>
              </div>
              
              {/* Overdue Tasks */}
              <div className="min-h-[104px] rounded-2xl p-3 sm:p-4 flex flex-col justify-center shadow-sm shadow-black/10 transition-transform duration-300 hover:scale-[1.02]" style={{ backgroundColor: '#252B2F' }}>
                <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider">Overdue</h3>
                <p className="text-[28px] leading-none font-bold text-red-500">{stats.overdue || 0}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Past deadline</p>
              </div>
            </>
          )}
        </div>

        {/* Overall Progress and Weekly Task Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 items-stretch">
          <div className="lg:col-span-4 min-w-0">
            <TaskProgressBar stats={stats} loading={loadingTasks} />
          </div>

          {/* Weekly Task Activity Chart */}
          <div className="lg:col-span-8 min-w-0 bg-slate-900 border border-slate-700/50 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> {chartTitle}
          </h2>
          {loadingWeekly ? (
            <div className="h-44 sm:h-48 flex items-center justify-center bg-transparent rounded-xl border border-slate-800 animate-pulse-subtle shimmer-wrapper">
              <div className="text-slate-500 text-sm font-medium">Loading activity chart...</div>
            </div>
          ) : chartError ? (
            <div className="h-44 sm:h-48 flex items-center justify-center bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl">
              <p>{chartError}</p>
            </div>
          ) : weeklyActivity.every(d => d.count === 0) ? (
            <div className="h-44 sm:h-48 flex flex-col items-center justify-center bg-transparent rounded-xl border border-slate-800 text-slate-500 text-center px-4">
              <Calendar className="w-8 h-8 mb-2 opacity-30" />
              {user?.role?.toLowerCase() === 'simpleuser' ? (
                <>
                  <p className="text-sm font-bold text-slate-300">No task activity yet.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">Analytics will appear after your account is approved and tasks are assigned.</p>
                </>
              ) : (
                <p className="text-sm font-medium">{emptyStateMessage}</p>
              )}
            </div>
          ) : (
            <div className="h-44 sm:h-48 w-full min-w-0 relative overflow-hidden" style={{ top: '25px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                <AreaChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weeklyTaskActivityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal vertical={false} stroke="#64748b" strokeDasharray="3 5" opacity={0.18} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    tickLine={false} 
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderColor: '#475569', 
                      borderRadius: '12px',
                      color: '#f8fafc' 
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                  />
                  <Area
                    type="monotone" 
                    dataKey="count" 
                    name={tooltipLabel}
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#weeklyTaskActivityFill)"
                    activeDot={{ r: 4, stroke: '#064e3b', strokeWidth: 1.5, fill: '#34d399' }}
                    dot={{ r: 2.5, stroke: '#34d399', strokeWidth: 1, fill: '#0f0f0f' }}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="group mt-6 w-full rounded-2xl bg-[#1e2225] p-4 sm:p-5 text-left shadow-sm shadow-black/10 transition-all duration-300 hover:scale-[1.01] hover:bg-[#1e2225] focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ListTodo className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">Your Tasks</span>
              <span className="mt-1 block text-xs text-slate-400">View and manage all your tasks.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-emerald-400" aria-hidden="true" />
          </span>
        </button>
        </>}

        {isTasksPage && <div>
          {/* Add Task Form Section */}
          {user?.role?.toLowerCase() === 'admin' && (
          <div id="create-task-form" ref={createTaskFormRef} className="scroll-mt-6 bg-slate-900/80 border border-slate-700/40 rounded-2xl p-4 sm:p-5 shadow-lg mb-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Create Task
            </h2>
            
            {taskError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm mb-4">
                {taskError}
              </div>
            )}
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Row 1 Col 1: Task Title */}
                <div className="col-span-12 lg:col-span-4">
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Task Title</label>
                  <textarea
                    required
                    rows={3}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="e.g. Design homepage"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none min-h-[80px] resize-none overflow-y-auto"
                  />
                </div>

                {/* Row 1 Col 2: Description */}
                <div className="col-span-12 lg:col-span-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={isGeneratingAi}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate description using AI based on Task Title"
                    >
                      {isGeneratingAi ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Generate with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details..."
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none min-h-[80px] resize-none overflow-y-auto"
                  />
                </div>

                {/* Row 1 Col 3: Status */}
                <div className="col-span-12 lg:col-span-3 relative" ref={statusRef}>
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Status</label>
                  <button
                    type="button"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none h-11 lg:min-h-[80px] transition-colors"
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

                {/* Row 2 Col 1: Assign To */}
                <div className="col-span-12 lg:col-span-4 relative" ref={assignRef}>
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Assign To</label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isAssignOpen;
                      setIsAssignOpen(next);
                      if (next) fetchUsers();
                    }}
                    className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none h-11 lg:min-h-[80px] transition-colors"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {assignedTo && <UserAvatar user={usersList.find(u => u._id === assignedTo)} />}
                      <span className="truncate">{usersList.find(u => u._id === assignedTo)?.name || "Unassigned"}</span>
                    </span>
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
                        {usersList.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
                            No members available
                          </div>
                        ) : (
                          usersList.map(u => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => { setAssignedTo(u._id); setIsAssignOpen(false); }}
                              className={clsx(
                                "flex w-full items-center gap-2.5 text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-slate-700/50 last:border-0 hover:bg-sky-600 hover:text-white",
                                assignedTo === u._id ? "bg-slate-700 text-white" : "text-slate-300"
                              )}
                            >
                              <UserAvatar user={u} />
                              <span className="truncate">{u.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 2 Col 2: Due Date */}
                <div className="col-span-12 lg:col-span-5">
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Due Date</label>
                  <div className="date-input-wrapper">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      required 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none h-11 lg:min-h-[80px] transition-colors"
                    />
                    <Calendar className="custom-calendar-icon w-4 h-4 text-white-500" />
                  </div>
                </div>

                {/* Row 2 Col 3: Add Task Button */}
                <div className="col-span-12 lg:col-span-3">
                  <label className="hidden lg:block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1.5 invisible select-none">Action</label>
                  <button
                    type="submit"
                    disabled={isAddingTask || !title.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-11 lg:min-h-[80px]"
                  >
                    {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Task"}
                  </button>
                </div>
              </div>
            </form>
            {taskCreated && (
              <div role="status" className="task-success-message flex items-center gap-2 text-emerald-300 text-xs font-medium mt-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Task created successfully.</span>
              </div>
            )}
          </div>
          )}

          {/* Task List Section */}
          <div className="w-full">
            <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-4 sm:p-5 min-h-[400px]">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold">{isTasksPage ? 'Task list' : 'Your Tasks'}</h2>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(f => (
                      <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={clsx(
                          "px-3.5 py-1.5 text-sm font-semibold rounded-full border transition flex items-center gap-2", 
                          filter === f 
                            ? clsx(
                                f === 'All' && "bg-slate-600 text-white border-slate-800",
                                f === 'Pending' && "bg-amber-500/15 text-amber-200 border-amber-500/30",
                                f === 'In Progress' && "bg-sky-500/15 text-sky-200 border-sky-500/30",
                                f === 'Completed' && "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
                                f === 'Overdue' && "bg-red-500/15 text-red-200 border-red-500/30"
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
                  <div className="relative sm:w-44 shrink-0" ref={sortRef}>
                    <button
                      type="button"
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="w-full flex items-center justify-between bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 outline-none transition-colors"
                    >
                      <span>{sortOrder === 'latest' ? 'Latest First' : 'Oldest First'}</span>
                      <ChevronDown className={clsx("w-4 h-4 transition-transform text-slate-400", isSortOpen && "rotate-180")} />
                    </button>
                    
                    {isSortOpen && (
                      <div className="absolute right-0 left-0 sm:left-auto sm:w-44 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                <div className="space-y-5">
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                </div>
              ) : displayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-500 pt-12 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
                  <p>
                    {user?.role?.toLowerCase() === 'simpleuser'
                      ? "No tasks assigned yet. Please wait for admin approval."
                      : "No tasks found. Tasks created will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayTasks.map(task => {
                    const taskAssigneeId = task.assignedTo?._id?.toString()
                      || (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?.toString?.());
                    const taskAssignee = usersList.find(assignedUser => assignedUser._id === taskAssigneeId) || task.assignedTo;
                    const todayDate = new Date();
                    todayDate.setHours(0,0,0,0);
                    const tomorrowDate = new Date(todayDate);
                    tomorrowDate.setDate(todayDate.getDate() + 1);

                    const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
                    if (dueDateObj) dueDateObj.setHours(0, 0, 0, 0);
                    
                    const diffDays = dueDateObj ? Math.floor((dueDateObj - todayDate) / (1000 * 60 * 60 * 24)) : null;
                    const isOverdue = task.status !== 'Completed' && diffDays !== null && diffDays < 0;
                    const isDueSoon = task.status !== 'Completed' && diffDays !== null && (diffDays === 0 || diffDays === 1);
                    const taskBorderColor = isOverdue
                      ? "border-red-500/40 hover:border-red-400/50"
                      : task.status === "Pending"
                        ? "border-amber-500/40 hover:border-amber-400/50"
                        : task.status === "In Progress"
                          ? "border-cyan-500/40 hover:border-cyan-400/50"
                          : task.status === "Completed"
                            ? "border-emerald-500/40 hover:border-emerald-400/50"
                            : "border-slate-700/50 hover:border-slate-600/70";
                    
                    return (
                    <div 
                      key={task._id} 
                      className={clsx(
                        "rounded-xl p-3 sm:p-4 transition-all duration-200 border shadow-sm shadow-black/20 hover:-translate-y-0.5 hover:shadow-md hover:bg-slate-800/70",
                        editingTask === task._id ? "overflow-visible" : "overflow-hidden",
                        "bg-slate-800/35",
                        taskBorderColor
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
                                      onClick={() => {
                                        const next = !isEditAssignOpen;
                                        setIsEditAssignOpen(next);
                                        if (next) fetchUsers();
                                      }}
                                      className="w-full flex items-center justify-between gap-2 bg-slate-800 border border-slate-500/50 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-200 outline-none"
                                    >
                                      <span className="truncate">
                                        <span className="flex min-w-0 items-center gap-2">
                                          {editAssignedTo && <UserAvatar user={usersList.find(u => u._id === editAssignedTo) || taskAssignee} size="xs" />}
                                          <span className="truncate">{usersList.find(u => u._id === editAssignedTo)?.name || (task.assignedTo?._id === editAssignedTo ? taskAssignee?.name : "Unassigned")}</span>
                                        </span>
                                      </span>
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
                                          {usersList.length === 0 ? (
                                            <div className="px-3 py-2 text-xs text-slate-400 italic text-center">
                                              No members available
                                            </div>
                                          ) : (
                                            usersList.map(u => (
                                              <button
                                                key={u._id}
                                                type="button"
                                                onClick={() => { setEditAssignedTo(u._id); setIsEditAssignOpen(false); }}
                                                className={clsx(
                                                  "flex w-full items-center gap-2 text-left px-3 py-2 text-xs font-semibold transition-colors border-b border-slate-800/50 last:border-0 hover:bg-sky-600 hover:text-white",
                                                  editAssignedTo === u._id ? "bg-slate-800 text-white" : "text-slate-400"
                                                )}
                                              >
                                                <UserAvatar user={u} size="xs" />
                                                <span className="truncate">{u.name}</span>
                                              </button>
                                            ))
                                          )}
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
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                          <div className="flex-overflow-hidden">
                            <h3 className="text-base font-semibold text-white break-words">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-[13px] leading-relaxed mt-0.5 break-words text-slate-300">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={clsx(
                                  "text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
                                  "border",
                                  isOverdue && "bg-red-500/10 text-red-300 border-red-500/20",
                                  !isOverdue && task.status === "Pending" && "bg-amber-500/10 text-amber-300 border-amber-500/20",
                                  !isOverdue && task.status === "In Progress" && "bg-sky-500/10 text-sky-300 border-sky-500/20",
                                  task.status === "Completed" && "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                )}>
                                  {isOverdue ? "Overdue" : task.status}
                                </span>
                                {task.assignedTo && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border shrink-0 bg-slate-800 text-slate-100 border-slate-700">
                                    <UserAvatar user={taskAssignee} size="xs" />
                                    {taskAssignee?.name || task.assignedTo.name}
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
                              <div className="mt-3 pt-2.5 border-t border-slate-800/50">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                  <Clock className="w-3 h-3" /> Recent Activity
                                </div>
                                <div className="space-y-1">
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
                  )})}
                  
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
          
        </div>}
        </>
        )}
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
