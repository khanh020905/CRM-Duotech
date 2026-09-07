'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { Deal, DealStage, CustomerSource } from '@/types/crm';
import { formatCurrency, matchSearch, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Sheet } from '@/components/ui/Sheet';
import { Avatar } from '@/components/common/Avatar';
import {
  BarChart3,
  Coins,
  Target,
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
  Trophy,
  XCircle,
  FileText,
  Edit2,
  Trash2,
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function DealsPage() {
  const {
    deals,
    customers,
    members,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDealStage,
    markDealWon,
    markDealLost,
    addContract,
    getCustomerById,
    getMemberById,
    showToast,
  } = useCRM();

  // View & Filter states
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<'open' | 'won' | 'lost'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('All');
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // Modals & Sheets
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [lostReasonDeal, setLostReasonDeal] = useState<Deal | null>(null);
  const [lossReasonText, setLossReasonText] = useState('');

  // Create Contract from Won Deal
  const [dealToContract, setDealToContract] = useState<Deal | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCustomerId, setFormCustomerId] = useState(customers[0]?.id || '');
  const [formValue, setFormValue] = useState('100000000');
  const [formStage, setFormStage] = useState<DealStage>('Mới');
  const [formProbability, setFormProbability] = useState('30');
  const [formAssigneeId, setFormAssigneeId] = useState(members[0]?.id || 'user-1');
  const [formCloseDate, setFormCloseDate] = useState('2026-09-30');
  const [formSource, setFormSource] = useState<CustomerSource>('Website');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Open vs Won vs Lost
      if (statusFilter === 'open') {
        if (deal.stage === 'Thắng' || deal.stage === 'Thua') return false;
      } else if (statusFilter === 'won') {
        if (deal.stage !== 'Thắng') return false;
      } else if (statusFilter === 'lost') {
        if (deal.stage !== 'Thua') return false;
      }

      // Assignee
      if (selectedAssignee !== 'All' && deal.assigneeId !== selectedAssignee) return false;

      // Search
      if (searchTerm.trim()) {
        const customer = getCustomerById(deal.customerId);
        const matches =
          matchSearch(deal.title, searchTerm) ||
          (customer && matchSearch(customer.company, searchTerm)) ||
          (customer && matchSearch(customer.name, searchTerm));
        if (!matches) return false;
      }

      return true;
    });
  }, [deals, statusFilter, selectedAssignee, searchTerm]);

  // Compute 3 KPIs matching Image 2
  const openDeals = useMemo(() => deals.filter((d) => d.stage !== 'Thắng' && d.stage !== 'Thua'), [deals]);
  const totalOpenDealsCount = openDeals.length;
  const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const totalExpectedValue = openDeals.reduce((sum, d) => sum + (d.value * (d.probability || 0)) / 100, 0);

  // Kanban Columns
  const kanbanColumns: { stage: DealStage; label: string; dotColor: string }[] = [
    { stage: 'Mới', label: 'Mới', dotColor: 'bg-[#1765FF]' },
    { stage: 'Đã liên hệ', label: 'Đã liên hệ', dotColor: 'bg-[#10B981]' },
    { stage: 'Đề xuất', label: 'Đề xuất', dotColor: 'bg-[#8B5CF6]' },
    { stage: 'Đàm phán', label: 'Đàm phán', dotColor: 'bg-[#F59E0B]' },
  ];

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      moveDealStage(dealId, targetStage);
      setDraggedDealId(null);
    }
  };

  // Open Form Modal
  const handleOpenForm = (deal?: Deal, defaultStage: DealStage = 'Mới') => {
    if (deal) {
      setEditingDeal(deal);
      setFormTitle(deal.title);
      setFormCustomerId(deal.customerId);
      setFormValue(deal.value.toString());
      setFormStage(deal.stage);
      setFormProbability(deal.probability.toString());
      setFormAssigneeId(deal.assigneeId);
      setFormCloseDate(deal.expectedCloseDate);
      setFormSource(deal.source);
      setFormNotes(deal.notes || '');
    } else {
      setEditingDeal(null);
      setFormTitle('');
      setFormCustomerId(customers[0]?.id || '');
      setFormValue('100000000');
      setFormStage(defaultStage);
      setFormProbability('30');
      setFormAssigneeId(members[0]?.id || 'user-1');
      setFormCloseDate('2026-09-30');
      setFormSource('Website');
      setFormNotes('');
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!formTitle.trim()) errs.title = 'Vui lòng nhập tên cơ hội';
    const numValue = Number(formValue);
    if (isNaN(numValue) || numValue < 0) errs.value = 'Giá trị phải là số không âm';
    const prob = Number(formProbability);
    if (isNaN(prob) || prob < 0 || prob > 100) errs.probability = 'Xác suất từ 0 - 100%';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (editingDeal) {
      updateDeal(editingDeal.id, {
        title: formTitle.trim(),
        customerId: formCustomerId,
        value: numValue,
        stage: formStage,
        probability: prob,
        assigneeId: formAssigneeId,
        expectedCloseDate: formCloseDate,
        source: formSource,
        notes: formNotes.trim(),
      });
    } else {
      addDeal({
        title: formTitle.trim(),
        customerId: formCustomerId,
        value: numValue,
        stage: formStage,
        probability: prob,
        assigneeId: formAssigneeId,
        expectedCloseDate: formCloseDate,
        source: formSource,
        notes: formNotes.trim(),
      });
    }

    setIsFormOpen(false);
  };

  // Convert Won Deal to Contract
  const handleCreateContractFromDeal = (deal: Deal) => {
    const customer = getCustomerById(deal.customerId);
    addContract({
      contractCode: `HD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: deal.customerId,
      project: deal.title,
      value: deal.value,
      status: 'Đang triển khai',
      assigneeId: deal.assigneeId,
      signDate: new Date().toISOString().slice(0, 10),
      handoverDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      maintenance: {
        status: 'Đang hoạt động',
        description: `Bảo trì định kỳ cho dự án ${deal.title}`,
        startDate: new Date().toISOString().slice(0, 10),
        nextRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        monthlyFee: Math.round(deal.value * 0.1),
      },
      attachments: [],
      notes: `Hợp đồng tạo tự động từ cơ hội "${deal.title}"`,
    });
    setDealToContract(null);
    showToast('Tạo hợp đồng thành công', `Đã tạo hợp đồng dự án cho ${customer?.company}`, 'success');
  };

  // Check if deal is near deadline (<= 3 days)
  const isNearDeadline = (dateString: string) => {
    try {
      const target = new Date(dateString).getTime();
      const now = new Date('2026-09-07').getTime(); // App current local date
      const diffDays = (target - now) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 4;
    } catch {
      return false;
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-[#101828] tracking-tight leading-tight">
            Cơ hội bán hàng
          </h1>
          <p className="text-sm text-[#667085] mt-1 font-normal">
            Theo dõi tiến trình và thúc đẩy chuyển đổi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pipeline Selector */}
          <div className="h-10 px-3.5 bg-white border border-[#E6EBF2] rounded-lg flex items-center gap-2 text-xs font-semibold text-[#344054] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#667085]" />
            <span>Pipeline chính</span>
          </div>

          <Button
            variant="primary"
            onClick={() => handleOpenForm()}
            className="gap-2 shadow-sm shadow-blue-500/20 text-xs sm:text-sm h-10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm cơ hội</span>
          </Button>
        </div>
      </div>

      {/* 3 KPI Cards - Matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {/* Card 1: Số cơ hội */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-2xl sm:text-[28px] font-bold text-[#101828] leading-tight">
              {totalOpenDealsCount}
            </div>
            <span className="text-xs text-[#667085] font-medium">cơ hội đang mở</span>
          </div>
        </div>

        {/* Card 2: Tổng giá trị */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-2xl sm:text-[28px] font-bold text-[#101828] leading-tight">
              {formatCurrency(totalPipelineValue, true)}
            </div>
            <span className="text-xs text-[#667085] font-medium">Tổng giá trị pipeline</span>
          </div>
        </div>

        {/* Card 3: Dự kiến chốt */}
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-2xl sm:text-[28px] font-bold text-[#101828] leading-tight">
              {formatCurrency(totalExpectedValue, true)}
            </div>
            <span className="text-xs text-[#667085] font-medium">Dự kiến chốt (theo % xác suất)</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Toggle - Matching Image 2 */}
      <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-3.5 mb-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search & Assignee */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm cơ hội..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E6EBF2] rounded-lg text-[#101828] focus:outline-none focus:border-[#1765FF]"
            />
          </div>

          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-[#E6EBF2] rounded-lg text-[#344054] font-medium focus:outline-none focus:border-[#1765FF]"
          >
            <option value="All">Tất cả chủ sở hữu</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Status Tab (Open / Won / Lost) */}
          <div className="inline-flex p-1 bg-[#F1F4F9] rounded-lg border border-[#E6EBF2] text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('open')}
              className={cn('px-2.5 py-1 rounded-[6px] transition-colors', statusFilter === 'open' ? 'bg-white text-[#101828] shadow-2xs' : 'text-[#667085]')}
            >
              Đang mở ({openDeals.length})
            </button>
            <button
              onClick={() => setStatusFilter('won')}
              className={cn('px-2.5 py-1 rounded-[6px] transition-colors', statusFilter === 'won' ? 'bg-white text-[#059669] shadow-2xs' : 'text-[#667085]')}
            >
              Đã thắng
            </button>
            <button
              onClick={() => setStatusFilter('lost')}
              className={cn('px-2.5 py-1 rounded-[6px] transition-colors', statusFilter === 'lost' ? 'bg-white text-[#DC2626] shadow-2xs' : 'text-[#667085]')}
            >
              Đã thua
            </button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-[#F1F4F9] rounded-lg border border-[#E6EBF2]">
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors',
              viewMode === 'kanban' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bảng</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors',
              viewMode === 'list' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>Danh sách</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View - Matching Image 2 */}
      {viewMode === 'kanban' && statusFilter === 'open' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {kanbanColumns.map(({ stage, label, dotColor }) => {
            const columnDeals = filteredDeals.filter((d) => d.stage === stage);
            const columnTotal = columnDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className="bg-[#F8FAFC] border border-[#E6EBF2] rounded-2xl p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6EBF2]">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', dotColor)} />
                    <span className="font-bold text-sm text-[#101828]">{label}</span>
                    <span className="text-xs font-bold text-[#667085] ml-1">{columnDeals.length}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#667085]">
                    {formatCurrency(columnTotal, true)}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {columnDeals.map((deal) => {
                    const customer = getCustomerById(deal.customerId);
                    const assignee = getMemberById(deal.assigneeId);
                    const near = isNearDeadline(deal.expectedCloseDate);

                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onClick={() => setViewingDeal(deal)}
                        className="bg-white rounded-xl border border-[#E6EBF2] p-4 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group space-y-3"
                      >
                        {/* Title & Customer */}
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                              customer?.avatarColor || 'bg-[#EFF6FF] text-[#1765FF]'
                            )}
                          >
                            {customer?.company
                              .split(' ')
                              .slice(-2)
                              .map((w) => w[0])
                              .join('')
                              .toUpperCase() || 'VN'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs text-[#101828] leading-tight group-hover:text-[#1765FF] transition-colors truncate">
                              {deal.title}
                            </h4>
                            <p className="text-[11px] text-[#667085] truncate mt-0.5">
                              {customer?.company}
                            </p>
                          </div>
                        </div>

                        {/* Value & Source Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#101828]">
                            {deal.value.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1765FF]">
                            {deal.source}
                          </span>
                        </div>

                        {/* Footer: Assignee & Deadline & Warning */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F2F4F7] text-[11px] text-[#667085]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Avatar
                              name={assignee?.name || 'Admin'}
                              src={assignee?.avatarUrl}
                              size="xs"
                            />
                            <span className="truncate text-xs font-medium text-[#344054]">
                              {assignee?.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {near && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                ⚠️ Sắp đến hạn
                              </span>
                            )}
                            <span className="text-[11px] text-[#98A2B3] flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {deal.expectedCloseDate.slice(8, 10)} thg {parseInt(deal.expectedCloseDate.slice(5, 7))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Column Add Deal Button */}
                <button
                  type="button"
                  onClick={() => handleOpenForm(undefined, stage)}
                  className="w-full mt-3 py-2 text-xs font-semibold text-[#1765FF] hover:bg-[#EFF6FF] rounded-xl flex items-center justify-center gap-1.5 border border-dashed border-[#BFDBFE] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm cơ hội</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* List View / Won / Lost View */}
      {(viewMode === 'list' || statusFilter !== 'open') && (
        <div className="bg-white rounded-[12px] border border-[#E6EBF2] shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-[#F2F4F7] bg-[#FAFAFC] text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                <th className="py-3 px-4">Tên cơ hội</th>
                <th className="py-3 px-3">Khách hàng / Công ty</th>
                <th className="py-3 px-3">Giá trị</th>
                <th className="py-3 px-3">Giai đoạn</th>
                <th className="py-3 px-3">Phụ trách</th>
                <th className="py-3 px-3">Hạn dự kiến</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7] text-xs sm:text-sm">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => {
                  const customer = getCustomerById(deal.customerId);
                  const assignee = getMemberById(deal.assigneeId);

                  return (
                    <tr
                      key={deal.id}
                      onClick={() => setViewingDeal(deal)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#101828] group-hover:text-[#1765FF]">
                        {deal.title}
                      </td>
                      <td className="py-3.5 px-3 text-[#344054]">
                        {customer?.company || 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#101828]">
                        {formatCurrency(deal.value, true)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={cn(
                          'text-xs font-semibold px-2.5 py-1 rounded-full',
                          deal.stage === 'Thắng' ? 'bg-emerald-50 text-emerald-700' :
                          deal.stage === 'Thua' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                        )}>
                          {deal.stage} ({deal.probability}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={assignee?.name || ''} src={assignee?.avatarUrl} size="xs" />
                          <span>{assignee?.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#667085]">
                        {deal.expectedCloseDate}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {deal.stage === 'Thắng' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateContractFromDeal(deal)}
                              className="text-xs text-[#059669] border-[#A7F3D0] hover:bg-emerald-50"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Tạo hợp đồng</span>
                            </Button>
                          )}
                          <button
                            onClick={() => handleOpenForm(deal)}
                            className="p-1.5 text-[#98A2B3] hover:text-[#1765FF] rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteDeal(deal.id)}
                            className="p-1.5 text-[#98A2B3] hover:text-red-600 rounded-lg"
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
                  <td colSpan={7} className="py-12 text-center text-xs text-[#98A2B3]">
                    Không tìm thấy cơ hội nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Deal Detail Sheet */}
      <Sheet
        isOpen={!!viewingDeal}
        onClose={() => setViewingDeal(null)}
        title="Chi tiết cơ hội kinh doanh"
        description={`Mã deal: #${viewingDeal?.id}`}
        width="lg"
      >
        {viewingDeal && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E6EBF2]">
              <h3 className="text-base font-bold text-[#101828]">{viewingDeal.title}</h3>
              <p className="text-xs text-[#475467] font-medium mt-0.5">
                {getCustomerById(viewingDeal.customerId)?.company}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-bold text-[#1765FF]">
                  {formatCurrency(viewingDeal.value, true)}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1765FF]">
                  Xác suất: {viewingDeal.probability}%
                </span>
              </div>
            </div>

            {/* Stage Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Giai đoạn bán hàng
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Mới', 'Đã liên hệ', 'Đề xuất', 'Đàm phán'] as DealStage[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      moveDealStage(viewingDeal.id, st);
                      setViewingDeal((prev) => (prev ? { ...prev, stage: st } : null));
                    }}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-semibold transition-all text-center',
                      viewingDeal.stage === st
                        ? 'bg-[#1765FF] text-white border-[#1765FF]'
                        : 'bg-white text-[#344054] border-[#E6EBF2] hover:bg-[#F8FAFC]'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions: Mark Won / Mark Lost */}
            <div className="p-3.5 rounded-xl border border-[#E6EBF2] bg-white space-y-2.5">
              <span className="block text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Đóng cơ hội
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1.5"
                  onClick={() => {
                    markDealWon(viewingDeal.id);
                    setViewingDeal(null);
                  }}
                >
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span>Đánh dấu Thắng</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                  onClick={() => {
                    setLostReasonDeal(viewingDeal);
                    setViewingDeal(null);
                  }}
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Đánh dấu Thua</span>
                </Button>
              </div>

              {viewingDeal.stage === 'Thắng' && (
                <Button
                  variant="primary"
                  className="w-full mt-2 gap-2 bg-[#059669] hover:bg-[#047857]"
                  onClick={() => {
                    handleCreateContractFromDeal(viewingDeal);
                    setViewingDeal(null);
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span>Tạo Hợp đồng từ cơ hội này</span>
                </Button>
              )}
            </div>

            {/* Details Table */}
            <div className="p-4 rounded-xl border border-[#E6EBF2] bg-white space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Nguồn lead</span>
                <span className="font-semibold text-[#101828]">{viewingDeal.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Người phụ trách</span>
                <span className="font-semibold text-[#101828]">
                  {getMemberById(viewingDeal.assigneeId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Hạn dự kiến chốt</span>
                <span className="font-semibold text-[#101828]">{viewingDeal.expectedCloseDate}</span>
              </div>
            </div>

            {viewingDeal.notes && (
              <div className="p-3.5 rounded-xl border border-[#E6EBF2] bg-[#F8FAFC] text-xs text-[#344054]">
                <h5 className="font-semibold text-[#101828] mb-1">Ghi chú:</h5>
                {viewingDeal.notes}
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Add / Edit Deal Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDeal ? 'Chỉnh sửa cơ hội' : 'Thêm cơ hội bán hàng'}
        description="Quản lý thông tin và tiến trình thương thảo với khách hàng."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveDeal} className="space-y-4">
          <Input
            label="Tên cơ hội"
            placeholder="Ví dụ: Triển khai CRM Enterprise"
            required
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">
                Khách hàng liên kết <span className="text-red-500">*</span>
              </label>
              <select
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Giá trị cơ hội (VNĐ)"
              type="number"
              min="0"
              step="1000000"
              placeholder="120000000"
              required
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              error={formErrors.value}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Giai đoạn</label>
              <select
                value={formStage}
                onChange={(e) => setFormStage(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
              >
                <option value="Mới">Mới</option>
                <option value="Đã liên hệ">Đã liên hệ</option>
                <option value="Đề xuất">Đề xuất</option>
                <option value="Đàm phán">Đàm phán</option>
              </select>
            </div>

            <Input
              label="Xác suất thành công (%)"
              type="number"
              min="0"
              max="100"
              placeholder="50"
              value={formProbability}
              onChange={(e) => setFormProbability(e.target.value)}
              error={formErrors.probability}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Người phụ trách</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hạn dự kiến chốt"
              type="date"
              value={formCloseDate}
              onChange={(e) => setFormCloseDate(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Nguồn cơ hội</label>
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
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#344054]">Ghi chú</label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Yêu cầu giải pháp, đối thủ cạnh tranh..."
              className="w-full p-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F2F4F7]">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingDeal ? 'Lưu thay đổi' : 'Thêm cơ hội'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lost Reason Modal */}
      <Modal
        isOpen={!!lostReasonDeal}
        onClose={() => setLostReasonDeal(null)}
        title="Đánh dấu cơ hội Thua"
        description="Ghi nhận nguyên nhân để cải thiện quy trình bán hàng."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#344054]">Lý do thua</label>
            <select
              value={lossReasonText}
              onChange={(e) => setLossReasonText(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
            >
              <option value="Không phù hợp ngân sách">Không phù hợp ngân sách</option>
              <option value="Chọn nhà cung cấp đối thủ">Chọn nhà cung cấp đối thủ</option>
              <option value="Chưa có nhu cầu cấp bách">Chưa có nhu cầu cấp bách</option>
              <option value="Thiếu tính năng quan trọng">Thiếu tính năng quan trọng</option>
              <option value="Lý do khác">Lý do khác</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2F4F7]">
            <Button variant="secondary" onClick={() => setLostReasonDeal(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (lostReasonDeal) {
                  markDealLost(lostReasonDeal.id, lossReasonText);
                  setLostReasonDeal(null);
                }
              }}
            >
              Xác nhận Thua
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
