'use client';

import React, { useState } from 'react';
import { X, Building2, Mail, Phone, MapPin, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Button } from '@/components/ui/Button';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { createWorkspace, showToast } = useCRM();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [website, setWebsite] = useState('');
  const [currency, setCurrency] = useState('VNĐ');
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên workspace', '', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        contactEmail: contactEmail.trim(),
        phone: phone.trim(),
        address: address.trim(),
        taxCode: taxCode.trim(),
        website: website.trim(),
        currency,
        dateFormat,
        timezone: 'Asia/Ho_Chi_Minh',
      });

      onClose();
      // Reset form
      setName('');
      setDescription('');
      setContactEmail('');
      setPhone('');
      setAddress('');
      setTaxCode('');
      setWebsite('');
    } catch (err) {
      console.error('Failed to create workspace', err);
      showToast('Lỗi khi tạo workspace', 'Vui lòng thử lại sau', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E6EBF2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EBF2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1765FF]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#101828]">Tạo Workspace Mới</h2>
              <p className="text-xs text-[#667085]">Thiết lập không gian làm việc độc lập cho chi nhánh hoặc dự án</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#98A2B3] hover:text-[#344054] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Workspace Name */}
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              Tên Không gian làm việc <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Chi nhánh Hà Nội, Khối Doanh nghiệp VIP..."
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF] transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">Mô tả mục đích</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Quản lý khách hàng và dự án tại khu vực miền Bắc..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF] transition-all resize-none"
            />
          </div>

          {/* Contact Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Email liên hệ</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="hanoi@duotech.vn"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Số điện thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 3888 9999"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">Địa chỉ văn phòng</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Tòa nhà Keangnam, Nam Từ Liêm, Hà Nội"
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF] transition-all"
              />
            </div>
          </div>

          {/* Tax Code & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Mã số thuế</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="VD: 0316888999-001"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Website</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://hanoi.duotech.vn"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Currency & Date Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Tiền tệ</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF]"
              >
                <option value="VNĐ">VNĐ (Việt Nam Đồng)</option>
                <option value="USD">USD (Đô la Mỹ)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Định dạng ngày</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:border-[#1765FF] focus:ring-1 focus:ring-[#1765FF]"
              >
                <option value="dd/MM/yyyy">dd/MM/yyyy (Ngày/Tháng/Năm)</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd (Năm-Tháng-Ngày)</option>
                <option value="MM/dd/yyyy">MM/dd/yyyy (Tháng/Ngày/Năm)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2F4F7]">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo Workspace'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
