'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
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
  Coins,
  BarChart3,
  Target,
  Users,
  Download,
  Calendar,
  ArrowUp,
  Inbox,
} from 'lucide-react';

const SOURCE_COLORS: Record<string, string> = {
  Website: '#1765FF',
  'Giới thiệu': '#059669',
  Facebook: '#7C3AED',
  'Sự kiện': '#D97706',
  'Khách hàng cũ': '#0284C7',
  'Đối tác': '#DB2777',
  'Hội thảo': '#4F46E5',
  'Tìm kiếm': '#10B981',
  Khác: '#64748B',
};

const STAGE_COLORS: Record<string, string> = {
  Mới: '#1765FF',
  'Đã liên hệ': '#3B82F6',
  'Đề xuất': '#60A5FA',
  'Đàm phán': '#93C5FD',
  Thắng: '#10B981',
  Thua: '#EF4444',
};

export default function ReportsPage() {
  const { customers, deals, contracts, members, showToast, activeWorkspace } = useCRM();
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'conversion' | 'team'>('overview');

  // KPI Calculations
  const wonRevenue = useMemo(() => {
    return contracts
      .filter((c) => c.status === 'Hoàn thành' || c.status === 'Đang triển khai' || c.status === 'Đang bảo trì')
      .reduce((sum, c) => sum + (c.paidAmount || c.value || 0), 0);
  }, [contracts]);

  const wonDealsCount = useMemo(() => {
    return deals.filter((d) => d.stage === 'Thắng').length;
  }, [deals]);

  const winRate = useMemo(() => {
    return deals.length > 0 ? Math.round((wonDealsCount / deals.length) * 100) : 0;
  }, [deals, wonDealsCount]);

  // Revenue vs Target (Months of 2026)
  const revenueVsTargetData = useMemo(() => {
    const months = ['T4', 'T5', 'T6', 'T7', 'T8', 'T9'];
    return months.map((m, idx) => {
      const targetMonth = idx + 4; // 4 to 9
      const actualMonthContracts = contracts.filter((c) => {
        if (!c.signDate) return false;
        let month = 0;
        if (c.signDate.includes('-')) month = parseInt(c.signDate.split('-')[1], 10);
        else if (c.signDate.includes('/')) month = parseInt(c.signDate.split('/')[1], 10);
        return month === targetMonth;
      });

      const actualSum = actualMonthContracts.reduce((s, c) => s + (c.paidAmount || c.value || 0), 0);
      const actualMillions = Math.round(actualSum / 1_000_000);
      const targetMillions = 150; // Reference benchmark target

      return {
        month: m,
        actual: actualMillions,
        target: targetMillions,
      };
    });
  }, [contracts]);

  // Customer Sources Distribution
  const customerSourcesData = useMemo(() => {
    if (customers.length === 0) return [];
    const map: Record<string, number> = {};
    customers.forEach((c) => {
      const src = c.source || 'Khác';
      map[src] = (map[src] || 0) + 1;
    });

    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / customers.length) * 100),
      color: SOURCE_COLORS[name] || '#94A3B8',
    }));
  }, [customers]);

  // Team Performance
  const teamPerformanceData = useMemo(() => {
    return members.map((member, idx) => {
      const memberDeals = deals.filter((d) => d.assigneeId === member.id);
      const memberWon = memberDeals.filter((d) => d.stage === 'Thắng');
      const memberContracts = contracts.filter((c) => c.assigneeId === member.id);
      const revenue = memberContracts.reduce((s, c) => s + (c.paidAmount || c.value || 0), 0);
      const target = 100_000_000;
      const targetPercent = target > 0 ? Math.min(100, Math.round((revenue / target) * 100)) : 0;
      const colors = ['#1765FF', '#059669', '#7C3AED', '#D97706', '#DB2777'];

      return {
        member,
        dealsCount: memberDeals.length,
        wonCount: memberWon.length,
        revenue,
        targetPercent,
        color: colors[idx % colors.length],
      };
    });
  }, [members, deals, contracts]);

  // Conversion Funnel
  const conversionFunnelData = useMemo(() => {
    const stages = ['Mới', 'Đã liên hệ', 'Đề xuất', 'Đàm phán', 'Thắng'];
    const total = deals.length || 1;

    return stages.map((stage) => {
      const count = deals.filter((d) => d.stage === stage).length;
      const percent = deals.length > 0 ? Math.round((count / total) * 100) : 0;
      return {
        stage,
        count,
        percent,
        color: STAGE_COLORS[stage] || '#1765FF',
      };
    });
  }, [deals]);

  // Export report data to CSV
  const handleExportReport = () => {
    const csvContent =
      '\uFEFF' +
      [
        `BÁO CÁO KINH DOANH - ${activeWorkspace?.name || 'DUOTECH CRM'}`,
        `Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')}`,
        '',
        '1. CHỈ SỐ TỔNG QUAN',
        'Chỉ số,Giá trị',
        `Doanh thu chốt thắng,${formatCurrency(wonRevenue)}`,
        `Số deal đã chốt,${wonDealsCount}`,
        `Tỷ lệ thắng,${winRate}%`,
        `Tổng số khách hàng,${customers.length}`,
        '',
        '2. HIỆU SUẤT ĐỘI NGŨ',
        'Nhân viên,Số cơ hội,Đã chốt,Doanh thu (VNĐ)',
        ...teamPerformanceData.map(
          (t) => `"${t.member.name}",${t.dealsCount},${t.wonCount},${t.revenue}`
        ),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_${activeWorkspace?.slug || 'Duotech'}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Không gian làm việc: <span className="font-semibold text-[#1765FF]">{activeWorkspace?.name || 'Duotech Solution'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 px-3.5 bg-white border border-[#E6EBF2] rounded-lg flex items-center gap-2 text-xs font-semibold text-[#344054] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#667085]" />
            <span>Năm 2026</span>
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

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'revenue', label: 'Doanh thu' },
          { id: 'conversion', label: 'Chuyển đổi' },
          { id: 'team', label: 'Đội ngũ' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'revenue' | 'conversion' | 'team')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer',
              activeTab === tab.id
                ? 'bg-[#1765FF] text-white shadow-sm'
                : 'bg-white border border-[#E6EBF2] text-[#475467] hover:bg-[#F8FAFC]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {/* Doanh thu */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] font-medium block">Doanh thu chốt thắng</span>
              <div className="text-xl sm:text-[22px] font-bold text-[#101828]">
                {formatCurrency(wonRevenue)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#059669]">
                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                <span>Thực tế</span>
                <span className="text-[10px] text-[#98A2B3] font-normal">từ hợp đồng</span>
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
              <span className="text-xs text-[#667085] font-medium block">Deal đã chốt</span>
              <div className="text-2xl sm:text-[26px] font-bold text-[#101828]">{wonDealsCount}</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#1765FF]">
                <span>{deals.length} tổng deal</span>
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
              <div className="text-2xl sm:text-[26px] font-bold text-[#101828]">{winRate}%</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#7C3AED]">
                <span>{wonDealsCount} / {deals.length || 1} deal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Khách hàng */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] font-medium block">Tổng khách hàng</span>
              <div className="text-2xl sm:text-[26px] font-bold text-[#101828]">{customers.length}</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#D97706]">
                <span>trong workspace</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Doanh thu so với mục tiêu & Nguồn khách hàng */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Doanh thu so với mục tiêu */}
        <div className="xl:col-span-2 bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-[#101828]">Doanh thu theo tháng (triệu VNĐ)</h3>
              <p className="text-xs text-[#667085]">Số liệu thực từ các hợp đồng ký kết</p>
            </div>
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
              <BarChart data={revenueVsTargetData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#F1F4F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#667085', fontSize: 11 }}
                  tickFormatter={(val) => `${val} tr`}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${val} triệu VNĐ`]}
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

          {customerSourcesData.length > 0 ? (
            <>
              <div className="flex items-center justify-center my-2 relative">
                <div className="w-44 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerSourcesData}
                        dataKey="count"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {customerSourcesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-[#98A2B3] uppercase font-bold">Tổng</span>
                  <span className="text-xl font-bold text-[#101828]">{customers.length}</span>
                  <span className="text-[10px] text-[#667085]">khách hàng</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-[#F2F4F7] max-h-36 overflow-y-auto">
                {customerSourcesData.map((s) => (
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <Inbox className="w-8 h-8 text-[#98A2B3] mb-2" />
              <p className="text-xs text-[#667085]">Chưa có khách hàng</p>
              <p className="text-[11px] text-[#98A2B3]">Thêm khách hàng để xem phân bố nguồn</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Hiệu suất đội ngũ & Tỷ lệ chuyển đổi */}
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
                  <th className="py-2.5 px-3">Chỉ tiêu (100tr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {teamPerformanceData.map((t) => (
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
                      {formatCurrency(t.revenue)}
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
          <h3 className="font-bold text-base text-[#101828] mb-3">Tỷ lệ chuyển đổi (Funnel)</h3>

          <div className="space-y-2.5 my-2">
            {conversionFunnelData.map((step) => (
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
                      width: `${Math.max(4, step.percent)}%`,
                      backgroundColor: step.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#EFF6FF] rounded-xl text-[11px] text-[#1765FF] mt-2">
            💡 Tỷ lệ chuyển đổi được tính toán tự động dựa trên các cơ hội kinh doanh thực tế trong workspace.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
