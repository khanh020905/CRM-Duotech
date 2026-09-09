'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { cn } from '@/lib/utils';
import { RevenuePoint } from '@/types/crm';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string; fullAmount?: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white border border-[#E6EBF2] shadow-xl rounded-xl p-3 text-xs z-50">
        <p className="text-[#667085] font-medium mb-1">{data.payload.label}</p>
        <p className="text-[#1765FF] font-bold text-sm">
          {data.value} triệu VNĐ
        </p>
        {data.payload.fullAmount !== undefined && (
          <p className="text-[11px] text-[#98A2B3] mt-0.5">
            {data.payload.fullAmount.toLocaleString('vi-VN')} đ
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function RevenueChart() {
  const { chartPeriod, setChartPeriod, contracts } = useCRM();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute revenue dynamically from real contracts
  const currentData: RevenuePoint[] = useMemo(() => {
    if (chartPeriod === 'quarter') {
      const quarters = [
        { label: 'Q1', value: 0, fullAmount: 0 },
        { label: 'Q2', value: 0, fullAmount: 0 },
        { label: 'Q3', value: 0, fullAmount: 0 },
        { label: 'Q4', value: 0, fullAmount: 0 },
      ];

      contracts.forEach((c) => {
        const val = c.paidAmount || c.value || 0;
        let month = 1;
        if (c.signDate) {
          if (c.signDate.includes('-')) {
            month = parseInt(c.signDate.split('-')[1], 10) || 1;
          } else if (c.signDate.includes('/')) {
            month = parseInt(c.signDate.split('/')[1], 10) || 1;
          }
        }
        const qIndex = Math.min(3, Math.floor((month - 1) / 3));
        quarters[qIndex].fullAmount += val;
      });

      return quarters.map((q) => ({
        ...q,
        value: Math.round(q.fullAmount / 1_000_000),
      }));
    }

    if (chartPeriod === 'year') {
      const yearsMap: Record<string, number> = { '2024': 0, '2025': 0, '2026': 0 };
      contracts.forEach((c) => {
        const val = c.paidAmount || c.value || 0;
        let yr = '2026';
        if (c.signDate) {
          if (c.signDate.includes('-')) {
            yr = c.signDate.split('-')[0] || '2026';
          } else if (c.signDate.includes('/')) {
            yr = c.signDate.split('/')[2] || '2026';
          }
        }
        if (!yearsMap[yr]) yearsMap[yr] = 0;
        yearsMap[yr] += val;
      });

      return Object.entries(yearsMap).map(([yr, fullAmount]) => ({
        label: yr,
        value: Math.round(fullAmount / 1_000_000),
        fullAmount,
      }));
    }

    // Default: month view
    const months = Array.from({ length: 12 }, (_, i) => ({
      label: `T${i + 1}`,
      value: 0,
      fullAmount: 0,
    }));

    contracts.forEach((c) => {
      const val = c.paidAmount || c.value || 0;
      let month = 1;
      if (c.signDate) {
        if (c.signDate.includes('-')) {
          month = parseInt(c.signDate.split('-')[1], 10) || 1;
        } else if (c.signDate.includes('/')) {
          month = parseInt(c.signDate.split('/')[1], 10) || 1;
        }
      }
      const idx = Math.max(0, Math.min(11, month - 1));
      months[idx].fullAmount += val;
    });

    return months.map((m) => ({
      ...m,
      value: Math.round(m.fullAmount / 1_000_000),
    }));
  }, [contracts, chartPeriod]);

  const hasData = contracts.length > 0;

  return (
    <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="text-[#1765FF]">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#101828]">
              Doanh thu theo thời gian
            </h2>
            <p className="text-xs text-[#667085]">Tổng hợp từ hợp đồng thực tế</p>
          </div>
        </div>

        {/* Period Selector Tabs - Segmented Control */}
        <div className="inline-flex p-1 bg-[#F1F4F9] rounded-lg border border-[#E6EBF2] self-start sm:self-auto">
          {(['month', 'quarter', 'year'] as const).map((period) => {
            const labels = {
              month: 'Tháng',
              quarter: 'Quý',
              year: 'Năm',
            };
            const isActive = chartPeriod === period;
            return (
              <button
                key={period}
                type="button"
                onClick={() => setChartPeriod(period)}
                className={cn(
                  'px-3 py-1 rounded-[6px] text-xs font-medium transition-all select-none cursor-pointer',
                  isActive
                    ? 'bg-white text-[#101828] shadow-xs font-semibold'
                    : 'text-[#667085] hover:text-[#101828]'
                )}
              >
                {labels[period]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-64 sm:h-72 mt-2 relative">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1765FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1765FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#667085', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#667085', fontSize: 11 }}
                unit=" tr"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1765FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}

        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-lg pointer-events-none">
            <BarChart2 className="w-8 h-8 text-[#98A2B3] mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-[#475467]">Chưa có dữ liệu hợp đồng</p>
            <p className="text-[11px] text-[#98A2B3]">Thêm hợp đồng mới để bắt đầu theo dõi doanh thu</p>
          </div>
        )}
      </div>
    </div>
  );
}
