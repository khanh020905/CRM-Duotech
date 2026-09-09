'use client';

import React, { useState, useEffect } from 'react';
import { Contract } from '@/types/crm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RefreshCw, Calendar, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

interface ExtendContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onConfirm: (contractId: string, updates: Partial<Contract>) => void;
  authorName: string;
}

export function ExtendContractModal({
  isOpen,
  onClose,
  contract,
  onConfirm,
  authorName,
}: ExtendContractModalProps) {
  const [description, setDescription] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [extendNote, setExtendNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill from existing contract maintenance data
  useEffect(() => {
    if (!isOpen || !contract) return;
    setDescription(contract.maintenance?.description || '');
    setMonthlyFee(contract.maintenance?.monthlyFee || 0);
    // Default next renewal: 1 year from today
    const defaultRenewal = new Date();
    defaultRenewal.setFullYear(defaultRenewal.getFullYear() + 1);
    setNextRenewalDate(
      contract.maintenance?.nextRenewalDate || defaultRenewal.toISOString().split('T')[0]
    );
    setExtendNote('');
    setErrors({});
  }, [isOpen, contract]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả dịch vụ maintain';
    }
    if (monthlyFee <= 0) {
      newErrors.monthlyFee = 'Phí duy trì phải lớn hơn 0';
    }
    if (!nextRenewalDate) {
      newErrors.nextRenewalDate = 'Vui lòng chọn ngày gia hạn tiếp theo';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    const now = new Date();
    const timestamp =
      now.toLocaleDateString('vi-VN') +
      ' ' +
      now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const historyEntry = {
      id: `h-${Date.now()}`,
      timestamp,
      authorName: authorName || 'Hệ thống',
      action: 'Gia hạn dịch vụ Maintain',
      details: `Cập nhật gói maintain: ${description}. Phí: ${formatCurrency(monthlyFee)}/tháng. Gia hạn đến: ${formatDate(nextRenewalDate)}.${extendNote ? ` Ghi chú: ${extendNote}` : ''}`,
    };

    const updates: Partial<Contract> = {
      status: 'Đang bảo trì',
      maintenance: {
        status: 'Đang hoạt động',
        description: description.trim(),
        startDate: contract.maintenance?.startDate || now.toISOString().split('T')[0],
        nextRenewalDate,
        monthlyFee,
      },
      history: [...(contract.history || []), historyEntry],
    };

    onConfirm(contract.id, updates);
    onClose();
  };

  if (!isOpen || !contract) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gia hạn dịch vụ Maintain" maxWidth="md">
      <div className="space-y-5">
        {/* Current Contract Info */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1765FF] border border-[#B2CCFF]">
              {contract.contractCode}
            </span>
            <span className="text-xs text-[#667085]">•</span>
            <span className="text-xs font-medium text-[#101828] truncate">{contract.project}</span>
          </div>
          <p className="text-xs text-[#667085]">
            Khách hàng: <strong className="text-[#344054]">{contract.customerName || 'Khách hàng'}</strong>
          </p>
          {contract.maintenance?.status !== 'Chưa đăng ký' && (
            <p className="text-xs text-[#667085]">
              Maintain hiện tại: <strong className="text-[#344054]">{contract.maintenance?.description || '—'}</strong>
              {contract.maintenance?.monthlyFee > 0 && (
                <> • {formatCurrency(contract.maintenance.monthlyFee)}/tháng</>
              )}
            </p>
          )}
        </div>

        {/* Extend Form Fields */}
        <div className="space-y-3.5">
          {/* Service Description */}
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1">
              Mô tả dịch vụ maintain <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Duy trì website (server + backup + hỗ trợ kỹ thuật)"
              className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                  : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.description}</p>
            )}
          </div>

          {/* Monthly Fee & Renewal Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Phí duy trì / tháng (VNĐ) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={monthlyFee || ''}
                onChange={(e) => setMonthlyFee(Math.max(0, Number(e.target.value)))}
                placeholder="Ví dụ: 7500000"
                className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                  errors.monthlyFee
                    ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                    : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                }`}
              />
              {errors.monthlyFee && (
                <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.monthlyFee}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Ngày gia hạn tiếp theo <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="date"
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                  errors.nextRenewalDate
                    ? 'border-[#DC2626] focus:ring-[#DC2626]/20'
                    : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                }`}
              />
              {errors.nextRenewalDate && (
                <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.nextRenewalDate}</p>
              )}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1">
              Ghi chú gia hạn <span className="text-[#98A2B3]">(tùy chọn)</span>
            </label>
            <textarea
              value={extendNote}
              onChange={(e) => setExtendNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú thêm về đợt gia hạn này..."
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 resize-none"
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-[#EFF6FF] border border-[#B2CCFF] rounded-xl flex items-start gap-2.5 text-xs text-[#1E40AF]">
          <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 text-[#1765FF]" />
          <div>
            <p className="font-semibold">Khi xác nhận gia hạn:</p>
            <ul className="mt-1 space-y-0.5 text-[#3B82F6]">
              <li>• Trạng thái hợp đồng sẽ chuyển thành <strong>&quot;Đang bảo trì&quot;</strong></li>
              <li>• Gói maintain sẽ được đặt <strong>&quot;Đang hoạt động&quot;</strong></li>
              <li>• Lịch sử thay đổi sẽ ghi nhận sự kiện gia hạn</li>
              <li>• Không tạo thêm dòng hợp đồng mới (tránh trùng lặp)</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6EBF2]">
          <Button variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="bg-[#1765FF] hover:bg-[#155BE5] text-white flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Xác nhận gia hạn
          </Button>
        </div>
      </div>
    </Modal>
  );
}
