'use client';

import React, { useState } from 'react';
import { Contract, Member } from '@/types/crm';
import { Avatar } from '@/components/common/Avatar';
import { formatCurrency, formatDate, getContractFinancials } from '@/lib/utils';
import { ArrowUpDown, ChevronLeft, ChevronRight, FileText, MoreHorizontal } from 'lucide-react';

interface ContractsTableProps {
  contracts: Contract[];
  allContractsCount: number;
  members: Member[];
  onSelectContract: (contract: Contract) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortBy: 'code' | 'customer' | 'value' | 'paid' | 'remaining' | 'signDate' | 'stt';
  sortOrder: 'asc' | 'desc';
  onSort: (col: 'code' | 'customer' | 'value' | 'paid' | 'remaining' | 'signDate' | 'stt') => void;
}

export function ContractsTable({
  contracts,
  allContractsCount,
  members,
  onSelectContract,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSort,
}: ContractsTableProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  const totalPages = Math.max(1, Math.ceil(allContractsCount / pageSize));
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(startRow + contracts.length - 1, allContractsCount);

  // Helper for status badge style
  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'Đang triển khai':
        return {
          bg: 'bg-[#EFF6FF] text-[#1765FF]',
          dot: 'bg-[#1765FF]',
        };
      case 'Đang bảo trì':
        return {
          bg: 'bg-[#ECFDF5] text-[#059669]',
          dot: 'bg-[#059669]',
        };
      case 'Chờ ký':
        return {
          bg: 'bg-[#FFFBEB] text-[#D97706]',
          dot: 'bg-[#D97706]',
        };
      case 'Hoàn thành':
        return {
          bg: 'bg-[#EFF6FF] text-[#1765FF]',
          dot: 'bg-[#1765FF]',
        };
      case 'Đã kết thúc':
      default:
        return {
          bg: 'bg-[#F3F4F6] text-[#4B5563]',
          dot: 'bg-[#9CA3AF]',
        };
    }
  };

  // Check renewal timing
  const getRenewalStatus = (nextRenewalDate: string) => {
    if (!nextRenewalDate) return null;
    const today = new Date('2026-09-07');
    const renewal = new Date(nextRenewalDate);
    const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Đến hạn gia hạn', type: 'overdue' };
    }
    if (diffDays <= 7) {
      return { label: 'Sắp gia hạn', type: 'warning' };
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6EBF2] shadow-2xs overflow-hidden flex flex-col">
      {/* Scrollable Container */}
      <div className="overflow-x-auto min-h-[360px]">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#E6EBF2] bg-white text-[11px] font-semibold text-[#667085] tracking-wider uppercase">
              <th className="py-3 px-3.5 w-14 text-center">STT</th>
              <th
                onClick={() => onSort('customer')}
                className="py-3 px-3.5 cursor-pointer hover:text-[#101828] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>TÊN KHÁCH HÀNG</span>
                  <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                </div>
              </th>
              <th className="py-3 px-3.5">SDT</th>
              <th className="py-3 px-3.5">DỰ ÁN</th>
              <th
                onClick={() => onSort('value')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-[#101828] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>GIÁ TRỊ</span>
                  <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                </div>
              </th>
              <th
                onClick={() => onSort('paid')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-[#101828] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ĐÃ THU</span>
                  <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                </div>
              </th>
              <th
                onClick={() => onSort('remaining')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-[#101828] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CÒN LẠI</span>
                  <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                </div>
              </th>
              <th className="py-3 px-3.5">TRẠNG THÁI</th>
              <th className="py-3 px-3.5">NGƯỜI PHỤ TRÁCH</th>
              <th className="py-3 px-3.5 min-w-[170px]">THÔNG TIN MAINTAIN</th>
              <th className="py-3 px-3.5 text-right">GIÁ TRỊ / THÁNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F4F7]">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-[#667085]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-[#98A2B3]" />
                    <p className="font-semibold text-[#101828] text-sm">Không tìm thấy hợp đồng nào</p>
                    <p className="text-xs text-[#667085]">Thử thay đổi bộ lọc tìm kiếm hoặc thêm hợp đồng mới</p>
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map((c, index) => {
                const sttNumber = (currentPage - 1) * pageSize + index + 1;
                const formattedStt = String(sttNumber).padStart(2, '0');
                const badge = getStatusBadge(c.status);
                const assignee = getMember(c.assigneeId);
                const renewalAlert = getRenewalStatus(c.maintenance?.nextRenewalDate);
                const { paid, remaining } = getContractFinancials(c);

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectContract(c)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                  >
                    {/* 1. STT */}
                    <td className="py-3.5 px-3.5 text-center font-medium text-[#667085]">
                      {formattedStt}
                    </td>

                    {/* 2. TÊN KHÁCH HÀNG */}
                    <td className="py-3.5 px-3.5 font-medium text-[#101828] whitespace-nowrap">
                      {c.customerName || 'Khách hàng'}
                    </td>

                    {/* 3. SDT */}
                    <td className="py-3.5 px-3.5 text-[#475467] font-mono whitespace-nowrap">
                      {c.phone || '—'}
                    </td>

                    {/* 4. DỰ ÁN */}
                    <td className="py-3.5 px-3.5 text-[#344054] max-w-[200px] truncate" title={c.project}>
                      {c.project}
                    </td>

                    {/* 5. GIÁ TRỊ (VND, right-aligned) */}
                    <td className="py-3.5 px-3.5 text-right font-medium text-[#101828] whitespace-nowrap">
                      {formatCurrency(c.value)}
                    </td>

                    {/* 6. ĐÃ THU (VND, right-aligned) */}
                    <td className="py-3.5 px-3.5 text-right font-medium text-[#059669] whitespace-nowrap">
                      {formatCurrency(paid)}
                    </td>

                    {/* 7. CÒN LẠI (VND, right-aligned) */}
                    <td className="py-3.5 px-3.5 text-right font-medium whitespace-nowrap">
                      {remaining === 0 ? (
                        <span className="text-[#667085]">0 đ</span>
                      ) : (
                        <span className="text-[#D97706] font-semibold">{formatCurrency(remaining)}</span>
                      )}
                    </td>

                    {/* 8. TRẠNG THÁI */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {c.status}
                      </span>
                    </td>

                    {/* 9. NGƯỜI PHỤ TRÁCH */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={assignee?.name || 'User'}
                          src={assignee?.avatarUrl}
                          size="sm"
                        />
                        <span className="text-xs text-[#344054] font-medium">
                          {assignee?.name || 'Chưa phân công'}
                        </span>
                      </div>
                    </td>

                    {/* 10. THÔNG TIN MAINTAIN */}
                    <td className="py-3.5 px-3.5">
                      <div className="space-y-0.5">
                        <p className="text-xs text-[#101828] font-medium line-clamp-1">
                          {c.maintenance?.description || 'Chưa đăng ký'}
                        </p>
                        {c.maintenance?.status === 'Đang hoạt động' && c.maintenance?.nextRenewalDate && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#667085]">
                              Gia hạn {formatDate(c.maintenance.nextRenewalDate)}
                            </span>
                            {renewalAlert && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  renewalAlert.type === 'overdue'
                                    ? 'bg-[#FEF2F2] text-[#DC2626]'
                                    : 'bg-[#FFFBEB] text-[#D97706]'
                                }`}
                              >
                                {renewalAlert.label}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 11. GIÁ TRỊ / THÁNG (right-aligned) */}
                    <td className="py-3.5 px-3.5 text-right font-medium text-[#101828] whitespace-nowrap">
                      {c.maintenance?.status === 'Đang hoạt động' && c.maintenance?.monthlyFee > 0
                        ? formatCurrency(c.maintenance.monthlyFee)
                        : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination matching Image 2 */}
      <div className="px-4 py-3 border-t border-[#E6EBF2] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
        <div>
          {allContractsCount > 0 ? (
            <span>
              Hiển thị {startRow}–{endRow} trong {allContractsCount} hợp đồng
            </span>
          ) : (
            <span>Hiển thị 0 hợp đồng</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Rows Per Page Option */}
          <div className="flex items-center gap-1.5">
            <span className="hidden md:inline text-[11px]">Hàng mỗi trang:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 bg-[#F6F8FC] border border-[#D0D5DD] rounded-lg text-xs text-[#344054] cursor-pointer focus:outline-none"
            >
              <option value={8}>8 dòng</option>
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#D0D5DD] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed text-[#344054] transition-colors"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#1765FF] text-white shadow-2xs'
                      : 'border border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#344054]'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#D0D5DD] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed text-[#344054] transition-colors"
              aria-label="Trang tiếp"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
