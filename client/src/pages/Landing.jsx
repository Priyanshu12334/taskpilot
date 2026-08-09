import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
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
        <main className="relative z-10 flex flex-col items-center justify-center pt-14 sm:pt-24 px-4 sm:px-6 text-center pb-14 sm:pb-24">          
          <h1 className="text-[24px] xs:text-[26px] sm:text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-[1.1] mb-6 text-center">
            Manage Tasks with Full <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">
              Control
            </span>{' '}
            &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">
              Team Visibility
            </span>
          </h1>
          
          <p className="text-sm sm:text-xl text-slate-400 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
            Create tasks, assign them to your team, track progress, set due dates, and monitor every action with real-time updates and activity logs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-1 drop-shadow-xl">
            <Link to="/register" className="w-[160px] h-[50px] sm:w-auto sm:h-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-4 py-3 sm:px-10 sm:py-5 rounded-full transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 text-sm sm:text-lg shrink-0">
              Get Started
              <ArrowRight className="w-4 h-4 opacity-80" />
            </Link>
          </div>
        </main>

        {/* Frequently Asked Questions Section */}
        <section className="relative z-10 py-16 px-4 sm:px-12 border-t border-slate-700/60 bg-slate-900/60 backdrop-blur-md rounded-3xl mb-16 mx-4 sm:mx-8 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
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
