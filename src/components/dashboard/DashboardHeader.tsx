'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCRM } from '@/context/CRMContext';
import { TimeRangeFilter } from '@/types/crm';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  onAddCustomer?: () => void;
}

export function DashboardHeader({ onAddCustomer }: DashboardHeaderProps) {
  const { timeRange, setTimeRange } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeOptions: { value: TimeRangeFilter; label: string }[] = [
    { value: '2026-09', label: 'Tháng 9, 2026' },
    { value: '2026-08', label: 'Tháng 8, 2026' },
    { value: 'Q3-2026', label: 'Quý 3, 2026' },
    { value: '2026', label: 'Cả năm 2026' },
  ];

  const currentLabel =
    timeOptions.find((opt) => opt.value === timeRange)?.label || 'Tháng 9, 2026';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-[30px] font-bold text-[#101828] tracking-tight leading-tight">
          Tổng quan
        </h1>
        <p className="text-sm text-[#667085] mt-1 font-normal">
          Theo dõi khách hàng và cơ hội kinh doanh của bạn.
        </p>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Time Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-10 px-3.5 bg-white border border-[#E6EBF2] hover:bg-[#F8FAFC] rounded-lg flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#344054] shadow-2xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#667085]" />
            <span>{currentLabel}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-[#98A2B3] transition-transform duration-200',
                isOpen && 'rotate-180 text-[#1765FF]'
              )}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#E6EBF2] rounded-xl shadow-xl py-1.5 z-30 animate-fade-in">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider">
                Khoảng thời gian
              </div>
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTimeRange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-[#F8FAFC] text-[#344054] transition-colors"
                >
                  <span className={cn(option.value === timeRange && 'font-semibold text-[#1765FF]')}>
                    {option.label}
                  </span>
                  {option.value === timeRange && (
                    <Check className="w-4 h-4 text-[#1765FF] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary CTA Button */}
        <Button
          onClick={() => onAddCustomer && onAddCustomer()}
          className="h-10 px-4 bg-[#1765FF] hover:bg-[#1254DB] text-white font-medium rounded-lg flex items-center gap-2 shadow-sm shadow-blue-500/20 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm khách hàng</span>
        </Button>
      </div>
    </div>
  );
}
