'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { Customer, CustomerStatus } from '@/types/crm';
import { formatCurrency, matchSearch, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Avatar } from '@/components/common/Avatar';
import { Modal } from '@/components/ui/Modal';
import { CustomerDetailSheet360 } from '@/components/customers/CustomerDetailSheet360';
import {
  Search,
  Plus,
  Download,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';

export default function CustomersPage() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    archiveCustomer,
    getMemberById,
    members,
    getCustomerOpportunityValue,
    canDeleteCustomer,
    showToast,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'All' | CustomerStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | 'All'>('All');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Sheets state
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteBlockedInfo, setDeleteBlockedInfo] = useState<{ reason: string; customer: Customer } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSource, setFormSource] = useState<any>('Website');
  const [formStatus, setFormStatus] = useState<CustomerStatus>('Tiềm năng');
  const [formAssigneeId, setFormAssigneeId] = useState(members[0]?.id || 'user-1');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Category counts
  const countAll = customers.filter((c) => !c.isArchived).length;
  const countTiemNang = customers.filter((c) => c.status === 'Tiềm năng' && !c.isArchived).length;
  const countDangChamSoc = customers.filter((c) => c.status === 'Đang chăm sóc' && !c.isArchived).length;
  const countDaChuyenDoi = customers.filter((c) => c.status === 'Đã chuyển đổi' && !c.isArchived).length;

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Tab pill filter
      if (activeTab !== 'All' && c.status !== activeTab) return false;

      // Status dropdown filter
      if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;

      // Assignee dropdown filter
      if (selectedAssignee !== 'All' && c.assigneeId !== selectedAssignee) return false;

      // Search match
      if (searchTerm.trim()) {
        const matches =
          matchSearch(c.name, searchTerm) ||
          matchSearch(c.company, searchTerm) ||
          matchSearch(c.email, searchTerm) ||
          c.phone.includes(searchTerm.trim());
        if (!matches) return false;
      }

      return true;
    });
  }, [customers, activeTab, selectedStatus, selectedAssignee, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCustomers.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'Tiềm năng':
        return <Badge variant="subtle-blue">Tiềm năng</Badge>;
      case 'Đang chăm sóc':
        return <Badge variant="warning">Đang chăm sóc</Badge>;
      case 'Đã chuyển đổi':
        return <Badge variant="success">Đã chuyển đổi</Badge>;
    }
  };

  // Open Add/Edit Modal
  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormName(customer.name);
      setFormCompany(customer.company);
      setFormEmail(customer.email);
      setFormPhone(customer.phone);
      setFormSource(customer.source);
      setFormStatus(customer.status);
      setFormAssigneeId(customer.assigneeId);
      setFormNotes(customer.notes || '');
    } else {
      setEditingCustomer(null);
      setFormName('');
      setFormCompany('');
      setFormEmail('');
      setFormPhone('');
      setFormSource('Website');
      setFormStatus('Tiềm năng');
      setFormAssigneeId(members[0]?.id || 'user-1');
      setFormNotes('');
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!formName.trim()) errs.name = 'Vui lòng nhập họ tên người liên hệ';
    if (!formCompany.trim()) errs.company = 'Vui lòng nhập tên công ty';
    if (!formEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      errs.email = 'Vui lòng nhập email hợp lệ';
    }
    if (!formPhone.trim() || !/^[0-9+() -]{8,15}$/.test(formPhone)) {
      errs.phone = 'Số điện thoại không hợp lệ (8-15 số)';
    }

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
        source: formSource,
        status: formStatus,
        assigneeId: formAssigneeId,
        notes: formNotes.trim(),
      });
    } else {
      addCustomer({
        name: formName.trim(),
        company: formCompany.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        source: formSource,
        status: formStatus,
        assigneeId: formAssigneeId,
        lastContact: 'Hôm nay',
        notes: formNotes.trim(),
        avatarColor: 'bg-[#EFF6FF] text-[#1765FF]',
      });
    }

    setIsFormOpen(false);
  };

  // Safe Delete Request
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

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Họ và tên',
      'Công ty',
      'Email',
      'Số điện thoại',
      'Nguồn',
      'Trạng thái',
      'Người phụ trách',
      'Giá trị cơ hội (VNĐ)',
      'Liên hệ gần nhất',
    ];

    const rows = filteredCustomers.map((c) => {
      const assignee = getMemberById(c.assigneeId);
      const dealVal = getCustomerOpportunityValue(c.id);
      return [
        `"${c.id}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.company.replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `'${c.phone}`, // preserve leading zero in Excel
        `"${c.source}"`,
        `"${c.status}"`,
        `"${assignee?.name || ''}"`,
        `"${dealVal}"`,
        `"${c.lastContact}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DuotechCRM_KhachHang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Xuất dữ liệu thành công', `Đã xuất ${filteredCustomers.length} khách hàng sang file CSV`, 'success');
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-[#101828] tracking-tight leading-tight">
            Khách hàng
          </h1>
          <p className="text-sm text-[#667085] mt-1 font-normal">
            Quản lý và chăm sóc khách hàng tại một nơi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 shadow-2xs text-xs sm:text-sm h-10"
          >
            <Download className="w-4 h-4 text-[#667085]" />
            <span>Xuất dữ liệu</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => handleOpenForm()}
            className="gap-2 shadow-sm shadow-blue-500/20 text-xs sm:text-sm h-10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm khách hàng</span>
          </Button>
        </div>
      </div>

      {/* Category Pills Tabs - Matching Image 1 */}
      <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('All');
            setCurrentPage(1);
          }}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-2 select-none border',
            activeTab === 'All'
              ? 'bg-[#1765FF] text-white border-[#1765FF]'
              : 'bg-white text-[#475467] border-[#E6EBF2] hover:bg-[#F8FAFC]'
          )}
        >
          <span>Tất cả</span>
          <span className={cn('px-1.5 py-0.5 rounded-full text-[11px] font-bold', activeTab === 'All' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#667085]')}>
            {countAll.toLocaleString('vi-VN')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('Tiềm năng');
            setCurrentPage(1);
          }}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-2 select-none border',
            activeTab === 'Tiềm năng'
              ? 'bg-[#1765FF] text-white border-[#1765FF]'
              : 'bg-white text-[#475467] border-[#E6EBF2] hover:bg-[#F8FAFC]'
          )}
        >
          <span>Tiềm năng</span>
          <span className={cn('px-1.5 py-0.5 rounded-full text-[11px] font-bold', activeTab === 'Tiềm năng' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#667085]')}>
            {countTiemNang}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('Đang chăm sóc');
            setCurrentPage(1);
          }}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-2 select-none border',
            activeTab === 'Đang chăm sóc'
              ? 'bg-[#1765FF] text-white border-[#1765FF]'
              : 'bg-white text-[#475467] border-[#E6EBF2] hover:bg-[#F8FAFC]'
          )}
        >
          <span>Đang chăm sóc</span>
          <span className={cn('px-1.5 py-0.5 rounded-full text-[11px] font-bold', activeTab === 'Đang chăm sóc' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#667085]')}>
            {countDangChamSoc}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('Đã chuyển đổi');
            setCurrentPage(1);
          }}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-2 select-none border',
            activeTab === 'Đã chuyển đổi'
              ? 'bg-[#1765FF] text-white border-[#1765FF]'
              : 'bg-white text-[#475467] border-[#E6EBF2] hover:bg-[#F8FAFC]'
          )}
        >
          <span>Đã chuyển đổi</span>
          <span className={cn('px-1.5 py-0.5 rounded-full text-[11px] font-bold', activeTab === 'Đã chuyển đổi' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#667085]')}>
            {countDaChuyenDoi}
          </span>
        </button>
      </div>

      {/* Search & Filters Bar - Matching Image 1 */}
      <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-4 mb-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên, email hoặc công ty..."
            className="w-full h-10 pl-10 pr-8 text-xs sm:text-sm bg-white border border-[#E6EBF2] rounded-lg text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#1765FF] focus:ring-2 focus:ring-[#1765FF]/15 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#344054]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs bg-white border border-[#E6EBF2] rounded-lg text-[#344054] font-medium focus:outline-none focus:border-[#1765FF]"
          >
            <option value="All">Trạng thái: Tất cả</option>
            <option value="Tiềm năng">Tiềm năng</option>
            <option value="Đang chăm sóc">Đang chăm sóc</option>
            <option value="Đã chuyển đổi">Đã chuyển đổi</option>
          </select>

          {/* Assignee Select */}
          <select
            value={selectedAssignee}
            onChange={(e) => {
              setSelectedAssignee(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs bg-white border border-[#E6EBF2] rounded-lg text-[#344054] font-medium focus:outline-none focus:border-[#1765FF]"
          >
            <option value="All">Người phụ trách: Tất cả</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {(selectedStatus !== 'All' || selectedAssignee !== 'All' || searchTerm !== '') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStatus('All');
                setSelectedAssignee('All');
                setSearchTerm('');
              }}
              className="text-xs text-[#1765FF]"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Table - Matching Image 1 */}
      <div className="bg-white rounded-[12px] border border-[#E6EBF2] shadow-2xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-[#F2F4F7] bg-[#FAFAFC] text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <Checkbox
                    checked={
                      selectedIds.length === paginatedCustomers.length &&
                      paginatedCustomers.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-3 px-3">Khách hàng</th>
                <th className="py-3 px-3">Công ty</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Phụ trách</th>
                <th className="py-3 px-3">Giá trị cơ hội</th>
                <th className="py-3 px-3">Liên hệ gần nhất</th>
                <th className="py-3 px-4 text-right w-12">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7] text-xs sm:text-sm">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => {
                  const isSelected = selectedIds.includes(customer.id);
                  const assignee = getMemberById(customer.assigneeId);
                  const dealValue = getCustomerOpportunityValue(customer.id);

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setViewingCustomer(customer)}
                      className={cn(
                        'hover:bg-[#F8FAFC] transition-colors cursor-pointer group',
                        isSelected && 'bg-[#F4F8FF]'
                      )}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleSelectOne(customer.id)}
                        />
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                              customer.avatarColor || 'bg-[#EFF6FF] text-[#1765FF]'
                            )}
                          >
                            {customer.name
                              .split(' ')
                              .slice(-2)
                              .map((w) => w[0])
                              .join('')
                              .toUpperCase() || 'NA'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#101828] group-hover:text-[#1765FF] transition-colors truncate">
                              {customer.name}
                            </p>
                            <p className="text-[11px] text-[#98A2B3] truncate">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Công ty */}
                      <td className="py-3.5 px-3 font-medium text-[#344054]">
                        {customer.company}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-3">
                        {getStatusBadge(customer.status)}
                      </td>

                      {/* Phụ trách */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={assignee?.name || 'Admin'}
                            src={assignee?.avatarUrl}
                            size="sm"
                          />
                          <span className="text-xs text-[#344054] font-medium truncate">
                            {assignee?.name}
                          </span>
                        </div>
                      </td>

                      {/* Giá trị cơ hội */}
                      <td className="py-3.5 px-3 font-semibold text-[#101828]">
                        {dealValue > 0 ? formatCurrency(dealValue, true) : '0'}
                      </td>

                      {/* Liên hệ gần nhất */}
                      <td className="py-3.5 px-3 text-[#667085] text-xs">
                        {customer.lastContact}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenForm(customer)}
                            className="p-1.5 text-[#98A2B3] hover:text-[#1765FF] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(customer)}
                            className="p-1.5 text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#98A2B3]">
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar: Selection count & Pagination - Matching Image 1 */}
        <div className="p-4 border-t border-[#F2F4F7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085] bg-[#FAFAFC]">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.length > 0 && selectedIds.length === paginatedCustomers.length}
              onChange={toggleSelectAll}
            />
            <span>Đã chọn {selectedIds.length} khách hàng</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              {filteredCustomers.length > 0
                ? `${(currentPage - 1) * pageSize + 1} – ${Math.min(currentPage * pageSize, filteredCustomers.length)} trên ${filteredCustomers.length} khách hàng`
                : '0 khách hàng'}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#E6EBF2] bg-white text-[#344054] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                    currentPage === num
                      ? 'bg-[#1765FF] text-white'
                      : 'bg-white border border-[#E6EBF2] text-[#344054] hover:bg-[#F8FAFC]'
                  )}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#E6EBF2] bg-white text-[#344054] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer 360 Detail Sheet */}
      <CustomerDetailSheet360
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        onEdit={(c) => {
          setViewingCustomer(null);
          handleOpenForm(c);
        }}
        onDeleteRequest={(c) => {
          setViewingCustomer(null);
          handleDeleteRequest(c);
        }}
      />

      {/* Customer Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCustomer ? 'Chỉnh sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
        description="Điền thông tin để lưu hồ sơ khách hàng vào hệ thống."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Họ và tên người liên hệ"
              placeholder="Nguyễn Minh Anh"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              error={formErrors.name}
            />
            <Input
              label="Tên doanh nghiệp / Công ty"
              placeholder="Công ty CP Việt Nhật"
              required
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
              error={formErrors.company}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="minhanh.nguyen@gmail.com"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              error={formErrors.email}
            />
            <Input
              label="Số điện thoại"
              placeholder="0912345678"
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              error={formErrors.phone}
              helperText="Số điện thoại giữ nguyên số 0 ở đầu"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
              >
                <option value="Tiềm năng">Tiềm năng</option>
                <option value="Đang chăm sóc">Đang chăm sóc</option>
                <option value="Đã chuyển đổi">Đã chuyển đổi</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">
                Nguồn khách hàng
              </label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
              >
                <option value="Website">Website</option>
                <option value="Giới thiệu">Giới thiệu</option>
                <option value="Facebook">Facebook</option>
                <option value="Sự kiện">Sự kiện</option>
                <option value="Khách hàng cũ">Khách hàng cũ</option>
                <option value="Đối tác">Đối tác</option>
                <option value="Hội thảo">Hội thảo</option>
                <option value="Tìm kiếm">Tìm kiếm</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">
                Người phụ trách
              </label>
              <select
                value={formAssigneeId}
                onChange={(e) => setFormAssigneeId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#344054]">Ghi chú</label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Ghi chú chi tiết về nhu cầu hoặc cuộc trò chuyện..."
              className="w-full p-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:border-[#1765FF]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F2F4F7]">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? 'Lưu thay đổi' : 'Thêm khách hàng'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Blocked Dialog (When customer has linked deals/contracts) */}
      <Modal
        isOpen={!!deleteBlockedInfo}
        onClose={() => setDeleteBlockedInfo(null)}
        maxWidth="sm"
        showCloseButton={true}
      >
        <div className="flex flex-col items-center text-center p-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#101828]">Không thể xóa khách hàng</h3>
          <p className="text-xs text-[#667085] mt-2 mb-5 leading-relaxed">
            {deleteBlockedInfo?.reason}
          </p>
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteBlockedInfo(null)}
            >
              Đóng
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                if (deleteBlockedInfo) {
                  archiveCustomer(deleteBlockedInfo.customer.id);
                  setDeleteBlockedInfo(null);
                }
              }}
            >
              Lưu trữ khách hàng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Safe Delete Confirmation Dialog */}
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
            Bạn có chắc chắn muốn xóa khách hàng <strong>{customerToDelete?.name}</strong> ({customerToDelete?.company})? Hành động này sẽ xóa vĩnh viễn và không thể hoàn tác.
          </p>
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setCustomerToDelete(null)}
            >
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
