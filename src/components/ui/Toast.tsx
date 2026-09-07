'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toast() {
  const { toast, dismissToast } = useCRM();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-lg shadow-emerald-500/5',
    error: 'border-red-200 bg-white shadow-lg shadow-red-500/5',
    warning: 'border-amber-200 bg-white shadow-lg shadow-amber-500/5',
    info: 'border-blue-200 bg-white shadow-lg shadow-blue-500/5',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border bg-white shadow-xl transition-all',
          borders[toast.type]
        )}
      >
        {icons[toast.type]}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-[#101828]">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-[#667085] mt-1 leading-relaxed">{toast.description}</p>
          )}
        </div>
        <button
          onClick={dismissToast}
          className="text-[#98A2B3] hover:text-[#344054] p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
