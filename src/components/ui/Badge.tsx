import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'subtle-blue';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}: BadgeProps) {
  const variantStyles = {
    // Exact colors from design
    'subtle-blue': 'bg-[#EFF6FF] text-[#1765FF] border border-[#BFDBFE]/40',
    primary: 'bg-[#1765FF] text-white',
    success: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/40',
    warning: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]/50',
    danger: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/50',
    neutral: 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 leading-none tracking-tight transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
