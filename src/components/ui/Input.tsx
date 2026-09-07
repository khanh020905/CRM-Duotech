import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#344054]">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#667085] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3.5 text-sm bg-white border rounded-[8px] text-[#101828] placeholder:text-[#98A2B3] transition-all duration-150',
              'focus:outline-none focus:border-[#1765FF] focus:ring-3 focus:ring-[#1765FF]/15',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[#D0D5DD] hover:border-[#98A2B3]',
              props.disabled && 'bg-[#F2F4F7] text-[#98A2B3] cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#667085] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#667085]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
