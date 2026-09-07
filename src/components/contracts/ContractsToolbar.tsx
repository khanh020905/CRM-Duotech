'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Filter, X, Download } from 'lucide-react';
import { ContractStatus, MaintenanceStatus, Member } from '@/types/crm';

interface ContractsToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (val: string) => void;
  maintainFilter: string;
  onMaintainFilterChange: (val: string) => void;
  includeArchived: boolean;
  onIncludeArchivedChange: (val: boolean) => void;
  onResetFilters: () => void;
  onDownloadSample: () => void;
  members: Member[];
}

export function ContractsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  maintainFilter,
  onMaintainFilterChange,
  includeArchived,
  onIncludeArchivedChange,
  onResetFilters,
  onDownloadSample,
  members,
}: ContractsToolbarProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    maintainFilter !== 'all' ||
    includeArchived;

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#E6EBF2] shadow-2xs">
        {/* Left Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm khách hàng, dự án, số điện thoại..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#F6F8FC] border border-[#E6EBF2] rounded-xl text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#101828]"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3.5 pr-8 bg-[#F6F8FC] hover:bg-[#EEF2F6] border border-[#E6EBF2] rounded-xl text-xs sm:text-sm text-[#344054] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 transition-colors"
            >
              <option value="all">Trạng thái (Tất cả)</option>
              <option value="Chờ ký">Chờ ký</option>
              <option value="Đang triển khai">Đang triển khai</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đang bảo trì">Đang bảo trì</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Assignee Dropdown */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => onAssigneeFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3.5 pr-8 bg-[#F6F8FC] hover:bg-[#EEF2F6] border border-[#E6EBF2] rounded-xl text-xs sm:text-sm text-[#344054] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 transition-colors"
            >
              <option value="all">Người phụ trách (Tất cả)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Extended Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors ${
              showAdvancedFilters || maintainFilter !== 'all' || includeArchived
                ? 'bg-[#EAF2FF] border-[#B2CCFF] text-[#1765FF]'
                : 'bg-[#F6F8FC] hover:bg-[#EEF2F6] border-[#E6EBF2] text-[#344054]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Bộ lọc</span>
          </button>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-9 px-3 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Right Info Link: Matching exact text in screenshot */}
        <div className="text-xs text-[#667085] flex items-center gap-1 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F2F4F7]">
          <span>Nhập hợp đồng từ Excel hoặc CSV theo mẫu 9 cột.</span>
          <button
            type="button"
            onClick={onDownloadSample}
            className="font-semibold text-[#1765FF] hover:underline focus:outline-none cursor-pointer"
          >
            Tải file mẫu
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilters && (
        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs animate-fade-in">
          <div>
            <label className="block text-[11px] font-semibold text-[#475467] mb-1">
              Trạng thái Maintain
            </label>
            <select
              value={maintainFilter}
              onChange={(e) => onMaintainFilterChange(e.target.value)}
              className="w-full h-8 px-2.5 bg-white border border-[#D0D5DD] rounded-lg text-xs text-[#101828] focus:outline-none focus:ring-1 focus:ring-[#1765FF]"
            >
              <option value="all">Tất cả maintain</option>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Chưa đăng ký">Chưa đăng ký</option>
              <option value="Tạm dừng">Tạm dừng</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="includeArchived"
              checked={includeArchived}
              onChange={(e) => onIncludeArchivedChange(e.target.checked)}
              className="w-4 h-4 text-[#1765FF] rounded border-[#D0D5DD] focus:ring-[#1765FF]"
            />
            <label htmlFor="includeArchived" className="text-xs text-[#344054] cursor-pointer font-medium">
              Bao gồm hợp đồng đã lưu trữ
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
