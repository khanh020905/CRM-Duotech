'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { Contract, ContractStatus, MaintenanceStatus } from '@/types/crm';
import { formatCurrency, matchSearch, getContractFinancials } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ContractsSummary } from '@/components/contracts/ContractsSummary';
import { ContractsToolbar } from '@/components/contracts/ContractsToolbar';
import { ContractsTable } from '@/components/contracts/ContractsTable';
import { ContractForm } from '@/components/contracts/ContractForm';
import { ContractDetailSheet } from '@/components/contracts/ContractDetailSheet';
import { ContractImportWizard } from '@/components/contracts/ContractImportWizard';
import { Upload, Download, Plus, Trash2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ContractsPage() {
  const {
    contracts,
    customers,
    members,
    addContract,
    updateContract,
    deleteContract,
    archiveContract,
    showToast,
  } = useCRM();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [maintainFilter, setMaintainFilter] = useState('all');
  const [includeArchived, setIncludeArchived] = useState(false);

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<'code' | 'customer' | 'value' | 'paid' | 'remaining' | 'signDate' | 'stt'>('stt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // Defaults to 8 to match Image 2 exactly

  // Modals & Sheets
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  // 1. Filtered Contracts across all data
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Archive filter
      if (!includeArchived && c.isArchived) return false;

      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // Assignee filter
      if (assigneeFilter !== 'all' && c.assigneeId !== assigneeFilter) return false;

      // Maintain filter
      if (maintainFilter !== 'all' && c.maintenance?.status !== maintainFilter) return false;

      // Search filter: customer, phone, project, code
      if (search.trim()) {
        const matchCustomer = matchSearch(c.customerName || '', search);
        const matchPhone = matchSearch(c.phone || '', search);
        const matchProject = matchSearch(c.project, search);
        const matchCode = matchSearch(c.contractCode, search);
        if (!matchCustomer && !matchPhone && !matchProject && !matchCode) {
          return false;
        }
      }

      return true;
    });
  }, [contracts, search, statusFilter, assigneeFilter, maintainFilter, includeArchived]);

  // 2. Sorted Contracts
  const sortedContracts = useMemo(() => {
    return [...filteredContracts].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'customer') {
        comparison = (a.customerName || '').localeCompare(b.customerName || '', 'vi');
      } else if (sortBy === 'value') {
        comparison = a.value - b.value;
      } else if (sortBy === 'paid') {
        comparison = getContractFinancials(a).paid - getContractFinancials(b).paid;
      } else if (sortBy === 'remaining') {
        comparison = getContractFinancials(a).remaining - getContractFinancials(b).remaining;
      } else if (sortBy === 'signDate') {
        comparison = (a.signDate || '').localeCompare(b.signDate || '');
      } else if (sortBy === 'code') {
        comparison = a.contractCode.localeCompare(b.contractCode);
      } else {
        // default STT / chronological
        comparison = a.contractCode.localeCompare(b.contractCode);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredContracts, sortBy, sortOrder]);

  // 3. Paginated Rows
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedContracts.slice(start, start + pageSize);
  }, [sortedContracts, currentPage, pageSize]);

  // 4. Calculate KPI metrics strictly according to rules across ALL filtered results
  const metrics = useMemo(() => {
    const totalCount = filteredContracts.length;
    const totalValue = filteredContracts.reduce((sum, c) => sum + (c.value || 0), 0);

    const todayStr = '2026-09-07';
    // Phí duy trì / tháng: chỉ cộng những gói đang hoạt động và đã đến ngày bắt đầu
    const totalMonthlyMaintain = filteredContracts.reduce((sum, c) => {
      if (
        c.maintenance?.status === 'Đang hoạt động' &&
        c.maintenance.startDate &&
        c.maintenance.startDate <= todayStr
      ) {
        return sum + (c.maintenance.monthlyFee || 0);
      }
      return sum;
    }, 0);

    return { totalCount, totalValue, totalMonthlyMaintain };
  }, [filteredContracts]);

  // Handle Sort Toggle
  const handleSort = (col: 'code' | 'customer' | 'value' | 'paid' | 'remaining' | 'signDate' | 'stt') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setAssigneeFilter('all');
    setMaintainFilter('all');
    setIncludeArchived(false);
    setCurrentPage(1);
  };

  // Export File: Excel or CSV adhering strictly to 9 columns
  const handleExportFile = () => {
    if (filteredContracts.length === 0) {
      showToast('Không có dữ liệu', 'Không có hợp đồng nào phù hợp bộ lọc để xuất', 'warning');
      return;
    }

    const exportRows = filteredContracts.map((c, index) => {
      const assignee = members.find((m) => m.id === c.assigneeId);
      const { paid, remaining } = getContractFinancials(c);
      // Escape formula injection for text fields: if starting with =, +, -, @, prefix with '
      const sanitize = (text: string) => {
        if (/^[=+\-@]/.test(text)) return `'${text}`;
        return text;
      };

      return {
        STT: index + 1,
        'TÊN KHÁCH HÀNG': sanitize(c.customerName || 'Khách hàng'),
        'SDT': `\t${c.phone || ''}`, // Tab prefix keeps phone strictly as text with leading zero
        'DỰ ÁN': sanitize(c.project),
        'GIÁ TRỊ': c.value, // numeric in Excel
        'ĐÃ THU': paid,
        'CÒN LẠI': remaining,
        'TRẠNG THÁI': c.status,
        'NGƯỜI PHỤ TRÁCH': assignee?.name || 'Chưa phân công',
        'THÔNG TIN MAINTAIN': sanitize(
          c.maintenance?.status === 'Đang hoạt động' && c.maintenance?.nextRenewalDate
            ? `${c.maintenance.description} (Gia hạn ${c.maintenance.nextRenewalDate})`
            : c.maintenance?.description || 'Chưa đăng ký'
        ),
        'GIÁ TRỊ / THÁNG': c.maintenance?.status === 'Đang hoạt động' ? c.maintenance.monthlyFee : 0,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hop_Dong');
    XLSX.writeFile(wb, `Danh_Sach_Hop_Dong_Duotech_${Date.now()}.xlsx`);
    showToast('Xuất file thành công', `Đã xuất ${exportRows.length} dòng hợp đồng (11 cột)`, 'success');
  };

  // Download Sample Template (11 columns)
  const handleDownloadSample = () => {
    const sampleRows = [
      {
        STT: 1,
        'TÊN KHÁCH HÀNG': 'Công ty Minh Gia',
        'SDT': '0901234567',
        'DỰ ÁN': 'Website doanh nghiệp',
        'GIÁ TRỊ': 120000000,
        'ĐÃ THU': 60000000,
        'CÒN LẠI': 60000000,
        'TRẠNG THÁI': 'Đang triển khai',
        'NGƯỜI PHỤ TRÁCH': 'Quốc Khánh',
        'THÔNG TIN MAINTAIN': 'Hosting + backup',
        'GIÁ TRỊ / THÁNG': 1500000,
      },
      {
        STT: 2,
        'TÊN KHÁCH HÀNG': 'Trung tâm Anh Việt',
        'SDT': '0912345678',
        'DỰ ÁN': 'Nền tảng học trực tuyến',
        'GIÁ TRỊ': 250000000,
        'ĐÃ THU': 250000000,
        'CÒN LẠI': 0,
        'TRẠNG THÁI': 'Đang bảo trì',
        'NGƯỜI PHỤ TRÁCH': 'Thu Hà',
        'THÔNG TIN MAINTAIN': 'Server + hỗ trợ',
        'GIÁ TRỊ / THÁNG': 3000000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Hop_Dong');
    XLSX.writeFile(wb, 'Mau_Nhap_Hop_Dong_Duotech_11_Cot.xlsx');
    showToast('Tải file mẫu thành công', 'File mẫu 11 cột đã được lưu về máy', 'success');
  };

  // Handle Save Contract
  const handleSaveContract = (contractData: Omit<Contract, 'id' | 'createdAt'>) => {
    if (editingContract) {
      updateContract(editingContract.id, contractData);
      setEditingContract(null);
    } else {
      addContract(contractData);
    }
  };

  // Handle Delete Contract
  const handleConfirmDelete = () => {
    if (!contractToDelete) return;
    deleteContract(contractToDelete.id);
    if (viewingContract?.id === contractToDelete.id) {
      setViewingContract(null);
    }
    setContractToDelete(null);
    setDeleteConfirmInput('');
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Page Top Header matching Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
              Quản lý hợp đồng
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Theo dõi giá trị hợp đồng, khách hàng và dịch vụ duy trì.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Import Button */}
            <Button
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold border-[#D0D5DD] text-[#344054] hover:bg-[#F8FAFC]"
            >
              <Upload className="w-4 h-4 text-[#667085]" />
              <span>Import Excel/CSV</span>
            </Button>

            {/* Export Button */}
            <Button
              variant="outline"
              onClick={handleExportFile}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold border-[#D0D5DD] text-[#344054] hover:bg-[#F8FAFC]"
            >
              <Download className="w-4 h-4 text-[#667085]" />
              <span>Xuất file</span>
            </Button>

            {/* Add Contract Button */}
            <Button
              variant="primary"
              onClick={() => {
                setEditingContract(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-[#1765FF] hover:bg-[#155BE5] text-white shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hợp đồng</span>
            </Button>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <ContractsSummary
          totalCount={metrics.totalCount}
          totalValue={metrics.totalValue}
          totalMonthlyMaintain={metrics.totalMonthlyMaintain}
        />

        {/* Search & Filter Toolbar */}
        <ContractsToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          assigneeFilter={assigneeFilter}
          onAssigneeFilterChange={(val) => {
            setAssigneeFilter(val);
            setCurrentPage(1);
          }}
          maintainFilter={maintainFilter}
          onMaintainFilterChange={(val) => {
            setMaintainFilter(val);
            setCurrentPage(1);
          }}
          includeArchived={includeArchived}
          onIncludeArchivedChange={(val) => {
            setIncludeArchived(val);
            setCurrentPage(1);
          }}
          onResetFilters={handleResetFilters}
          onDownloadSample={handleDownloadSample}
          members={members}
        />

        {/* Strict 9-Column Table */}
        <ContractsTable
          contracts={paginatedContracts}
          allContractsCount={filteredContracts.length}
          members={members}
          onSelectContract={(c) => setViewingContract(c)}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {/* Add / Edit Contract Form Modal */}
        <ContractForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingContract(null);
          }}
          onSave={handleSaveContract}
          initialData={editingContract}
          customers={customers}
          members={members}
          existingContracts={contracts}
        />

        {/* Contract Detail Sheet (360 view) */}
        <ContractDetailSheet
          contract={viewingContract}
          isOpen={Boolean(viewingContract)}
          onClose={() => setViewingContract(null)}
          onEdit={(c) => {
            setEditingContract(c);
            setIsFormOpen(true);
          }}
          onArchive={(id) => {
            archiveContract(id);
            if (viewingContract?.id === id) {
              setViewingContract((prev) => (prev ? { ...prev, isArchived: !prev.isArchived } : null));
            }
          }}
          onDelete={(c) => setContractToDelete(c)}
          onUpdateAttachments={(id, newAtts) => {
            updateContract(id, { attachments: newAtts });
            if (viewingContract?.id === id) {
              setViewingContract((prev) => (prev ? { ...prev, attachments: newAtts } : null));
            }
          }}
          members={members}
          customer={customers.find((cust) => cust.id === viewingContract?.customerId)}
        />

        {/* 5-Step Excel/CSV Import Wizard */}
        <ContractImportWizard
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />

        {/* Delete Confirmation Modal */}
        {contractToDelete && (
          <Modal
            isOpen={true}
            onClose={() => {
              setContractToDelete(null);
              setDeleteConfirmInput('');
            }}
            title="Xác nhận xóa hợp đồng vĩnh viễn"
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                <div className="text-xs text-[#B91C1C] space-y-1">
                  <p className="font-bold">Cảnh báo hành động nguy hiểm!</p>
                  <p>
                    Hợp đồng <strong>{contractToDelete.contractCode}</strong> ({contractToDelete.project}) sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu. Để đảm bảo giữ lịch sử giao dịch, bạn nên dùng tính năng <strong>Lưu trữ</strong> thay vì xóa vĩnh viễn.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Nhập chính xác mã hợp đồng <strong className="text-[#101828] font-mono">{contractToDelete.contractCode}</strong> để xác nhận xóa:
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={contractToDelete.contractCode}
                  className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs font-mono text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6EBF2]">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setContractToDelete(null);
                    setDeleteConfirmInput('');
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="danger"
                  disabled={deleteConfirmInput.trim() !== contractToDelete.contractCode}
                  onClick={handleConfirmDelete}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                >
                  Xóa vĩnh viễn
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
