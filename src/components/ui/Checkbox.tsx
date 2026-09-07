import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, label, disabled, id, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label className={cn('inline-flex items-center gap-2.5 select-none cursor-pointer', disabled && 'cursor-not-allowed opacity-50')}>
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-[4px] border border-[#D0D5DD] transition-all duration-150 flex items-center justify-center bg-white',
              'peer-checked:bg-[#1765FF] peer-checked:border-[#1765FF]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#1765FF]/30',
              'peer-hover:border-[#1765FF]',
              className
            )}
          >
            {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
          </div>
        </div>
        {label && <span className="text-sm text-[#344054]">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
