'use client';

import React from 'react';
import { MaintenanceStatus } from '@/types/crm';

export interface MaintenanceFormData {
  enabled: boolean;
  status: MaintenanceStatus;
  description: string;
  monthlyFee: number;
  startDate: string;
  nextRenewalDate: string;
}

interface MaintenanceFormProps {
  data: MaintenanceFormData;
  onChange: (data: MaintenanceFormData) => void;
  errors: Record<string, string>;
}

export function MaintenanceForm({ data, onChange, errors }: MaintenanceFormProps) {
  const handleToggle = (enabled: boolean) => {
    onChange({
      ...data,
      enabled,
      status: enabled ? (data.status === 'Chưa đăng ký' ? 'Đang hoạt động' : data.status) : 'Chưa đăng ký',
    });
  };

  return (
    <div className="space-y-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
      {/* Toggle switch */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[#101828]">Dịch vụ bảo trì & duy trì (Maintenance)</h4>
          <p className="text-xs text-[#667085]">
            Theo dõi các khoản phí định kỳ (Hosting, máy chủ, sao lưu dữ liệu, bảo trì phần mềm...)
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1765FF]"></div>
        </label>
      </div>

      {data.enabled && (
        <div className="space-y-3 pt-2 border-t border-[#E2E8F0] animate-fade-in">
          {/* Trạng thái Maintain & Phí tháng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Trạng thái dịch vụ <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={data.status}
                onChange={(e) => onChange({ ...data, status: e.target.value as MaintenanceStatus })}
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
              >
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Tạm dừng">Tạm dừng</option>
                <option value="Đã kết thúc">Đã kết thúc</option>
                <option value="Chưa đăng ký">Chưa đăng ký</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Phí duy trì / tháng (VNĐ) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={data.monthlyFee || ''}
                onChange={(e) => onChange({ ...data, monthlyFee: Math.max(0, Number(e.target.value)) })}
                placeholder="Ví dụ: 1500000"
                className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                  errors.monthlyFee ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                }`}
              />
              {errors.monthlyFee && (
                <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.monthlyFee}</p>
              )}
            </div>
          </div>

          {/* Mô tả dịch vụ */}
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1">
              Mô tả dịch vụ duy trì <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              placeholder="Ví dụ: Hosting + backup, Server + hỗ trợ kỹ thuật..."
              className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                errors.description ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.description}</p>
            )}
          </div>

          {/* Ngày bắt đầu & Ngày gia hạn tiếp theo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Ngày bắt đầu maintain <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="date"
                value={data.startDate}
                onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                  errors.startDate ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                }`}
              />
              {errors.startDate && (
                <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Ngày gia hạn tiếp theo
              </label>
              <input
                type="date"
                value={data.nextRenewalDate}
                onChange={(e) => onChange({ ...data, nextRenewalDate: e.target.value })}
                className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                  errors.nextRenewalDate ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                }`}
              />
              {errors.nextRenewalDate && (
                <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.nextRenewalDate}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
