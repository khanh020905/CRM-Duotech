'use client';

import React, { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/common/Avatar';
import { useCRM } from '@/context/CRMContext';
import { Customer, CustomerStatus } from '@/types/crm';
import { formatCurrency } from '@/lib/utils';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Tag,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Archive,
  CheckCircle2,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  Plus,
} from 'lucide-react';

interface CustomerDetailSheet360Props {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDeleteRequest: (customer: Customer) => void;
}

export function CustomerDetailSheet360({
  customer,
  onClose,
  onEdit,
  onDeleteRequest,
}: CustomerDetailSheet360Props) {
  const {
    deals,
    contracts,
    tasks,
    calendarEvents,
    getMemberById,
    getCustomerOpportunityValue,
    archiveCustomer,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'contracts' | 'tasks' | 'calendar'>('overview');

  if (!customer) return null;

  const assignee = getMemberById(customer.assigneeId);
  const totalDealValue = getCustomerOpportunityValue(customer.id);
  const customerDeals = deals.filter((d) => d.customerId === customer.id);
  const customerContracts = contracts.filter((c) => c.customerId === customer.id);
  const customerTasks = tasks.filter((t) => t.customerId === customer.id);
  const customerEvents = calendarEvents.filter((e) => e.customerId === customer.id);

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'Tiềm năng':
        return <Badge variant="subtle-blue">{status}</Badge>;
      case 'Đang chăm sóc':
        return <Badge variant="warning">{status}</Badge>;
      case 'Đã chuyển đổi':
        return <Badge variant="success">{status}</Badge>;
    }
  };

  return (
    <Sheet
      isOpen={!!customer}
      onClose={onClose}
      title="Hồ sơ khách hàng 360°"
      description={`Mã khách hàng: #${customer.id}`}
      width="xl"
    >
      <div className="space-y-6">
        {/* Header Profile Card */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E6EBF2]">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
              customer.avatarColor || 'bg-[#EFF6FF] text-[#1765FF]'
            }`}
          >
            {customer.company
              .split(' ')
              .slice(-2)
              .map((w) => w[0])
              .join('')
              .toUpperCase() || 'KH'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#101828] truncate">{customer.name}</h3>
              {customer.isArchived && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Đã lưu trữ
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#475467] mt-0.5">{customer.company}</p>
            <div className="mt-2 flex items-center gap-2">
              {getStatusBadge(customer.status)}
              <span className="text-xs text-[#667085] flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#98A2B3]" />
                Nguồn: {customer.source}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E6EBF2] gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'deals', label: `Cơ hội (${customerDeals.length})` },
            { id: 'contracts', label: `Hợp đồng (${customerContracts.length})` },
            { id: 'tasks', label: `Công việc (${customerTasks.length})` },
            { id: 'calendar', label: `Lịch hẹn (${customerEvents.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 px-1 ${
                activeTab === tab.id
                  ? 'border-[#1765FF] text-[#1765FF]'
                  : 'border-transparent text-[#667085] hover:text-[#101828]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-[#E6EBF2] bg-white">
                <span className="text-[11px] font-medium text-[#667085] block mb-1">
                  Tổng giá trị cơ hội đang mở
                </span>
                <span className="text-base font-bold text-[#101828]">
                  {formatCurrency(totalDealValue, true)}
                </span>
                <span className="text-[10px] text-[#98A2B3] block mt-0.5">
                  Từ {customerDeals.length} cơ hội kinh doanh
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E6EBF2] bg-white">
                <span className="text-[11px] font-medium text-[#667085] block mb-1">
                  Liên hệ gần nhất
                </span>
                <span className="text-sm font-semibold text-[#101828]">{customer.lastContact}</span>
                <span className="text-[10px] text-[#98A2B3] block mt-0.5">Tạo: {customer.createdAt}</span>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-4 rounded-xl border border-[#E6EBF2] bg-white space-y-3">
              <h4 className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Thông tin liên hệ
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#667085]">Email</span>
                <a href={`mailto:${customer.email}`} className="font-medium text-[#1765FF] hover:underline flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{customer.email}</span>
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#667085]">Số điện thoại</span>
                <a href={`tel:${customer.phone}`} className="font-medium text-[#101828] hover:text-[#1765FF] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{customer.phone}</span>
                </a>
              </div>
              {customer.website && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#667085]">Website</span>
                  <span className="font-medium text-[#344054]">{customer.website}</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            <div className="p-3.5 rounded-xl border border-[#E6EBF2] bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={assignee?.name || 'Admin'} src={assignee?.avatarUrl} size="md" />
                <div>
                  <p className="text-xs font-semibold text-[#101828]">{assignee?.name}</p>
                  <p className="text-[11px] text-[#667085]">{assignee?.role || 'Nhân viên'}</p>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475467] font-medium">
                Phụ trách
              </span>
            </div>

            {/* Notes */}
            {customer.notes && (
              <div className="p-3.5 rounded-xl border border-[#E6EBF2] bg-[#F8FAFC] text-xs text-[#344054] leading-relaxed">
                <h5 className="font-semibold mb-1 text-[#101828]">Ghi chú chăm sóc:</h5>
                {customer.notes}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Deals */}
        {activeTab === 'deals' && (
          <div className="space-y-3">
            {customerDeals.length > 0 ? (
              customerDeals.map((deal) => (
                <div key={deal.id} className="p-3.5 rounded-xl border border-[#E6EBF2] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#101828]">{deal.title}</span>
                    <span className="text-xs font-bold text-[#1765FF]">
                      {formatCurrency(deal.value, true)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#667085]">
                    <span>Giai đoạn: <strong>{deal.stage}</strong> ({deal.probability}%)</span>
                    <span>Hạn chốt: {deal.expectedCloseDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#98A2B3] text-center py-6">Chưa có cơ hội kinh doanh nào.</p>
            )}
          </div>
        )}

        {/* Tab 3: Contracts */}
        {activeTab === 'contracts' && (
          <div className="space-y-3">
            {customerContracts.length > 0 ? (
              customerContracts.map((cont) => (
                <div key={cont.id} className="p-3.5 rounded-xl border border-[#E6EBF2] bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#101828]">{cont.contractCode}</span>
                    <span className="text-xs font-bold text-[#059669]">
                      {formatCurrency(cont.value, true)}
                    </span>
                  </div>
                  <p className="text-xs text-[#475467] font-medium">{cont.project}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#667085]">
                    <span>Trạng thái: <strong>{cont.status}</strong></span>
                    <span>Phí duy trì: {formatCurrency(cont.maintenance.monthlyFee, true)}/tháng</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#98A2B3] text-center py-6">Chưa có hợp đồng nào.</p>
            )}
          </div>
        )}

        {/* Tab 4: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-2.5">
            {customerTasks.length > 0 ? (
              customerTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-xl border border-[#E6EBF2] bg-white flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${t.completed ? 'line-through text-[#98A2B3]' : 'text-[#101828]'}`}>
                      {t.title}
                    </p>
                    <p className="text-[11px] text-[#667085]">{t.dueDate} • {t.dueTime}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${t.priority === 'Cao' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                    {t.priority}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#98A2B3] text-center py-6">Không có công việc nào liên quan.</p>
            )}
          </div>
        )}

        {/* Tab 5: Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-2.5">
            {customerEvents.length > 0 ? (
              customerEvents.map((e) => (
                <div key={e.id} className="p-3 rounded-xl border border-[#E6EBF2] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#101828]">{e.title}</span>
                    <span className="text-[11px] font-medium text-[#1765FF]">{e.type}</span>
                  </div>
                  <p className="text-[11px] text-[#667085]">
                    {e.date} • {e.startTime} - {e.endTime}
                  </p>
                  {e.locationOrLink && <p className="text-[10px] text-[#98A2B3] truncate">{e.locationOrLink}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#98A2B3] text-center py-6">Không có lịch hẹn nào sắp tới.</p>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#F2F4F7] flex items-center gap-2.5">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(customer)}
          >
            <Edit2 className="w-3.5 h-3.5 text-[#667085]" />
            <span>Chỉnh sửa</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => archiveCustomer(customer.id)}
            title="Lưu trữ khách hàng"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{customer.isArchived ? 'Khôi phục' : 'Lưu trữ'}</span>
          </Button>

          <Button
            variant="danger"
            onClick={() => onDeleteRequest(customer)}
            title="Xóa khách hàng"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
