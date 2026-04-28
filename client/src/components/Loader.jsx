import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 absolute inset-0 z-50">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-slate-300 font-medium animate-pulse">{message}</p>
    </div>
  );
}
