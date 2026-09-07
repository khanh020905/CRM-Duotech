'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Customer, CustomerStatus } from '@/types/crm';
import { formatCurrency, matchSearch, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Avatar } from '@/components/common/Avatar';

interface CustomersTableProps {
  onSelectCustomer?: (customer: Customer) => void;
  onEditCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customer: Customer) => void;
}

export function CustomersTable({
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: CustomersTableProps) {
  const {
    customers,
    getMemberById,
    getCustomerOpportunityValue,
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | 'All'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesText =
        searchTerm === '' ||
        matchSearch(c.company, searchTerm) ||
        matchSearch(c.name, searchTerm) ||
        matchSearch(c.email, searchTerm) ||
        (c.website && matchSearch(c.website, searchTerm));

      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

      return matchesText && matchesStatus;
    });
  }, [customers, searchTerm, selectedStatus]);

  // Top 4 items in dashboard table (matching screenshot layout)
  const displayedCustomers = filteredCustomers.slice(0, 4);

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

  const isAllSelected =
    displayedCustomers.length > 0 &&
    displayedCustomers.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedCustomers.map((c) => c.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs flex flex-col h-full">
      {/* Table Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="text-[#1765FF]">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-base font-semibold text-[#101828]">
            Khách hàng gần đây
          </h2>
        </div>

        {/* Toolbar: Search, Filter, View All */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Inline Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm khách hàng..."
              className="h-9 pl-9 pr-3 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E6EBF2] rounded-lg text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#1765FF] w-40 sm:w-48"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#344054]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                'h-9 px-3 border rounded-lg flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors shadow-2xs',
                selectedStatus !== 'All'
                  ? 'border-[#1765FF] text-[#1765FF] bg-[#EFF6FF]'
                  : 'border-[#E6EBF2] bg-white text-[#344054] hover:bg-[#F8FAFC]'
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Bộ lọc</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#E6EBF2] rounded-xl shadow-xl p-2 z-40 animate-fade-in text-xs space-y-1">
                {(['All', 'Tiềm năng', 'Đang chăm sóc', 'Đã chuyển đổi'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStatus(st);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      'w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between hover:bg-[#F8FAFC]',
                      selectedStatus === st && 'bg-[#EFF6FF] text-[#1765FF] font-semibold'
                    )}
                  >
                    <span>{st === 'All' ? 'Tất cả trạng thái' : st}</span>
                    {selectedStatus === st && <Check className="w-3.5 h-3.5 text-[#1765FF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View All Button */}
          <Link
            href="/customers"
            className="text-xs font-medium text-[#1765FF] hover:text-[#1254DB] flex items-center gap-1 group transition-colors ml-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 flex-1">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-y border-[#F2F4F7] bg-[#FAFAFC] text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              <th className="py-3 px-5 sm:px-6 w-10">
                <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
              </th>
              <th className="py-3 px-3">Khách hàng</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-3">Phụ trách</th>
              <th className="py-3 px-3">Giá trị</th>
              <th className="py-3 px-3">Liên hệ gần nhất</th>
              <th className="py-3 px-4 text-right w-12">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F4F7] text-xs sm:text-sm">
            {displayedCustomers.length > 0 ? (
              displayedCustomers.map((customer) => {
                const isSelected = selectedIds.includes(customer.id);
                const isMenuOpen = actionMenuOpenId === customer.id;
                const assignee = getMemberById(customer.assigneeId);
                const opportunityValue = getCustomerOpportunityValue(customer.id);

                return (
                  <tr
                    key={customer.id}
                    className={cn(
                      'hover:bg-[#F8FAFC] transition-colors group cursor-pointer',
                      isSelected && 'bg-[#F4F8FF]'
                    )}
                    onClick={() => onSelectCustomer && onSelectCustomer(customer)}
                  >
                    <td className="py-3.5 px-5 sm:px-6" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleSelectRow(customer.id)}
                      />
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                            customer.avatarColor || 'bg-[#EFF6FF] text-[#1765FF]'
                          )}
                        >
                          {customer.company
                            .split(' ')
                            .slice(-2)
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase() || 'VN'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#101828] truncate group-hover:text-[#1765FF] transition-colors">
                            {customer.company}
                          </p>
                          <p className="text-[11px] text-[#98A2B3] truncate">
                            {customer.website || `${customer.name} • ${customer.email}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(customer.status)}
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={assignee?.name || ''} src={assignee?.avatarUrl} size="sm" />
                        <span className="text-xs text-[#344054] font-medium truncate">
                          {assignee?.name}
                        </span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-3 font-semibold text-[#101828]">
                      {opportunityValue > 0 ? formatCurrency(opportunityValue, true) : '0'}
                    </td>

                    {/* Last Contact */}
                    <td className="py-3.5 px-3 text-[#667085] text-xs">
                      {customer.lastContact}
                    </td>

                    {/* Row Action Menu */}
                    <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActionMenuOpenId(isMenuOpen ? null : customer.id)}
                        className="p-1.5 text-[#98A2B3] hover:text-[#344054] hover:bg-[#F2F4F7] rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-4 top-10 w-36 bg-white border border-[#E6EBF2] rounded-xl shadow-xl py-1 z-30 animate-fade-in text-xs text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuOpenId(null);
                              onSelectCustomer && onSelectCustomer(customer);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[#F8FAFC] text-[#344054]"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#667085]" />
                            <span>Xem chi tiết</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuOpenId(null);
                              onEditCustomer && onEditCustomer(customer);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[#F8FAFC] text-[#344054]"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#667085]" />
                            <span>Chỉnh sửa</span>
                          </button>
                          <div className="border-t border-[#F2F4F7] my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuOpenId(null);
                              onDeleteCustomer && onDeleteCustomer(customer);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[#FEF2F2] text-[#DC2626]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-[#98A2B3]">
                  Không tìm thấy khách hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
