'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { Customer } from '@/types/crm';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { SalesPipeline } from '@/components/dashboard/SalesPipeline';
import { CustomersTable } from '@/components/dashboard/CustomersTable';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { CustomerDetailSheet360 } from '@/components/customers/CustomerDetailSheet360';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const {
    kpiStats,
    customers,
    members,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    canDeleteCustomer,
    archiveCustomer,
  } = useCRM();

  // Modals & Sheets on Dashboard
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteBlockedInfo, setDeleteBlockedInfo] = useState<{ reason: string; customer: Customer } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<any>('Tiềm năng');
  const [formAssigneeId, setFormAssigneeId] = useState(members[0]?.id || 'user-1');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormName(customer.name);
      setFormCompany(customer.company);
      setFormEmail(customer.email);
      setFormPhone(customer.phone);
      setFormStatus(customer.status);
      setFormAssigneeId(customer.assigneeId);
    } else {
      setEditingCustomer(null);
      setFormName('');
      setFormCompany('');
      setFormEmail('');
      setFormPhone('');
      setFormStatus('Tiềm năng');
      setFormAssigneeId(members[0]?.id || 'user-1');
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!formName.trim()) errs.name = 'Vui lòng nhập họ tên người liên hệ';
    if (!formCompany.trim()) errs.company = 'Vui lòng nhập tên công ty';
    if (!formEmail.trim()) errs.email = 'Vui lòng nhập email';
    if (!formPhone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formName.trim(),
        company: formCompany.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        status: formStatus,
        assigneeId: formAssigneeId,
      });
    } else {
      addCustomer({
        name: formName.trim(),
        company: formCompany.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        source: 'Website',
        status: formStatus,
        assigneeId: formAssigneeId,
        lastContact: 'Hôm nay',
        avatarColor: 'bg-[#EFF6FF] text-[#1765FF]',
      });
    }

    setIsFormOpen(false);
  };

  const handleDeleteRequest = (customer: Customer) => {
    const check = canDeleteCustomer(customer.id);
    if (!check.canDelete) {
      setDeleteBlockedInfo({
        customer,
        reason: check.reason || '',
      });
    } else {
      setCustomerToDelete(customer);
    }
  };

  return (
    <AppLayout>
      {/* Dashboard Header */}
      <DashboardHeader onAddCustomer={() => handleOpenForm()} />

      {/* Row 1: KPI Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {kpiStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* Row 2: Revenue Chart & Pipeline (2:1 ratio) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="xl:col-span-1">
          <SalesPipeline />
        </div>
      </div>

      {/* Row 3: Customers Table & Today Tasks (2:1 ratio) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <CustomersTable
            onSelectCustomer={(c) => setSelectedCustomer(c)}
            onEditCustomer={(c) => handleOpenForm(c)}
            onDeleteCustomer={(c) => handleDeleteRequest(c)}
          />
        </div>
        <div className="xl:col-span-1">
          <TodayTasks />
        </div>
      </div>

      {/* Customer 360 Detail Sheet */}
      <CustomerDetailSheet360
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(c) => {
          setSelectedCustomer(null);
          handleOpenForm(c);
        }}
        onDeleteRequest={(c) => {
          setSelectedCustomer(null);
          handleDeleteRequest(c);
        }}
      />

      {/* Customer Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        description="Điền thông tin để lưu hồ sơ vào hệ thống CRM."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Họ và tên người liên hệ"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              error={formErrors.name}
            />
            <Input
              label="Tên doanh nghiệp / Công ty"
              required
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
              error={formErrors.company}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              error={formErrors.email}
            />
            <Input
              label="Số điện thoại"
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              error={formErrors.phone}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Trạng thái</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg"
              >
                <option value="Tiềm năng">Tiềm năng</option>
                <option value="Đang chăm sóc">Đang chăm sóc</option>
                <option value="Đã chuyển đổi">Đã chuyển đổi</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Người phụ trách</label>
              <select
                value={formAssigneeId}
                onChange={(e) => setFormAssigneeId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2F4F7]">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? 'Lưu thay đổi' : 'Thêm khách hàng'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        maxWidth="sm"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center text-center p-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#101828]">Xác nhận xóa khách hàng</h3>
          <p className="text-xs text-[#667085] mt-2 mb-5 leading-relaxed">
            Bạn có chắc chắn muốn xóa khách hàng <strong>{customerToDelete?.name}</strong> ({customerToDelete?.company})?
          </p>
          <div className="flex items-center gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setCustomerToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                if (customerToDelete) {
                  deleteCustomer(customerToDelete.id);
                  setCustomerToDelete(null);
                }
              }}
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
