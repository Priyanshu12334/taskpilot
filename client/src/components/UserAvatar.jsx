import React, { useEffect, useState } from 'react';

const avatarSizes = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
};

export default function UserAvatar({ user, size = 'sm' }) {
  const photoUrl = user?.profilePhotoUrl || '';
  const [failedPhotoUrl, setFailedPhotoUrl] = useState('');
  const role = user?.role?.toLowerCase();
  const borderColor = role === 'admin'
    ? 'border-emerald-500/70'
    : role === 'member'
      ? 'border-cyan-500/70'
      : 'border-slate-600/70';

  useEffect(() => {
    setFailedPhotoUrl('');
  }, [photoUrl]);

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border ${borderColor} bg-slate-700 font-semibold text-slate-200 ${avatarSizes[size] || avatarSizes.sm}`}
    >
      {photoUrl && failedPhotoUrl !== photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailedPhotoUrl(photoUrl)}
        />
      ) : initial}
    </span>
  );
}
