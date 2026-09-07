'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}: ModalProps) {
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={cn(
          'relative w-full bg-white rounded-[16px] shadow-2xl border border-[#E6EBF2] p-6 text-left transition-all z-10 animate-fade-in my-8 max-h-[90vh] flex flex-col',
          maxWidthClasses[maxWidth]
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between pb-4 border-b border-[#F2F4F7] mb-5">
            <div>
              {title && <h3 className="text-lg font-semibold text-[#101828]">{title}</h3>}
              {description && <p className="text-xs text-[#667085] mt-1">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-[#98A2B3] hover:text-[#344054] hover:bg-[#F2F4F7] p-1.5 rounded-lg transition-colors -mr-1.5 -mt-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
}
