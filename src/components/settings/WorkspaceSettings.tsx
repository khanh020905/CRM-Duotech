'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserSettings } from '@/types/crm';
import { Button } from '@/components/ui/Button';
import { Building2, Plus, Trash2, Globe, Check, Layers } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { CreateWorkspaceModal } from '@/components/layout/CreateWorkspaceModal';

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
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    deleteWorkspace,
    updateWorkspace,
  } = useCRM();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const ws = settings.workspaceInfo || {
    name: 'Duotech Solution',
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

  // Sync state if settings prop updates
  useEffect(() => {
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
  }, [ws.name, ws.logoUrl, ws.contactEmail, ws.phone, ws.address, ws.taxCode, ws.website, ws.timezone, ws.currency, ws.dateFormat]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedWsInfo = {
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
    };

    onSave({ workspaceInfo: updatedWsInfo });

    // Also sync active workspace model in MongoDB
    if (activeWorkspaceId) {
      await updateWorkspace(activeWorkspaceId, updatedWsInfo);
    }
  };

  const handleDeleteWs = async (wsId: string, wsName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa không gian làm việc "${wsName}" không?`)) {
      await deleteWorkspace(wsId);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Workspaces List Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1765FF]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">Danh sách Không gian làm việc</h3>
              <p className="text-xs text-[#667085]">
                Quản lý các chi nhánh, khối phòng ban hoặc dự án độc lập
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 text-xs h-9 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Workspace</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {workspaces.map((w) => {
            const isActive = w.id === activeWorkspaceId;
            return (
              <div
                key={w.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-[#1765FF] bg-[#F8FAFF] shadow-xs'
                    : 'border-[#E6EBF2] bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm text-[#101828] truncate">{w.name}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1765FF] text-white">
                          Đang hoạt động
                        </span>
                      )}
                    </div>
                    {workspaces.length > 1 && !isActive && (
                      <button
                        type="button"
                        onClick={() => handleDeleteWs(w.id, w.name)}
                        className="p-1 text-[#98A2B3] hover:text-rose-600 rounded transition-colors"
                        title="Xóa workspace này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {w.description && (
                    <p className="text-xs text-[#667085] line-clamp-2 mb-2">{w.description}</p>
                  )}
                  <div className="text-[11px] text-[#98A2B3] space-y-0.5">
                    {w.address && <p className="truncate">📍 {w.address}</p>}
                    {w.contactEmail && <p className="truncate">✉️ {w.contactEmail}</p>}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E6EBF2]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#667085]">
                    Tiền tệ: <strong className="text-[#101828]">{w.currency || 'VNĐ'}</strong>
                  </span>
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => switchWorkspace(w.id)}
                      className="text-xs font-semibold text-[#1765FF] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Kích hoạt</span>
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-[#059669] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Đã chọn
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Active Workspace Info */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#101828]">
            Thông tin chi tiết: <span className="text-[#1765FF]">{ws.name}</span>
          </h3>
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
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#344054]"
                >
                  Tải ảnh lên
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLogoUrl('')}
                    className="text-xs text-[#B42318] hover:bg-rose-50"
                  >
                    Xóa ảnh
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-[#98A2B3] mt-1">PNG, JPG, SVG tối đa 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Tên công ty / Không gian làm việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
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
                placeholder="VD: 0316888999"
                className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Tiền tệ chính
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              >
                <option value="VNĐ">VNĐ (Việt Nam Đồng)</option>
                <option value="USD">USD (Đô la Mỹ)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Email liên hệ công ty
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

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
