'use client';

import React from 'react';
import { FileText, Coins, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ContractsSummaryProps {
  totalCount: number;
  totalValue: number;
  totalMonthlyMaintain: number;
}

export function ContractsSummary({
  totalCount,
  totalValue,
  totalMonthlyMaintain,
}: ContractsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. Tổng hợp đồng */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2] shadow-2xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#1765FF] shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-medium text-[#667085] block mb-1">
            Tổng hợp đồng
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
            {totalCount}
          </span>
        </div>
      </div>

      {/* 2. Tổng giá trị */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2] shadow-2xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#1765FF] shrink-0">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-medium text-[#667085] block mb-1">
            Tổng giá trị
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
            {formatCurrency(totalValue, true)}
          </span>
        </div>
      </div>

      {/* 3. Phí duy trì / tháng */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2] shadow-2xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#1765FF] shrink-0">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-medium text-[#667085] block mb-1">
            Phí duy trì / tháng
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
            {formatCurrency(totalMonthlyMaintain, true)}
          </span>
        </div>
      </div>
    </div>
  );
}
