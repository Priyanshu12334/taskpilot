import React from 'react';
import { CheckCircle2, Circle, Timer } from 'lucide-react';

// Uses the dashboard's existing GET /api/tasks stats so the summary stays in
// sync with the task list and existing refresh flow.
const TaskProgressBar = ({ stats, loading }) => {
  const total = Number.isFinite(stats?.total) ? stats.total : 0;
  const completed = Number.isFinite(stats?.completed) ? stats.completed : 0;
  const inProgress = Number.isFinite(stats?.inProgress) ? stats.inProgress : 0;
  const pending = Number.isFinite(stats?.pending) ? stats.pending : 0;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const rows = [
    { label: 'Completed', count: completed, Icon: CheckCircle2, color: 'text-emerald-400', stroke: '#059669', iconBg: 'bg-emerald-500/10' },
    { label: 'In Progress', count: inProgress, Icon: Timer, color: 'text-sky-400', stroke: '#38bdf8', iconBg: 'bg-sky-500/10' },
    { label: 'Pending', count: pending, Icon: Circle, color: 'text-amber-400', stroke: '#fbbf24', iconBg: 'bg-amber-500/10' },
  ];

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = rows.map(row => {
    const length = total > 0 ? (row.count / total) * circumference : 0;
    const segment = { ...row, length, offset };
    offset += length;
    return segment;
  });

  return (
    <section className="h-full bg-slate-900 border border-slate-700/50 rounded-2xl p-3.5 sm:p-4 shadow-lg">
      <h2 className="text-sm font-bold text-white tracking-tight mb-2.5">Overall Progress</h2>
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative w-[112px] h-[112px] shrink-0"
          role="img"
          aria-label={`${completionPercentage}% completed`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-slate-800" />
            {!loading && segments.map(({ label, stroke, length, offset: segmentOffset }) => length > 0 && (
              <circle
                key={label}
                cx="50" cy="50" r={radius} fill="none" stroke={stroke} strokeWidth="9"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-segmentOffset}
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {loading ? (
              <span className="w-12 h-6 rounded bg-slate-700/70 animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-black leading-none text-white tabular-nums">{completionPercentage}%</span>
                <span className="text-[10px] font-medium text-slate-400 mt-1">Completed</span>
              </>
            )}
          </div>
        </div>

        <div className="w-full min-w-0">
          <h3 className="text-xs font-semibold text-slate-400 mb-1.5">Task Summary</h3>
          <div className="space-y-1">
            {segments.map(({ label, count, Icon, color, iconBg }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-700/40 bg-slate-800/35 px-2 py-1">
                <span className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-3 h-3 ${color}`} aria-hidden="true" />
                </span>
                <span className="flex-1 text-xs font-medium text-slate-300">{label}</span>
                <span className="w-8 text-right text-xs font-semibold text-slate-400 tabular-nums">{loading ? '—' : count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskProgressBar;
