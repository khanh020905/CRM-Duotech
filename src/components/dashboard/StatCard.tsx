'use client';

import React from 'react';
import { BarChart3, Users, Filter, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { KPICardData } from '@/types/crm';
import { cn } from '@/lib/utils';

export function StatCard({ data }: { data: KPICardData }) {
  const getIconConfig = () => {
    switch (data.type) {
      case 'revenue':
        return {
          icon: BarChart3,
          bg: 'bg-[#ECFDF5]',
          color: 'text-[#059669]',
        };
      case 'customers':
        return {
          icon: Users,
          bg: 'bg-[#EFF6FF]',
          color: 'text-[#1765FF]',
        };
      case 'deals':
        return {
          icon: Filter,
          bg: 'bg-[#F5F3FF]',
          color: 'text-[#7C3AED]',
        };
      case 'conversion':
        return {
          icon: Percent,
          bg: 'bg-[#FFFBEB]',
          color: 'text-[#D97706]',
        };
    }
  };

  const config = getIconConfig();
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-start gap-3.5">
        {/* Pastel Icon Square */}
        <div
          className={cn(
            'w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0',
            config.bg,
            config.color
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className="block text-xs font-medium text-[#667085] mb-1">
            {data.title}
          </span>
          <div className="text-2xl sm:text-[26px] font-bold text-[#101828] tracking-tight leading-tight">
            {data.value}
          </div>

          {/* Trend Badge */}
          <div className="mt-2.5 flex items-center">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                data.isPositive
                  ? 'bg-[#ECFDF5] text-[#059669]'
                  : 'bg-[#FEF2F2] text-[#DC2626]'
              )}
            >
              {data.isPositive ? (
                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ArrowDown className="w-3 h-3 stroke-[2.5]" />
              )}
              {data.change}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
