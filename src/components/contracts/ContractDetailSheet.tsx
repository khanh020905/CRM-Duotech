'use client';

import React, { useState } from 'react';
import { Contract, Customer, Member } from '@/types/crm';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/common/Avatar';
import { AttachmentManager } from './AttachmentManager';
import { formatCurrency, formatDate, getContractFinancials } from '@/lib/utils';
import {
  FileText,
  Building2,
  Phone,
  Calendar,
  DollarSign,
  User,
  Clock,
  Archive,
  Trash2,
  Edit3,
  AlertCircle,
  History,
  CheckCircle2,
} from 'lucide-react';

interface ContractDetailSheetProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contract: Contract) => void;
  onArchive: (id: string) => void;
  onDelete: (contract: Contract) => void;
  onUpdateAttachments: (id: string, attachments: Contract['attachments']) => void;
  members: Member[];
  customer?: Customer;
}

export function ContractDetailSheet({
  contract,
  isOpen,
  onClose,
  onEdit,
  onArchive,
  onDelete,
  onUpdateAttachments,
  members,
  customer,
}: ContractDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'maintain' | 'attachments' | 'history'>('overview');

  if (!contract) return null;

  const assignee = members.find((m) => m.id === contract.assigneeId);

  const getRenewalStatus = (nextRenewalDate: string) => {
    if (!nextRenewalDate) return null;
    const today = new Date('2026-09-07');
    const renewal = new Date(nextRenewalDate);
    const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Đến hạn gia hạn', color: 'bg-[#FEF2F2] text-[#DC2626]' };
    }
    if (diffDays <= 7) {
      return { label: 'Sắp gia hạn', color: 'bg-[#FFFBEB] text-[#D97706]' };
    }
    return null;
  };

  const renewalAlert = getRenewalStatus(contract.maintenance?.nextRenewalDate);

  return (
    <Sheet isOpen={isOpen} onClose={onClose} width="xl">
      <div className="flex flex-col h-full bg-[#F6F8FC]">
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-[#E6EBF2]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#1765FF] border border-[#B2CCFF]">
                  {contract.contractCode}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F2F4F7] text-[#344054]">
                  {contract.status}
                </span>
                {contract.isArchived && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
                    <Archive className="w-3 h-3" />
                    Đã lưu trữ
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-[#101828] truncate mt-1" title={contract.project}>
                {contract.project}
              </h2>
              <p className="text-xs text-[#667085] truncate" title={contract.customerName || customer?.company || 'Khách hàng'}>
                Khách hàng: <strong>{contract.customerName || customer?.company || 'Khách hàng'}</strong>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(contract);
                }}
                className="flex items-center gap-1 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onArchive(contract.id)}
                className="flex items-center gap-1 text-xs"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{contract.isArchived ? 'Bỏ lưu trữ' : 'Lưu trữ'}</span>
              </Button>

              <button
                type="button"
                onClick={() => onDelete(contract)}
                className="p-2 text-[#667085] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                title="Xóa hợp đồng"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#E6EBF2] gap-6 mt-5 -mb-5">
            {[
              { key: 'overview', label: 'Tổng quan' },
              { key: 'maintain', label: 'Dịch vụ Maintain' },
              { key: 'attachments', label: `Tệp đính kèm (${contract.attachments?.length || 0})` },
              { key: 'history', label: 'Lịch sử thay đổi' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative ${
                  activeTab === tab.key ? 'text-[#1765FF]' : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1765FF]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 1. Tổng quan */}
          {activeTab === 'overview' && (() => {
            const { paid, remaining } = getContractFinancials(contract);
            const progress = contract.value > 0 ? Math.min(100, Math.round((paid / contract.value) * 100)) : 0;

            return (
              <div className="space-y-4 animate-fade-in">
                {/* Financial Box */}
                <div className="bg-white p-5 rounded-2xl border border-[#E6EBF2] shadow-2xs space-y-4 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl min-w-0">
                      <span className="text-xs text-[#667085] block mb-1">Giá trị hợp đồng</span>
                      <span
                        className="text-base sm:text-lg font-bold text-[#101828] block truncate"
                        title={formatCurrency(contract.value)}
                      >
                        {formatCurrency(contract.value)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#ECFDF5]/60 border border-[#A7F3D0] rounded-xl min-w-0">
                      <span className="text-xs text-[#059669] block mb-1 font-medium">Đã thu</span>
                      <span
                        className="text-base sm:text-lg font-bold text-[#059669] block truncate"
                        title={formatCurrency(paid)}
                      >
                        {formatCurrency(paid)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#FFFBEB]/60 border border-[#FDE68A] rounded-xl min-w-0">
                      <span className="text-xs text-[#D97706] block mb-1 font-medium">Còn lại</span>
                      <span
                        className={`text-base sm:text-lg font-bold block truncate ${
                          remaining > 0 ? 'text-[#D97706]' : 'text-[#667085]'
                        }`}
                        title={formatCurrency(remaining)}
                      >
                        {formatCurrency(remaining)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#EFF6FF]/60 border border-[#B2CCFF] rounded-xl min-w-0">
                      <span className="text-xs text-[#1765FF] block mb-1 font-medium">Phí maintain / tháng</span>
                      <span
                        className="text-base sm:text-lg font-bold text-[#1765FF] block truncate"
                        title={
                          contract.maintenance?.monthlyFee > 0
                            ? formatCurrency(contract.maintenance.monthlyFee)
                            : '0 ₫'
                        }
                      >
                        {contract.maintenance?.monthlyFee > 0
                          ? formatCurrency(contract.maintenance.monthlyFee)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="pt-2 border-t border-[#F2F4F7]">
                    <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-1 min-w-0">
                      <span className="text-[#667085] shrink-0">Tiến độ thanh toán ({progress}%)</span>
                      <span
                        className="font-semibold text-[#101828] truncate max-w-full text-right"
                        title={`${formatCurrency(paid)} / ${formatCurrency(contract.value)}`}
                      >
                        {formatCurrency(paid)} / {formatCurrency(contract.value)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1765FF] to-[#059669] transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

              {/* General Details */}
              <div className="bg-white p-5 rounded-2xl border border-[#E6EBF2] shadow-2xs space-y-3.5">
                <h3 className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">
                  Chi tiết hợp đồng
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#667085] block">Khách hàng:</span>
                    <span className="font-semibold text-[#101828] text-sm">
                      {contract.customerName || customer?.company || 'Khách hàng'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#667085] block">Số điện thoại liên hệ:</span>
                    <span className="font-mono font-medium text-[#101828]">
                      {contract.phone || customer?.phone || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#667085] block">Người phụ trách:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar name={assignee?.name || 'User'} src={assignee?.avatarUrl} size="sm" />
                      <span className="font-medium text-[#101828]">{assignee?.name || 'Chưa phân công'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#667085] block">Ngày ký hợp đồng:</span>
                    <span className="font-medium text-[#101828]">
                      {contract.signDate ? formatDate(contract.signDate) : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#667085] block">Ngày dự kiến bàn giao:</span>
                    <span className="font-medium text-[#101828]">
                      {contract.handoverDate ? formatDate(contract.handoverDate) : 'Chưa xác định'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#667085] block">Ngày tạo trên hệ thống:</span>
                    <span className="font-medium text-[#101828]">
                      {formatDate(contract.createdAt)}
                    </span>
                  </div>
                </div>

                {contract.notes && (
                  <div className="pt-3 border-t border-[#F2F4F7]">
                    <span className="text-xs text-[#667085] block mb-1">Ghi chú & Điều khoản:</span>
                    <p className="text-xs text-[#344054] bg-[#F8FAFC] p-3 rounded-xl border border-[#E6EBF2]">
                      {contract.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

          {/* 2. Dịch vụ Maintain */}
          {activeTab === 'maintain' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-[#E6EBF2] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#667085] block">Trạng thái gói Maintain</span>
                    <span className="text-base font-bold text-[#101828]">
                      {contract.maintenance?.status || 'Chưa đăng ký'}
                    </span>
                  </div>
                  {renewalAlert && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${renewalAlert.color}`}>
                      {renewalAlert.label}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-[#F2F4F7]">
                  <div>
                    <span className="text-[#667085] block">Mô tả dịch vụ:</span>
                    <span className="font-semibold text-[#101828]">
                      {contract.maintenance?.description || 'Chưa đăng ký'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[#667085] block">Mức phí duy trì / tháng:</span>
                    <span
                      className="font-bold text-sm text-[#1765FF] block truncate"
                      title={contract.maintenance?.monthlyFee > 0 ? formatCurrency(contract.maintenance.monthlyFee) : '0 đ'}
                    >
                      {contract.maintenance?.monthlyFee > 0 ? formatCurrency(contract.maintenance.monthlyFee) : '0 đ'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#667085] block">Ngày bắt đầu tính maintain:</span>
                    <span className="font-medium text-[#101828]">
                      {contract.maintenance?.startDate ? formatDate(contract.maintenance.startDate) : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#667085] block">Ngày gia hạn tiếp theo:</span>
                    <span className="font-medium text-[#101828]">
                      {contract.maintenance?.nextRenewalDate ? formatDate(contract.maintenance.nextRenewalDate) : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#EFF6FF] border border-[#B2CCFF] rounded-xl text-xs text-[#1E40AF]">
                  <p className="font-semibold mb-0.5">Quy tắc tính doanh thu duy trì:</p>
                  <p>
                    Hệ thống chỉ tính vào tổng phí duy trì/tháng đối với các gói có trạng thái <strong>&quot;Đang hoạt động&quot;</strong> và ngày bắt đầu nhỏ hơn hoặc bằng ngày hiện tại. Mọi mốc thời gian gia hạn không tự suy diễn việc khách hàng đã thanh toán hay chưa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Tệp đính kèm */}
          {activeTab === 'attachments' && (
            <div className="bg-white p-5 rounded-2xl border border-[#E6EBF2] shadow-2xs animate-fade-in">
              <AttachmentManager
                attachments={contract.attachments || []}
                onChange={(newAtts) => onUpdateAttachments(contract.id, newAtts)}
              />
            </div>
          )}

          {/* 4. Lịch sử thay đổi */}
          {activeTab === 'history' && (
            <div className="bg-white p-5 rounded-2xl border border-[#E6EBF2] shadow-2xs space-y-4 animate-fade-in">
              <h3 className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">
                Nhật ký hoạt động & Thay đổi
              </h3>

              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6EBF2]">
                {(contract.history && contract.history.length > 0) ? (
                  contract.history.map((h) => (
                    <div key={h.id} className="relative text-xs">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#1765FF] ring-4 ring-white" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#101828]">{h.action}</span>
                          <span className="text-[11px] text-[#98A2B3]">• {h.timestamp}</span>
                        </div>
                        <p className="text-[#667085]">
                          Thực hiện bởi: <strong>{h.authorName}</strong>
                        </p>
                        {h.details && (
                          <p className="text-[#344054] bg-[#F8FAFC] p-2 rounded-lg border border-[#E6EBF2] mt-1">
                            {h.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative text-xs">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#1765FF] ring-4 ring-white" />
                    <div>
                      <span className="font-bold text-[#101828]">Tạo hợp đồng</span>
                      <p className="text-[11px] text-[#98A2B3] mt-0.5">{formatDate(contract.createdAt)}</p>
                      <p className="text-[#667085] mt-0.5">Khởi tạo hợp đồng thành công trên hệ thống Duotech CRM</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
