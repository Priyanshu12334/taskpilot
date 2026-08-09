/**
 * TaskPilot Global Role Color System
 * PENDING USER: Yellow / Amber
 * MEMBER: Blue / Cyan (Sky)
 * ADMIN: Green (Emerald)
 */

export const getRoleDetails = (role) => {
  const r = (role || '').toLowerCase();

  if (r === 'admin') {
    return {
      key: 'admin',
      label: 'ADMIN',
      displayLabel: 'Admin',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      pillClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      textClass: 'text-emerald-400',
      avatarClass: 'bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/20',
      sidebarAvatarClass: 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/30',
      summaryCardClass: 'bg-emerald-500/10 border border-emerald-500/20 hover:shadow-black/20',
      summaryTextClass: 'text-emerald-400'
    };
  }

  if (r === 'member') {
    return {
      key: 'member',
      label: 'MEMBER',
      displayLabel: 'Member',
      badgeClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      pillClass: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
      textClass: 'text-sky-400',
      avatarClass: 'bg-sky-500/10 text-sky-400 border-2 border-sky-500/20',
      sidebarAvatarClass: 'bg-sky-500/20 text-sky-300 border-2 border-sky-500/30',
      summaryCardClass: 'bg-sky-500/10 border border-sky-500/20 hover:shadow-black/20',
      summaryTextClass: 'text-sky-400'
    };
  }

  // Pending user (simpleuser, pending, or default)
  return {
    key: 'pending',
    label: 'PENDING',
    displayLabel: 'Pending User',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    pillClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    textClass: 'text-amber-400',
    avatarClass: 'bg-amber-500/10 text-amber-400 border-2 border-amber-500/20',
    sidebarAvatarClass: 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/30',
    summaryCardClass: 'bg-amber-500/10 border border-amber-500/20 hover:shadow-black/20',
    summaryTextClass: 'text-amber-400'
  };
};
