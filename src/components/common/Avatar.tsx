import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackBg?: string;
}

export function Avatar({
  src,
  name,
  className,
  size = 'md',
  fallbackBg = 'bg-[#EFF6FF] text-[#1765FF]',
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const getInitials = (text: string) => {
    if (!text) return 'N';
    const words = text.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-medium',
    xl: 'w-12 h-12 text-base font-semibold',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden font-medium select-none',
        sizeClasses[size],
        fallbackBg,
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
