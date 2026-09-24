import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ShieldCheck, Users, Clock, Sparkles, Check, ArrowDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Landing() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  // Hide browser scrollbar on landing page while keeping vertical scrolling functional
  useEffect(() => {
    document.documentElement.classList.add('no-scrollbar');
    document.body.classList.add('no-scrollbar');
    return () => {
      document.documentElement.classList.remove('no-scrollbar');
      document.body.classList.remove('no-scrollbar');
    };
  }, []);

  // Seamlessly redirect to application if they possess existing local storage session
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const landingFaqs = [
    {
      q: "What is TaskPilot?",
      a: "TaskPilot is a task management and team collaboration platform designed to help teams organize and track their work. Admins can create, assign, and manage tasks, while Members can view and update their assigned tasks."
    },
    {
      q: "How do I get access to TaskPilot?",
      a: "New users can sign up and wait for an Admin to approve their account before receiving Member access."
    },
    {
      q: "Who can create and assign tasks?",
      a: "Admins can create tasks and assign them to team members. Members can view and manage the tasks assigned to them according to their permissions."
    },
    {
      q: "Can team members communicate with each other?",
      a: "Yes. TaskPilot includes Team Chat for real-time communication between team members."
    },
    {
      q: "How do task notifications work?",
      a: "Members receive notifications when tasks are assigned to them and for other important task-related activities."
    },
    {
      q: "Can I set a due date for a task?",
      a: "Yes. Admins can set due dates while creating or managing tasks so team members can track deadlines."
    },
    {
      q: "Can I track task progress?",
      a: "Yes. TaskPilot provides task statuses such as Pending, In Progress, Completed, and Overdue to help teams monitor progress."
    },
    {
      q: "What happens if my account is still pending?",
      a: "Your account needs Admin approval before you can access Member features. You can contact support if you need assistance."
    },
    {
      q: "Can I contact support if I face an issue?",
      a: "Yes. Use the Contact Us / Support section to submit your query, technical issue, or feedback."
    },
    {
      q: "Is TaskPilot suitable for teams?",
      a: "Yes. TaskPilot is designed to help teams manage tasks, assignments, deadlines, communication, and overall productivity from one platform."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white relative font-sans flex flex-col justify-between no-scrollbar overflow-x-hidden">

      {/* Subtle Green Ambient Glows - Top-Left & Bottom-Right */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />

      {/* Navbar Grid Layout */}
      <div className="max-w-7xl mx-auto w-full">
        <nav className="relative z-10 px-4 sm:px-12 py-4 sm:py-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-1">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-700 rounded-3xl flex items-center justify-center shadow-lg shadow-black/50 border border-slate-700/50">
              <span className="text-[14px] font-black tracking-widest text-white">TP</span>
            </div>
            <h2 className="text-xl sm:text-2xl tracking-tight">Task<span className="font-bold text-emerald-500">Pilot</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all shadow-md hover:shadow-emerald-500/25">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Minimal High Conversion Hero Section */}
        <main className="relative z-10 flex flex-col items-center justify-center pt-14 sm:pt-20 px-4 sm:px-6 text-center pb-8 sm:pb-12">          
          <h1 className="text-[28px] sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-[1.1] mb-6 text-center">
            Manage Tasks with Full <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">
              Control
            </span>{' '}
            &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">
              Team Visibility
            </span>
          </h1>
          
          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
            Create tasks, assign them to your team, track progress, set due dates, and monitor every action with real-time updates and activity logs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-1 drop-shadow-xl">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all shadow-md hover:shadow-emerald-700 active:scale-95 text-xs sm:text-base shrink-0">
              Get Started
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
            </Link>
          </div>
        </main>

        {/* How TaskPilot Works Section - Vertical Zig-Zag SaaS Layout */}
        <section className="relative z-10 pt-4 sm:pt-6 pb-16 sm:pb-24 px-4 sm:px-8 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 backdrop-blur-sm shadow-sm">
              <span>Role-Based Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              How Task<span className="text-emerald-500">Pilot</span> Works
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Learn how TaskPilot streamlines task assignment, execution, and account approvals across your team.
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12 max-w-5xl mx-auto px-0 sm:px-4 lg:px-8">

            {/* 1. ADMIN (Green Accent) - Image on Left, Content on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Image Container (Left) */}
              <div className="lg:col-span-5 relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent rounded-2xl blur-xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 sm:p-2.5 bg-slate-800/40 border border-slate-700/70 hover:border-emerald-500/40 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300">
                  <div className="relative overflow-hidden rounded-xl h-[200px] sm:h-[250px] lg:h-[280px] bg-slate-900">
                    <img
                      src="/images/how-admin.jpg"
                      alt="Admin directing strategic operations and monitoring team"
                      className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Content (Right) */}
              <div className="lg:col-span-7 flex flex-col justify-center lg:pl-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-2.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>ADMIN ROLE</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 tracking-tight leading-snug">
                  Approve users, create and assign tasks, monitor the team
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Administrators have full visibility over the workspace. Review registrations, assign tasks with due dates, and monitor team performance with live activity tracking.
                </p>
                <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">User Approvals:</strong> Review pending registrations and grant Member or Admin privileges.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Task Assignment:</strong> Create tasks with AI assistance, set priorities, and assign directly to members.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Team Monitoring:</strong> Track real-time progress, overdue tasks, and complete activity history logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Connector: Admin → Member */}
            <div className="flex flex-col items-center justify-center py-2 select-none">
              <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-emerald-500/60 via-slate-600 to-sky-500/60" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase bg-slate-800/90 border border-slate-700/80 text-slate-300 my-1 shadow-lg backdrop-blur-md">
                <ArrowDown className="w-3 h-3 text-emerald-400" />
                <span>Task Assignment &amp; Execution</span>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-sky-500/60 to-sky-500/20" />
            </div>

            {/* 2. MEMBER (Blue Accent) - Content on Left, Image on Right (Mobile: Image on Top) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Content (Left on desktop, Bottom on mobile) */}
              <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center lg:pr-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit mb-2.5">
                  <Users className="w-3 h-3" />
                  <span>MEMBER ROLE</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 tracking-tight leading-snug">
                  View assigned tasks, update progress, complete tasks and collaborate
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Members enjoy a focused workspace to view tasks assigned to them, update statuses in real time, and collaborate seamlessly with team chat.
                </p>
                <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Assigned Tasks:</strong> Access your personal task queue with clear deadlines and priority labels.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Status Updates:</strong> Move tasks smoothly from Pending to In Progress and Completed with live sync.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Team Chat:</strong> Exchange instant messages with colleagues to coordinate and resolve blockers quickly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Container (Right on desktop, Top on mobile) */}
              <div className="order-1 lg:order-2 lg:col-span-5 relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-sky-500/10 to-sky-500/15 rounded-2xl blur-xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 sm:p-2.5 bg-slate-800/40 border border-slate-700/70 hover:border-sky-500/40 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300">
                  <div className="relative overflow-hidden rounded-xl h-[200px] sm:h-[250px] lg:h-[280px] bg-slate-900">
                    <img
                      src="/images/how-member.jpg"
                      alt="Team members collaborating and completing tasks together"
                      className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Connector: Member → Pending User */}
            <div className="flex flex-col items-center justify-center py-2 select-none">
              <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-sky-500/60 via-slate-600 to-amber-500/60" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase bg-slate-800/90 border border-slate-700/80 text-slate-300 my-1 shadow-lg backdrop-blur-md">
                <ArrowDown className="w-3 h-3 text-sky-400" />
                <span>Onboarding &amp; Approval</span>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-amber-500/60 to-amber-500/20" />
            </div>

            {/* 3. PENDING USER (Orange Accent) - Image on Left, Content on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Image Container (Left) */}
              <div className="lg:col-span-5 relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-transparent rounded-2xl blur-xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 sm:p-2.5 bg-slate-800/40 border border-slate-700/70 hover:border-amber-500/40 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300">
                  <div className="relative overflow-hidden rounded-xl h-[200px] sm:h-[250px] lg:h-[280px] bg-slate-900">
                    <img
                      src="/images/how-pending.jpg"
                      alt="New professional registering and awaiting admin approval"
                      className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Content (Right) */}
              <div className="lg:col-span-7 flex flex-col justify-center lg:pl-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-2.5">
                  <Clock className="w-3 h-3" />
                  <span>PENDING USER ROLE</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 tracking-tight leading-snug">
                  Register, wait for admin approval, then access TaskPilot
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  New users can sign up in seconds. Accounts are safely held in a review queue until an administrator approves access to the team workspace.
                </p>
                <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Quick Sign-Up:</strong> Register securely with your name, email, and password in moments.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Admin Review:</strong> Your account waits securely in the pending queue awaiting administrator review.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">Instant Access:</strong> Once approved, full Member or Admin permissions are activated automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        <section className="relative z-10 py-16 px-4 sm:px-12 border-t border-slate-700/60 bg-slate-900/60 backdrop-blur-md rounded-3xl mb-16 mx-4 sm:mx-8 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-500 tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-medium">
                Everything you need to know about TaskPilot and how it helps your team.
              </p>
            </div>

            <div className="space-y-3">
              {landingFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-700/60 rounded-2xl overflow-hidden bg-slate-800/40 backdrop-blur-sm transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-200 hover:text-white text-sm sm:text-base transition-colors"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <ChevronDown
                        className={clsx(
                          'w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200',
                          isOpen && 'rotate-180 text-emerald-400'
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 text-sm text-slate-300 font-medium leading-relaxed border-t border-slate-700/40 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-slate-800/80 text-center text-slate-400 text-xs font-medium bg-slate-900/90 backdrop-blur-md w-full overflow-hidden">
        <p>© {new Date().getFullYear()} TaskPilot. All rights reserved.</p>
      </footer>
    </div>
  );
}
