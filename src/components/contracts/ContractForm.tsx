'use client';

import React, { useState, useEffect } from 'react';
import { Contract, Customer, Member, ContractStatus, ContractAttachment } from '@/types/crm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MaintenanceForm, MaintenanceFormData } from './MaintenanceForm';
import { AttachmentManager } from './AttachmentManager';
import { Plus, Building2, User, Phone, Calendar, DollarSign, FileCheck, Paperclip } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contract, 'id' | 'createdAt'>) => void;
  initialData?: Contract | null;
  customers: Customer[];
  members: Member[];
  existingContracts: Contract[];
}

export function ContractForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  customers,
  members,
  existingContracts,
}: ContractFormProps) {
  // Form Tabs: 1. Thông tin chung, 2. Dịch vụ maintain, 3. Tệp đính kèm
  const [activeTab, setActiveTab] = useState<'general' | 'maintain' | 'attachments'>('general');

  // Fields
  const [contractCode, setContractCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [project, setProject] = useState('');
  const [value, setValue] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [status, setStatus] = useState<ContractStatus>('Đang triển khai');
  const [assigneeId, setAssigneeId] = useState('');
  const [signDate, setSignDate] = useState('');
  const [handoverDate, setHandoverDate] = useState('');
  const [notes, setNotes] = useState('');

  // Maintenance State
  const [maintenance, setMaintenance] = useState<MaintenanceFormData>({
    enabled: false,
    status: 'Chưa đăng ký',
    description: '',
    monthlyFee: 0,
    startDate: '',
    nextRenewalDate: '',
  });

  // Attachments
  const [attachments, setAttachments] = useState<ContractAttachment[]>([]);

  // Errors map
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate data
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setContractCode(initialData.contractCode);
      setCustomerId(initialData.customerId);
      setCustomerName(initialData.customerName || '');
      setPhone(initialData.phone || '');
      setProject(initialData.project);
      setValue(initialData.value);
      setPaidAmount(initialData.paidAmount !== undefined ? initialData.paidAmount : (initialData.status === 'Hoàn thành' ? initialData.value : 0));
      setStatus(initialData.status);
      setAssigneeId(initialData.assigneeId);
      setSignDate(initialData.signDate || '');
      setHandoverDate(initialData.handoverDate || '');
      setNotes(initialData.notes || '');
      setAttachments(initialData.attachments || []);

      const hasMaintain = initialData.maintenance && initialData.maintenance.status !== 'Chưa đăng ký';
      setMaintenance({
        enabled: hasMaintain,
        status: initialData.maintenance?.status || 'Chưa đăng ký',
        description: initialData.maintenance?.description || '',
        monthlyFee: initialData.maintenance?.monthlyFee || 0,
        startDate: initialData.maintenance?.startDate || '',
        nextRenewalDate: initialData.maintenance?.nextRenewalDate || '',
      });
    } else {
      // Auto-generate contract code
      const nextNum = existingContracts.length + 1;
      const code = `HD-2026-${String(nextNum).padStart(3, '0')}`;
      const defaultAssignee = members.find((m) => m.status === 'Hoạt động')?.id || members[0]?.id || 'user-1';

      setContractCode(code);
      setCustomerId(customers[0]?.id || '');
      setCustomerName(customers[0]?.company || customers[0]?.name || '');
      setPhone(customers[0]?.phone || '');
      setProject('');
      setValue(0);
      setPaidAmount(0);
      setStatus('Đang triển khai');
      setAssigneeId(defaultAssignee);
      setSignDate(new Date().toISOString().split('T')[0]);
      setHandoverDate('');
      setNotes('');
      setAttachments([]);
      setMaintenance({
        enabled: false,
        status: 'Chưa đăng ký',
        description: '',
        monthlyFee: 0,
        startDate: new Date().toISOString().split('T')[0],
        nextRenewalDate: '',
      });
    }
    setErrors({});
    setActiveTab('general');
  }, [isOpen, initialData, customers, members, existingContracts.length]);

  // When customer changes, auto-suggest phone and name
  const handleCustomerChange = (selectedCustId: string) => {
    setCustomerId(selectedCustId);
    const found = customers.find((c) => c.id === selectedCustId);
    if (found) {
      setCustomerName(found.company || found.name);
      if (!phone || phone === '') {
        setPhone(found.phone);
      }
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    // 1. Contract Code
    if (!contractCode.trim()) {
      errs.contractCode = 'Vui lòng nhập mã hợp đồng';
    } else {
      const isDuplicate = existingContracts.some(
        (c) => c.contractCode.toLowerCase() === contractCode.trim().toLowerCase() && c.id !== initialData?.id
      );
      if (isDuplicate) {
        errs.contractCode = 'Mã hợp đồng đã tồn tại trong hệ thống';
      }
    }

    // 2. Customer
    if (!customerId) {
      errs.customerId = 'Vui lòng chọn khách hàng';
    }

    // 3. Project Name
    if (!project.trim()) {
      errs.project = 'Tên dự án là bắt buộc';
    }

    // 4. Value
    if (value === undefined || value === null || isNaN(value) || value < 0) {
      errs.value = 'Giá trị hợp đồng phải là số không âm';
    }

    // 5. Phone format check: string, keeps 0 or +84
    if (phone && !/^[+0-9\s-]{8,20}$/.test(phone)) {
      errs.phone = 'Số điện thoại không hợp lệ (hỗ trợ số 0 đầu hoặc mã quốc tế +84)';
    }

    // 6. Dates check: handoverDate >= signDate
    if (signDate && handoverDate && new Date(handoverDate) < new Date(signDate)) {
      errs.handoverDate = 'Ngày bàn giao không được trước ngày ký';
    }

    // 7. Maintenance validation
    if (maintenance.enabled && maintenance.status === 'Đang hoạt động') {
      if (!maintenance.description.trim()) {
        errs.maintenanceDescription = 'Vui lòng nhập mô tả gói duy trì';
      }
      if (maintenance.monthlyFee < 0 || isNaN(maintenance.monthlyFee)) {
        errs.maintenanceMonthlyFee = 'Phí duy trì/tháng phải là số không âm';
      }
      if (!maintenance.startDate) {
        errs.maintenanceStartDate = 'Vui lòng chọn ngày bắt đầu maintain';
      }
      if (
        maintenance.startDate &&
        maintenance.nextRenewalDate &&
        new Date(maintenance.nextRenewalDate) < new Date(maintenance.startDate)
      ) {
        errs.maintenanceNextRenewalDate = 'Ngày gia hạn không được trước ngày bắt đầu';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Switch to general tab if general errors exist
      if (errors.contractCode || errors.customerId || errors.project || errors.value || errors.handoverDate) {
        setActiveTab('general');
      } else if (errors.maintenanceDescription || errors.maintenanceMonthlyFee || errors.maintenanceStartDate) {
        setActiveTab('maintain');
      }
      return;
    }

    onSave({
      contractCode: contractCode.trim(),
      customerId,
      customerName: customerName || (customers.find((c) => c.id === customerId)?.company || 'Khách hàng'),
      phone: phone.trim(),
      project: project.trim(),
      value,
      paidAmount,
      status,
      assigneeId,
      signDate: signDate || new Date().toISOString().split('T')[0],
      handoverDate: handoverDate || undefined,
      notes: notes.trim() || undefined,
      maintenance: {
        status: maintenance.enabled ? maintenance.status : 'Chưa đăng ký',
        description: maintenance.enabled ? maintenance.description.trim() : 'Chưa đăng ký',
        startDate: maintenance.enabled ? maintenance.startDate : '',
        nextRenewalDate: maintenance.enabled ? maintenance.nextRenewalDate : '',
        monthlyFee: maintenance.enabled ? maintenance.monthlyFee : 0,
      },
      attachments,
      history: [
        ...(initialData?.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp:
            new Date().toLocaleDateString('vi-VN') +
            ' ' +
            new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          authorName: members.find((m) => m.id === assigneeId)?.name || 'Quốc Khánh',
          action: initialData ? 'Cập nhật hợp đồng' : 'Tạo mới hợp đồng',
          details: `${contractCode} - ${project}`,
        },
      ],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Chỉnh sửa hợp đồng: ${initialData.contractCode}` : 'Thêm hợp đồng mới'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step/Section Tabs */}
        <div className="flex border-b border-[#E6EBF2] gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'general' ? 'text-[#1765FF]' : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            1. Thông tin chung
            {activeTab === 'general' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1765FF]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintain')}
            className={`pb-2 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'maintain' ? 'text-[#1765FF]' : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            2. Dịch vụ duy trì (Maintain)
            {activeTab === 'maintain' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1765FF]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`pb-2 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'attachments' ? 'text-[#1765FF]' : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            <span>3. Tệp đính kèm</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                attachments.length > 0 ? 'bg-[#1765FF] text-white' : 'bg-[#F2F4F7] text-[#667085]'
              }`}
            >
              {attachments.length}
            </span>
            {activeTab === 'attachments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1765FF]" />
            )}
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-3.5 animate-fade-in max-h-[58vh] overflow-y-auto pr-1">
            {/* Row 1: Code & Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Mã hợp đồng <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value.toUpperCase())}
                  placeholder="HD-2026-001"
                  className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] font-mono focus:outline-none focus:ring-2 ${
                    errors.contractCode ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                  }`}
                />
                {errors.contractCode && (
                  <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.contractCode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Khách hàng liên kết <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                    errors.customerId ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                  }`}
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} (${c.name})` : c.name}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.customerId}</p>
                )}
              </div>
            </div>

            {/* Row 2: Phone & Project */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="090 123 4567 hoặc +84..."
                  className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] font-mono focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Tên dự án <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Ví dụ: Website doanh nghiệp, Hệ thống CRM..."
                  className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                    errors.project ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                  }`}
                />
                {errors.project && (
                  <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.project}</p>
                )}
              </div>
            </div>

            {/* Row 3: Value, Paid & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Giá trị hợp đồng (VNĐ) <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={value || ''}
                  onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                  placeholder="120000000"
                  className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] font-semibold focus:outline-none focus:ring-2 ${
                    errors.value ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                  }`}
                />
                {errors.value && (
                  <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.value}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Đã thu (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#059669] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
                />
                <p className="text-[11px] text-[#667085] mt-0.5">
                  Còn lại: <span className="font-semibold text-[#D97706]">{formatCurrency(Math.max(0, value - paidAmount))}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Trạng thái hợp đồng <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContractStatus)}
                  className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
                >
                  <option value="Chờ ký">Chờ ký</option>
                  <option value="Đang triển khai">Đang triển khai</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đang bảo trì">Đang bảo trì</option>
                  <option value="Đã kết thúc">Đã kết thúc</option>
                </select>
              </div>
            </div>

            {/* Row 4: Assignee & Sign Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Người phụ trách <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.status === 'Tạm khóa'}>
                      {m.name} {m.status === 'Tạm khóa' ? '(Tạm ngưng)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Ngày ký hợp đồng
                </label>
                <input
                  type="date"
                  value={signDate}
                  onChange={(e) => setSignDate(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
                />
              </div>
            </div>

            {/* Row 5: Handover Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Ngày dự kiến bàn giao
                </label>
                <input
                  type="date"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                  className={`w-full h-9 px-3 bg-white border rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                    errors.handoverDate ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#D0D5DD] focus:ring-[#1765FF]/20'
                  }`}
                />
                {errors.handoverDate && (
                  <p className="text-[11px] text-[#DC2626] mt-0.5">{errors.handoverDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Ghi chú điều khoản
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thanh toán đợt, yêu cầu kỹ thuật..."
                  className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
                />
              </div>
            </div>

            {/* Row 6: Quick Attachment Access */}
            <div className="pt-2 border-t border-[#F2F4F7]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#344054]">
                  Tệp đính kèm hợp đồng ({attachments.length})
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('attachments')}
                  className="text-xs text-[#1765FF] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>{attachments.length > 0 ? 'Quản lý tệp chi tiết' : '+ Thêm tệp đính kèm'}</span>
                  <span>→</span>
                </button>
              </div>

              {attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2.5 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D0D5DD] rounded-lg text-xs text-[#101828] shadow-2xs"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#1765FF] shrink-0" />
                      <span className="truncate max-w-[140px] font-medium" title={att.name}>
                        {att.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                        className="text-[#98A2B3] hover:text-[#DC2626] ml-1 font-bold"
                        title="Xóa tệp"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActiveTab('attachments')}
                    className="px-2.5 py-1 text-xs text-[#1765FF] hover:bg-[#EFF6FF] rounded-lg transition-colors font-semibold"
                  >
                    + Thêm tệp khác
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setActiveTab('attachments')}
                  className="p-3 border border-dashed border-[#D0D5DD] hover:border-[#1765FF] hover:bg-[#EFF6FF]/40 rounded-xl text-center cursor-pointer transition-colors"
                >
                  <p className="text-xs text-[#667085]">
                    Chưa có tệp đính kèm.{' '}
                    <span className="font-semibold text-[#1765FF]">Nhấp vào đây</span> để tải lên file hợp đồng (PDF, Word, Excel, Ảnh...)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Maintenance Package */}
        {activeTab === 'maintain' && (
          <div className="animate-fade-in max-h-[58vh] overflow-y-auto pr-1">
            <MaintenanceForm
              data={maintenance}
              onChange={setMaintenance}
              errors={{
                description: errors.maintenanceDescription,
                monthlyFee: errors.maintenanceMonthlyFee,
                startDate: errors.maintenanceStartDate,
                nextRenewalDate: errors.maintenanceNextRenewalDate,
              }}
            />
          </div>
        )}

        {/* Tab 3: Attachments */}
        {activeTab === 'attachments' && (
          <div className="animate-fade-in max-h-[58vh] overflow-y-auto pr-1">
            <AttachmentManager
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-[#E6EBF2] flex items-center justify-between">
          <div className="text-xs text-[#667085]">
            {activeTab !== 'general' && (
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className="font-medium text-[#1765FF] hover:underline"
              >
                ← Quay lại thông tin chung
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {initialData ? 'Lưu thay đổi' : 'Tạo hợp đồng'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
