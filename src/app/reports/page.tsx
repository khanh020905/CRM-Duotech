'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/common/Avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  REPORT_REVENUE_VS_TARGET,
  REPORT_CUSTOMER_SOURCES,
  REPORT_TEAM_PERFORMANCE,
  REPORT_CONVERSION_FUNNEL,
} from '@/data/mockData';
import {
  Coins,
  BarChart3,
  Target,
  Clock,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function ReportsPage() {
  const { showToast } = useCRM();
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'conversion' | 'team'>('overview');

  // Export report data to CSV
  const handleExportReport = () => {
    const csvContent =
      '\uFEFF' +
      [
        'BÁO CÁO KINH DOANH DUOTECH CRM - THÁNG 9/2026',
        '',
        '1. CHỈ SỐ TỔNG QUAN',
        'Chỉ số,Giá trị,Biến động so với tháng trước',
        'Doanh thu chốt thắng,328.5 triệu,+12.8%',
        'Số deal đã chốt,42,+10 deal',
        'Tỷ lệ thắng,28%,+3.4%',
        'Chu kỳ bán hàng,18 ngày,-2 ngày',
        '',
        '2. HIỆU SUẤT ĐỘI NGŨ',
        'Nhân viên,Số cơ hội,Đã chốt,Doanh thu (VNĐ),Hoàn thành mục tiêu',
        ...REPORT_TEAM_PERFORMANCE.map(
          (t) => `"${t.member.name}",${t.dealsCount},${t.wonCount},${t.revenue},${t.targetPercent}%`
        ),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DuotechCRM_BaoCao_KinhDoanh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Xuất báo cáo thành công', 'File CSV tổng hợp số liệu đã được tải về', 'success');
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-[#101828] tracking-tight leading-tight">
            Báo cáo kinh doanh
          </h1>
          <p className="text-sm text-[#667085] mt-1 font-normal">
            Đo lường hiệu quả và tối ưu hoạt động bán hàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 px-3.5 bg-white border border-[#E6EBF2] rounded-lg flex items-center gap-2 text-xs font-semibold text-[#344054] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#667085]" />
            <span>Tháng 9, 2026</span>
          </div>

          <Button
            variant="primary"
            onClick={handleExportReport}
            className="gap-2 shadow-sm shadow-blue-500/20 text-xs sm:text-sm h-10"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </Button>
        </div>
      </div>

      {/* Sub-tabs - Matching Image 5 */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'revenue', label: 'Doanh thu' },
          { id: 'conversion', label: 'Chuyển đổi' },
          { id: 'team', label: 'Đội ngũ' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none',
              activeTab === tab.id
                ? 'bg-[#1765FF] text-white shadow-sm'
                : 'bg-white border border-[#E6EBF2] text-[#475467] hover:bg-[#F8FAFC]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4 KPI Cards - Matching Image 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {/* Doanh thu */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] font-medium block">Doanh thu chốt thắng</span>
              <div className="text-2xl sm:text-[26px] font-bold text-[#101828]">328,5 triệu</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#059669]">
                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                <span>+12,8%</span>
                <span className="text-[10px] text-[#98A2B3] font-normal">so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>

        {/* Đã chốt */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] font-medium block">Đã chốt</span>
              <div className="text-2xl sm:text-[26px] font-bold text-[#101828]">42</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#059669]">
                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                <span>+10</span>
                <span className="text-[10px] text-[#98A2B3] font-normal">so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tỷ lệ thắng */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] font-medium block">Tỷ lệ thắng</span>
              <div className="text-2xl sm:text-[26px] font-bold text-[#101828]">28%</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#059669]">
                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                <span>+3,4%</span>
                <span className="text-[10px] text-[#98A2B3] font-normal">so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chu kỳ bán hàng */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] font-medium block">Chu kỳ bán hàng</span>
              <div className="text-2xl sm:text-[26px] font-bold text-[#101828]">18 ngày</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#059669]">
                <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                <span>-2 ngày</span>
                <span className="text-[10px] text-[#98A2B3] font-normal">nhanh hơn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Doanh thu so với mục tiêu (2 cols) vs Nguồn khách hàng (1 col) - Matching Image 5 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Doanh thu so với mục tiêu */}
        <div className="xl:col-span-2 bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base text-[#101828]">Doanh thu so với mục tiêu</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#1765FF]" />
                <span className="text-[#475467] font-medium">Thực tế</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#93C5FD]" />
                <span className="text-[#475467] font-medium">Mục tiêu</span>
              </div>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REPORT_REVENUE_VS_TARGET} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#F1F4F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#667085', fontSize: 11 }}
                  tickFormatter={(val) => `${val} tr`}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} triệu VNĐ`]}
                  contentStyle={{ borderRadius: 8, borderColor: '#E6EBF2', fontSize: 12 }}
                />
                <Bar dataKey="actual" fill="#1765FF" radius={[4, 4, 0, 0]} name="Thực tế" />
                <Bar dataKey="target" fill="#93C5FD" radius={[4, 4, 0, 0]} name="Mục tiêu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nguồn khách hàng */}
        <div className="xl:col-span-1 bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <h3 className="font-bold text-base text-[#101828] mb-2">Nguồn khách hàng</h3>

          <div className="flex items-center justify-center my-2 relative">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={REPORT_CUSTOMER_SOURCES}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {REPORT_CUSTOMER_SOURCES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-[#98A2B3] uppercase font-bold">Tổng</span>
              <span className="text-xl font-bold text-[#101828]">250</span>
              <span className="text-[10px] text-[#667085]">khách hàng</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-[#F2F4F7]">
            {REPORT_CUSTOMER_SOURCES.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[#344054] font-medium">{s.name}</span>
                </div>
                <span className="font-semibold text-[#101828]">
                  {s.count} ({s.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Hiệu suất đội ngũ (2 cols) vs Tỷ lệ chuyển đổi (1 col) - Matching Image 5 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Hiệu suất đội ngũ */}
        <div className="xl:col-span-2 bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs">
          <h3 className="font-bold text-base text-[#101828] mb-4">Hiệu suất đội ngũ</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F2F4F7] text-[11px] font-semibold text-[#667085] uppercase">
                  <th className="py-2.5 px-3">Nhân viên</th>
                  <th className="py-2.5 px-3">Số cơ hội</th>
                  <th className="py-2.5 px-3">Đã chốt</th>
                  <th className="py-2.5 px-3">Doanh thu</th>
                  <th className="py-2.5 px-3">Hoàn thành mục tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {REPORT_TEAM_PERFORMANCE.map((t) => (
                  <tr key={t.member.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={t.member.name} src={t.member.avatarUrl} size="sm" />
                        <span className="font-semibold text-[#101828]">{t.member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-[#344054]">{t.dealsCount}</td>
                    <td className="py-3 px-3 font-semibold text-[#101828]">{t.wonCount}</td>
                    <td className="py-3 px-3 font-bold text-[#101828]">
                      {t.revenue.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 w-32">
                        <span className="font-bold text-[11px] w-8">{t.targetPercent}%</span>
                        <div className="flex-1 bg-[#EEF2F6] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, t.targetPercent)}%`,
                              backgroundColor: t.color,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Funnel Tỷ lệ chuyển đổi */}
        <div className="xl:col-span-1 bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <h3 className="font-bold text-base text-[#101828] mb-3">Tỷ lệ chuyển đổi</h3>

          {/* Funnel Trapezoids / Bars */}
          <div className="space-y-2.5 my-2">
            {REPORT_CONVERSION_FUNNEL.map((step) => (
              <div key={step.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#344054]">{step.stage}</span>
                  <span className="font-bold text-[#101828]">
                    {step.count} ({step.percent}%)
                  </span>
                </div>
                <div className="w-full bg-[#F1F4F9] h-6 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${step.percent}%`,
                      backgroundColor: step.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#EFF6FF] rounded-xl text-[11px] text-[#1765FF] mt-2">
            💡 Tỷ lệ chuyển đổi từ Tiềm năng sang Thành công đạt 10%, vượt 2% so với định mức toàn ngành.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
