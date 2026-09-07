import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1765FF]/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variantStyles = {
      primary: 'bg-[#1765FF] text-white hover:bg-[#1254DB] shadow-sm hover:shadow active:bg-[#0E46BC]',
      secondary: 'bg-[#F6F8FC] text-[#101828] hover:bg-[#EEF2F6] border border-[#E6EBF2]',
      outline: 'bg-white text-[#101828] hover:bg-[#F8FAFC] border border-[#E6EBF2] shadow-2xs hover:border-[#CBD5E1]',
      ghost: 'bg-transparent text-[#667085] hover:text-[#101828] hover:bg-[#F1F5F9]',
      danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm',
    };

    const sizeStyles = {
      sm: 'text-xs h-8 px-3 rounded-[6px] gap-1.5',
      md: 'text-sm h-9 px-4 rounded-[8px] gap-2',
      lg: 'text-base h-11 px-5 rounded-[8px] gap-2.5',
      icon: 'h-9 w-9 rounded-[8px] p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
