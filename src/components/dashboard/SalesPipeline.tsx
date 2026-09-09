'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Filter, ArrowRight } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { formatCurrency } from '@/lib/utils';
import { DealStage } from '@/types/crm';

const PIPELINE_ORDER: { id: string; name: DealStage }[] = [
  { id: 'stage-1', name: 'Mới' },
  { id: 'stage-2', name: 'Đã liên hệ' },
  { id: 'stage-3', name: 'Đề xuất' },
  { id: 'stage-4', name: 'Đàm phán' },
  { id: 'stage-5', name: 'Thắng' },
];

export function SalesPipeline() {
  const { deals } = useCRM();

  const { stages, totalPipelineValue } = useMemo(() => {
    // Total value of non-lost deals in pipeline
    const activeDeals = deals.filter((d) => d.stage !== 'Thua');
    const totalVal = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    const calculatedStages = PIPELINE_ORDER.map((item) => {
      const stageDeals = deals.filter((d) => d.stage === item.name);
      const stageVal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const percent = totalVal > 0 ? Math.min(100, Math.round((stageVal / totalVal) * 100)) : 0;

      return {
        id: item.id,
        name: item.name,
        count: stageDeals.length,
        totalValue: stageVal,
        percent,
      };
    });

    return { stages: calculatedStages, totalPipelineValue: totalVal };
  }, [deals]);

  return (
    <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="text-[#1765FF]">
            <Filter className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-base font-semibold text-[#101828]">
            Pipeline bán hàng
          </h2>
        </div>
        <Link
          href="/deals"
          className="text-xs font-medium text-[#1765FF] hover:text-[#1254DB] flex items-center gap-1 group transition-colors"
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Stages List */}
      <div className="space-y-5 flex-1 flex flex-col justify-around">
        {stages.map((stage) => {
          return (
            <div key={stage.id} className="flex items-center gap-3 text-xs sm:text-sm">
              {/* Stage Name */}
              <span className="w-20 sm:w-24 text-[#344054] font-medium shrink-0">
                {stage.name}
              </span>

              {/* Progress Bar */}
              <div className="flex-1 bg-[#EEF4FF] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1765FF] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stage.percent}%` }}
                />
              </div>

              {/* Count */}
              <span className="w-7 sm:w-8 text-right font-medium text-[#101828] shrink-0">
                {stage.count}
              </span>

              {/* Total Value */}
              <span className="w-16 sm:w-20 text-right font-medium text-[#101828] shrink-0">
                {formatCurrency(stage.totalValue, true)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary footer note */}
      <div className="mt-6 pt-4 border-t border-[#F2F4F7] flex items-center justify-between text-xs text-[#667085]">
        <span>Tổng giá trị pipeline</span>
        <span className="font-semibold text-[#101828] text-sm">
          {formatCurrency(totalPipelineValue, true)}
        </span>
      </div>
    </div>
  );
}
