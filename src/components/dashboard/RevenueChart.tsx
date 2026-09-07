'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import {
  REVENUE_DATA_MONTHS,
  REVENUE_DATA_QUARTERS,
  REVENUE_DATA_YEARS,
} from '@/data/mockData';
import { cn } from '@/lib/utils';

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
        {data.payload.fullAmount && (
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
  const { chartPeriod, setChartPeriod } = useCRM();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getData = () => {
    switch (chartPeriod) {
      case 'quarter':
        return REVENUE_DATA_QUARTERS;
      case 'year':
        return REVENUE_DATA_YEARS;
      case 'month':
      default:
        return REVENUE_DATA_MONTHS;
    }
  };

  const currentData = getData();

  return (
    <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="text-[#1765FF]">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-base font-semibold text-[#101828]">
            Doanh thu theo thời gian
          </h2>
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
                  'px-3 py-1 rounded-[6px] text-xs font-medium transition-all select-none',
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
      <div className="w-full h-64 sm:h-72 mt-2">
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

              <CartesianGrid
                strokeDasharray="0 0"
                vertical={false}
                stroke="#F1F4F9"
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#667085', fontSize: 11 }}
                dy={10}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#667085', fontSize: 11 }}
                tickFormatter={(val) => `${val}${chartPeriod === 'year' ? ' tỷ' : ' triệu'}`}
                dx={-5}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#1765FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                dot={{
                  r: 4,
                  fill: '#1765FF',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#1765FF',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] rounded-lg">
            <span className="text-xs text-[#98A2B3]">Đang tải biểu đồ...</span>
          </div>
        )}
      </div>
    </div>
  );
}
