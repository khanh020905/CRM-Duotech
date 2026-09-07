'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useCRM } from '@/context/CRMContext';
import { matchSearch, formatCurrency } from '@/lib/utils';
import {
  Search,
  Building2,
  CheckSquare,
  ArrowRight,
  BarChart3,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  LayoutDashboard,
  Users,
} from 'lucide-react';

export function CommandMenu() {
  const router = useRouter();
  const {
    isCommandMenuOpen,
    setIsCommandMenuOpen,
    customers,
    deals,
    contracts,
    tasks,
    getCustomerOpportunityValue,
    getCustomerById,
  } = useCRM();

  const [search, setSearch] = useState('');

  // Global Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(!isCommandMenuOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandMenuOpen, setIsCommandMenuOpen]);

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers.slice(0, 3);
    return customers
      .filter(
        (c) =>
          matchSearch(c.company, search) ||
          matchSearch(c.name, search) ||
          matchSearch(c.email, search) ||
          matchSearch(c.phone, search)
      )
      .slice(0, 4);
  }, [customers, search]);

  // Filter Deals
  const filteredDeals = useMemo(() => {
    if (!search.trim()) return deals.slice(0, 3);
    return deals
      .filter((d) => {
        const cust = getCustomerById(d.customerId);
        return (
          matchSearch(d.title, search) ||
          (cust && (matchSearch(cust.company, search) || matchSearch(cust.name, search)))
        );
      })
      .slice(0, 3);
  }, [deals, search, getCustomerById]);

  // Filter Contracts
  const filteredContracts = useMemo(() => {
    if (!search.trim()) return contracts.slice(0, 3);
    return contracts
      .filter((c) => {
        const cust = getCustomerById(c.customerId);
        return (
          matchSearch(c.project, search) ||
          matchSearch(c.contractCode, search) ||
          (cust && (matchSearch(cust.company, search) || matchSearch(cust.name, search)))
        );
      })
      .slice(0, 3);
  }, [contracts, search, getCustomerById]);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks.slice(0, 2);
    return tasks
      .filter((t) => matchSearch(t.title, search) || (t.company && matchSearch(t.company, search)))
      .slice(0, 3);
  }, [tasks, search]);

  const navigateTo = (url: string) => {
    setIsCommandMenuOpen(false);
    setSearch('');
    router.push(url);
  };

  if (!isCommandMenuOpen) return null;

  return (
    <Modal
      isOpen={isCommandMenuOpen}
      onClose={() => {
        setIsCommandMenuOpen(false);
        setSearch('');
      }}
      maxWidth="xl"
      showCloseButton={false}
    >
      <div className="-mt-2">
        {/* Search input inside modal */}
        <div className="relative flex items-center border-b border-[#F2F4F7] pb-3 mb-3">
          <Search className="w-5 h-5 text-[#98A2B3] absolute left-1" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khách hàng, cơ hội, hợp đồng, việc cần làm..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-transparent text-[#101828] placeholder:text-[#98A2B3] focus:outline-none"
          />
          <kbd className="text-[10px] font-semibold text-[#98A2B3] bg-[#F2F4F7] px-2 py-0.5 rounded">
            ESC để đóng
          </kbd>
        </div>

        {/* Results Container */}
        <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
          {/* Quick Navigation */}
          <div>
            <span className="text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider block px-2 mb-1.5">
              Điều hướng nhanh
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, color: 'text-blue-600 bg-blue-50' },
                { label: 'Khách hàng', href: '/customers', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Cơ hội bán hàng', href: '/deals', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
                { label: 'Hợp đồng & Phí', href: '/contracts', icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Công việc', href: '/tasks', icon: CheckSquare, color: 'text-purple-600 bg-purple-50' },
                { label: 'Lịch hẹn', href: '/calendar', icon: Calendar, color: 'text-sky-600 bg-sky-50' },
                { label: 'Báo cáo', href: '/reports', icon: BarChart3, color: 'text-rose-600 bg-rose-50' },
                { label: 'Cài đặt', href: '/settings', icon: Settings, color: 'text-slate-600 bg-slate-100' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigateTo(item.href)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between hover:bg-[#F8FAFC] text-[#344054] text-xs transition-colors border border-transparent hover:border-[#E6EBF2]"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${item.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-[#101828] truncate">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#98A2B3]" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customers Section */}
          {filteredCustomers.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider block px-2 mb-1.5">
                Khách hàng ({filteredCustomers.length})
              </span>
              <div className="space-y-1">
                {filteredCustomers.map((c) => {
                  const oppVal = getCustomerOpportunityValue(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => navigateTo(`/customers?search=${encodeURIComponent(c.name)}`)}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F8FAFC] text-[#344054] text-xs transition-colors group border border-transparent hover:border-[#E6EBF2]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Building2 className="w-4 h-4 text-[#98A2B3] shrink-0" />
                        <span className="font-medium text-[#101828] truncate">{c.company}</span>
                        <span className="text-[#98A2B3] truncate hidden sm:inline">
                          • {c.name}
                        </span>
                      </div>
                      <span className="font-semibold text-[#1765FF] shrink-0 text-[11px]">
                        {formatCurrency(oppVal, true)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deals Section */}
          {filteredDeals.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider block px-2 mb-1.5">
                Cơ hội bán hàng ({filteredDeals.length})
              </span>
              <div className="space-y-1">
                {filteredDeals.map((d) => {
                  const cust = getCustomerById(d.customerId);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => navigateTo(`/deals`)}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F8FAFC] text-[#344054] text-xs transition-colors group border border-transparent hover:border-[#E6EBF2]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-medium text-[#101828] truncate">{d.title}</span>
                        {cust && (
                          <span className="text-[#98A2B3] truncate hidden sm:inline">
                            • {cust.company}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-emerald-600 shrink-0 text-[11px]">
                        {formatCurrency(d.value, true)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contracts Section */}
          {filteredContracts.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider block px-2 mb-1.5">
                Hợp đồng ({filteredContracts.length})
              </span>
              <div className="space-y-1">
                {filteredContracts.map((ct) => {
                  const cust = getCustomerById(ct.customerId);
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => navigateTo(`/contracts`)}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F8FAFC] text-[#344054] text-xs transition-colors group border border-transparent hover:border-[#E6EBF2]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-[#101828] truncate">{ct.project}</span>
                        <span className="text-[#98A2B3] truncate hidden sm:inline">
                          • {cust?.name || 'Khách hàng'} ({ct.contractCode})
                        </span>
                      </div>
                      <span className="font-semibold text-[#101828] shrink-0 text-[11px]">
                        {formatCurrency(ct.value, true)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider block px-2 mb-1.5">
                Công việc ({filteredTasks.length})
              </span>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => navigateTo(`/tasks`)}
                    className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F8FAFC] text-[#344054] text-xs transition-colors group border border-transparent hover:border-[#E6EBF2]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="font-medium text-[#101828] truncate">{t.title}</span>
                      <span className="text-[#98A2B3] truncate hidden sm:inline">
                        • {t.company}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#98A2B3] shrink-0">
                      {t.dueTime ? `${t.dueTime}, ` : ''}{t.dueDate}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
