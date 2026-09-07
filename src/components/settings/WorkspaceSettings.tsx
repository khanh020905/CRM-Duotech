'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserSettings, WorkspaceSettings as WorkspaceSettingsType } from '@/types/crm';
import { Button } from '@/components/ui/Button';
import { Building2, Upload, Trash2, Globe, Shield, AlertCircle } from 'lucide-react';

interface WorkspaceSettingsProps {
  settings: UserSettings;
  onSave: (updatedSettings: Partial<UserSettings>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function WorkspaceSettings({
  settings,
  onSave,
  onDirtyChange,
}: WorkspaceSettingsProps) {
  const ws = settings.workspaceInfo || {
    name: 'Công ty TNHH Demo',
    logoUrl: '',
    contactEmail: 'contact@duotech.vn',
    phone: '028 3822 9999',
    address: 'Tầng 12, Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh',
    taxCode: '0316888999',
    website: 'https://duotech.vn',
    timezone: 'Asia/Ho_Chi_Minh',
    currency: 'VNĐ',
    dateFormat: 'dd/MM/yyyy',
  };

  const [name, setName] = useState(ws.name);
  const [logoUrl, setLogoUrl] = useState(ws.logoUrl || '');
  const [contactEmail, setContactEmail] = useState(ws.contactEmail || '');
  const [phone, setPhone] = useState(ws.phone || '');
  const [address, setAddress] = useState(ws.address || '');
  const [taxCode, setTaxCode] = useState(ws.taxCode || '');
  const [website, setWebsite] = useState(ws.website || '');
  const [timezone, setTimezone] = useState(ws.timezone || 'Asia/Ho_Chi_Minh');
  const [currency, setCurrency] = useState(ws.currency || 'VNĐ');
  const [dateFormat, setDateFormat] = useState(ws.dateFormat || 'dd/MM/yyyy');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    name !== ws.name ||
    logoUrl !== (ws.logoUrl || '') ||
    contactEmail !== (ws.contactEmail || '') ||
    phone !== (ws.phone || '') ||
    address !== (ws.address || '') ||
    taxCode !== (ws.taxCode || '') ||
    website !== (ws.website || '') ||
    timezone !== (ws.timezone || 'Asia/Ho_Chi_Minh') ||
    currency !== (ws.currency || 'VNĐ') ||
    dateFormat !== (ws.dateFormat || 'dd/MM/yyyy');

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setName(ws.name);
    setLogoUrl(ws.logoUrl || '');
    setContactEmail(ws.contactEmail || '');
    setPhone(ws.phone || '');
    setAddress(ws.address || '');
    setTaxCode(ws.taxCode || '');
    setWebsite(ws.website || '');
    setTimezone(ws.timezone || 'Asia/Ho_Chi_Minh');
    setCurrency(ws.currency || 'VNĐ');
    setDateFormat(ws.dateFormat || 'dd/MM/yyyy');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      workspaceInfo: {
        name: name.trim(),
        logoUrl,
        contactEmail: contactEmail.trim(),
        phone: phone.trim(),
        address: address.trim(),
        taxCode: taxCode.trim(),
        website: website.trim(),
        timezone,
        currency,
        dateFormat,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#101828]">Không gian làm việc & Công ty</h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Thông tin tổ chức được hiển thị trên tiêu đề, hợp đồng và hóa đơn của Duotech CRM.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Logo Section */}
          <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-white border border-[#D0D5DD] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-8 h-8 text-[#98A2B3]" />
              )}
            </div>

            <div className="space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold border-[#1765FF] text-[#1765FF] hover:bg-[#EFF6FF]"
                >
                  Tải logo công ty
                </Button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="p-1.5 text-[#667085] hover:text-[#DC2626] rounded-lg transition-colors"
                    title="Xóa logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#667085]">
                PNG, SVG, JPG. Khuyên dùng kích thước vuông (200x200px).
              </p>
            </div>
          </div>

          {/* Grid 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Tên công ty / Không gian làm việc <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Mã số thuế doanh nghiệp
              </label>
              <input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="Ví dụ: 0316888999"
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Email liên hệ chính thức
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Địa chỉ trụ sở
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://duotech.vn"
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Định dạng ngày hiển thị
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              >
                <option value="dd/MM/yyyy">dd/MM/yyyy (07/09/2026)</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd (2026-09-07)</option>
                <option value="MM/dd/yyyy">MM/dd/yyyy (09/07/2026)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="secondary"
              disabled={!isDirty}
              onClick={handleReset}
              className="text-xs font-semibold text-[#344054]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isDirty || !name.trim()}
              className="text-xs font-semibold bg-[#1765FF] hover:bg-[#155BE5] text-white"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
