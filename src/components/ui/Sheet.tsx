'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
  side?: 'right' | 'left';
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'lg',
  side = 'right',
}: SheetProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full',
          side === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'
        )}
      >
        <div
          className={cn(
            'w-screen bg-white shadow-2xl flex flex-col h-full animate-slide-right border-l border-[#E6EBF2]',
            widthClasses[width]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EBF2] bg-[#FAFAFC]">
            <div>
              {title && <h2 className="text-lg font-semibold text-[#101828]">{title}</h2>}
              {description && <p className="text-xs text-[#667085] mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#98A2B3] hover:text-[#344054] hover:bg-[#F2F4F7] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
