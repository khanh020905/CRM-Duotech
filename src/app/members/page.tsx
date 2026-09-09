'use client';

import React, { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { MembersSettings } from '@/components/settings/MembersSettings';
import { Users, UserCheck, UserX, ShieldCheck, Briefcase } from 'lucide-react';

export default function MembersPage() {
  const {
    members,
    addMember,
    updateMember,
    canDisableMember,
    toggleMemberStatus,
    reassignMemberWork,
    deleteMember,
    contracts,
    deals,
  } = useCRM();

  // Summary Metrics
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === 'Hoạt động').length;
    const paused = members.filter((m) => m.status === 'Tạm khóa').length;
    const sales = members.filter((m) => m.role.includes('kinh doanh')).length;

    return { total, active, paused, sales };
  }, [members]);

  return (
    <AppLayout>
      <div className="space-y-6 pb-12 animate-fade-in">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
              Quản lý Người phụ trách
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Thêm mới, chỉnh sửa thông tin, phân quyền vai trò và bàn giao công việc cho nhân sự đội ngũ.
            </p>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-[#E6EBF2] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#667085] block">Tổng nhân sự</span>
              <span className="text-2xl font-bold text-[#101828] mt-1 block">{stats.total}</span>
              <span className="text-[11px] text-[#98A2B3] mt-0.5 block">Thành viên đội ngũ</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-[#E6EBF2] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#059669] block">Đang hoạt động</span>
              <span className="text-2xl font-bold text-[#059669] mt-1 block">{stats.active}</span>
              <span className="text-[11px] text-[#667085] mt-0.5 block">Sẵn sàng phân công</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-[#E6EBF2] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#1765FF] block">Nhân sự Sales</span>
              <span className="text-2xl font-bold text-[#1765FF] mt-1 block">{stats.sales}</span>
              <span className="text-[11px] text-[#667085] mt-0.5 block">Phụ trách hợp đồng & deal</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-[#E6EBF2] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#DC2626] block">Tạm ngưng</span>
              <span className="text-2xl font-bold text-[#DC2626] mt-1 block">{stats.paused}</span>
              <span className="text-[11px] text-[#667085] mt-0.5 block">Tạm khóa phân quyền</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Member CRUD Table Component */}
        <MembersSettings
          members={members}
          onAddMember={addMember}
          onUpdateMember={updateMember}
          canDisableMember={canDisableMember}
          onToggleStatus={toggleMemberStatus}
          onReassignWork={reassignMemberWork}
          onDeleteMember={deleteMember}
        />
      </div>
    </AppLayout>
  );
}
