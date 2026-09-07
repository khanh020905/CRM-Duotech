'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { Task, TaskPriority, TaskStatus } from '@/types/crm';
import { matchSearch, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/common/Avatar';
import {
  CheckSquare,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  Check,
  ChevronRight,
  List,
  LayoutGrid,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowRight,
  X,
} from 'lucide-react';

export default function TasksPage() {
  const {
    tasks,
    customers,
    deals,
    members,
    settings,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getMemberById,
    getCustomerById,
    calendarEvents,
  } = useCRM();

  // Active top tab
  const [activeTab, setActiveTab] = useState<'mine' | 'all' | 'completed'>('mine');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'All'>('All');

  // Modals & Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formAssigneeId, setFormAssigneeId] = useState(settings.currentUser.id);
  const [formPriority, setFormPriority] = useState<TaskPriority>('Trung bình');
  const [formDueDate, setFormDueDate] = useState('2026-09-09');
  const [formDueTime, setFormDueTime] = useState('10:00');
  const [formStatus, setFormStatus] = useState<TaskStatus>('Cần làm');

  // Filter tasks based on tab & controls
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'mine' && t.assigneeId !== settings.currentUser.id) return false;
      if (activeTab === 'completed' && !t.completed) return false;

      // Assignee
      if (selectedAssignee !== 'All' && t.assigneeId !== selectedAssignee) return false;

      // Priority
      if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;

      // Search
      if (searchTerm.trim()) {
        const matches =
          matchSearch(t.title, searchTerm) ||
          (t.company && matchSearch(t.company, searchTerm)) ||
          (t.description && matchSearch(t.description, searchTerm));
        if (!matches) return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedAssignee, selectedPriority, searchTerm, settings.currentUser.id]);

  // Group tasks for list view (Matching Image 3)
  const todayStr = '2026-09-09'; // mock today date

  const overdueTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.completed && t.dueDate < todayStr);
  }, [filteredTasks, todayStr]);

  const todayTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.dueDate === todayStr);
  }, [filteredTasks, todayStr]);

  const upcomingTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.completed && t.dueDate > todayStr);
  }, [filteredTasks, todayStr]);

  // Today Progress Metrics
  const allTodayTasks = useMemo(() => tasks.filter((t) => t.dueDate === todayStr), [tasks, todayStr]);
  const completedTodayCount = allTodayTasks.filter((t) => t.completed).length;
  const totalTodayCount = allTodayTasks.length || 6;
  const remainingTodayCount = totalTodayCount - completedTodayCount;
  const progressPercent = Math.round((completedTodayCount / totalTodayCount) * 100);

  // Today upcoming calendar events for panel
  const upcomingEventsToday = useMemo(() => {
    return calendarEvents.filter((e) => e.date === '2026-09-07' || e.date === todayStr).slice(0, 2);
  }, [calendarEvents, todayStr]);

  // Open Form
  const handleOpenForm = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormTitle(task.title);
      setFormDescription(task.description || '');
      setFormCustomerId(task.customerId || '');
      setFormAssigneeId(task.assigneeId);
      setFormPriority(task.priority);
      setFormDueDate(task.dueDate);
      setFormDueTime(task.dueTime);
      setFormStatus(task.status);
    } else {
      setEditingTask(null);
      setFormTitle('');
      setFormDescription('');
      setFormCustomerId(customers[0]?.id || '');
      setFormAssigneeId(settings.currentUser.id);
      setFormPriority('Trung bình');
      setFormDueDate(todayStr);
      setFormDueTime('14:00');
      setFormStatus('Cần làm');
    }
    setIsFormOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const customer = getCustomerById(formCustomerId);

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        customerId: formCustomerId || undefined,
        company: customer?.company,
        assigneeId: formAssigneeId,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        status: formStatus,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        customerId: formCustomerId || undefined,
        company: customer?.company || 'Nội bộ',
        assigneeId: formAssigneeId,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        status: formStatus,
        completed: false,
      });
    }

    setIsFormOpen(false);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Cao':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/60">
            Cao
          </span>
        );
      case 'Trung bình':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]/60">
            Trung bình
          </span>
        );
      case 'Thấp':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/60">
            Thấp
          </span>
        );
    }
  };

  // Helper render a task item matching Image 3
  const renderTaskItem = (task: Task) => {
    const assignee = getMemberById(task.assigneeId);
    const customer = task.customerId ? getCustomerById(task.customerId) : null;
    const isOverdue = !task.completed && task.dueDate < todayStr;

    return (
      <div
        key={task.id}
        className={cn(
          'flex items-center justify-between p-3.5 rounded-xl border border-[#E6EBF2] bg-white hover:bg-[#F8FAFC] transition-all group',
          task.completed && 'opacity-60 bg-[#FAFAFC]'
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Circular checkbox */}
          <button
            type="button"
            onClick={() => toggleTask(task.id)}
            className={cn(
              'w-5 h-5 rounded-full border transition-all flex items-center justify-center shrink-0',
              task.completed
                ? 'bg-[#1765FF] border-[#1765FF] text-white'
                : 'border-[#D0D5DD] hover:border-[#1765FF] bg-white'
            )}
          >
            {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          <div className="min-w-0">
            <h4
              className={cn(
                'text-xs sm:text-sm font-semibold text-[#101828] leading-tight truncate',
                task.completed && 'line-through text-[#98A2B3]'
              )}
            >
              {task.title}
            </h4>
            <p className="text-[11px] text-[#667085] mt-0.5 truncate">
              {task.company || customer?.company || 'Nội bộ'}
            </p>
          </div>
        </div>

        {/* Priority & Due Date & Assignee */}
        <div className="flex items-center gap-4 shrink-0 pl-3">
          {getPriorityBadge(task.priority)}

          <div className="text-right">
            <span
              className={cn(
                'text-xs font-semibold block',
                isOverdue ? 'text-red-600' : 'text-[#344054]'
              )}
            >
              {task.dueDate === todayStr ? task.dueTime : `${task.dueDate.slice(8, 10)}/${task.dueDate.slice(5, 7)}/${task.dueDate.slice(0, 4)}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar name={assignee?.name || ''} src={assignee?.avatarUrl} size="sm" />
            <span className="text-xs font-medium text-[#344054] hidden sm:inline">
              {assignee?.name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOpenForm(task)}
              className="p-1 text-[#98A2B3] hover:text-[#1765FF] rounded"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTaskToDelete(task)}
              className="p-1 text-[#98A2B3] hover:text-red-600 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-[#101828] tracking-tight leading-tight">
            Công việc
          </h1>
          <p className="text-sm text-[#667085] mt-1 font-normal">
            Sắp xếp ưu tiên và theo dõi tiến độ mỗi ngày.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => handleOpenForm()}
          className="gap-2 shadow-sm shadow-blue-500/20 text-xs sm:text-sm h-10"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo công việc</span>
        </Button>
      </div>

      {/* Top Filter Tabs & View Toggle - Matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#E6EBF2] pb-3">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('mine')}
            className={cn(
              'pb-3 border-b-2 transition-colors',
              activeTab === 'mine' ? 'border-[#1765FF] text-[#1765FF]' : 'border-transparent text-[#667085] hover:text-[#101828]'
            )}
          >
            Công việc của tôi
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'pb-3 border-b-2 transition-colors',
              activeTab === 'all' ? 'border-[#1765FF] text-[#1765FF]' : 'border-transparent text-[#667085] hover:text-[#101828]'
            )}
          >
            Tất cả công việc
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={cn(
              'pb-3 border-b-2 transition-colors',
              activeTab === 'completed' ? 'border-[#1765FF] text-[#1765FF]' : 'border-transparent text-[#667085] hover:text-[#101828]'
            )}
          >
            Đã hoàn thành
          </button>
        </div>

        <div className="inline-flex p-1 bg-[#F1F4F9] rounded-lg border border-[#E6EBF2]">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors',
              viewMode === 'list' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>Danh sách</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors',
              viewMode === 'kanban' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bảng</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-3.5 mb-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm công việc..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E6EBF2] rounded-lg text-[#101828] focus:outline-none focus:border-[#1765FF]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-[#E6EBF2] rounded-lg text-[#344054] font-medium"
          >
            <option value="All">Tất cả người phụ trách</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as any)}
            className="h-9 px-3 text-xs bg-white border border-[#E6EBF2] rounded-lg text-[#344054] font-medium"
          >
            <option value="All">Tất cả mức ưu tiên</option>
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thấp">Thấp</option>
          </select>

          <div className="h-9 px-3 bg-white border border-[#E6EBF2] rounded-lg flex items-center gap-1.5 text-xs text-[#344054]">
            <Calendar className="w-3.5 h-3.5 text-[#667085]" />
            <span>Tháng 9, 2026</span>
          </div>
        </div>
      </div>

      {/* Main 2:1 Layout - Matching Image 3 */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left Column (2 cols): Grouped List */}
          <div className="xl:col-span-2 space-y-6">
            {/* Group 1: Quá hạn */}
            {overdueTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-3.5 py-2 rounded-xl border border-[#FECACA]/50">
                  <AlertCircle className="w-4 h-4" />
                  <span>Quá hạn ({overdueTasks.length})</span>
                </div>
                <div className="space-y-2.5">
                  {overdueTasks.map(renderTaskItem)}
                </div>
              </div>
            )}

            {/* Group 2: Hôm nay */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1765FF] bg-[#EFF6FF] px-3.5 py-2 rounded-xl border border-[#BFDBFE]/50">
                <Clock className="w-4 h-4" />
                <span>Hôm nay ({todayTasks.length})</span>
              </div>
              <div className="space-y-2.5">
                {todayTasks.length > 0 ? (
                  todayTasks.map(renderTaskItem)
                ) : (
                  <p className="text-xs text-[#98A2B3] p-4 text-center">Không có công việc nào trong hôm nay.</p>
                )}
              </div>
            </div>

            {/* Group 3: Sắp tới */}
            {upcomingTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#475467] bg-[#F1F5F9] px-3.5 py-2 rounded-xl border border-[#E2E8F0]">
                  <Calendar className="w-4 h-4" />
                  <span>Sắp tới ({upcomingTasks.length})</span>
                </div>
                <div className="space-y-2.5">
                  {upcomingTasks.map(renderTaskItem)}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 col): Progress Panel & Next Appointments - Matching Image 3 */}
          <div className="space-y-5">
            {/* Card 1: Tiến độ hôm nay */}
            <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#101828]">Tiến độ hôm nay</h3>
                <span className="text-xs text-[#667085]">Thứ Tư, 09/09/2026</span>
              </div>

              <div className="flex items-center gap-5 my-3">
                {/* Circular progress SVG */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#F1F4F9"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#1765FF"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-[#101828]">
                      {completedTodayCount}/{totalTodayCount}
                    </span>
                    <span className="text-[10px] text-[#667085]">hoàn thành</span>
                  </div>
                </div>

                {/* Progress breakdown */}
                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-[#101828]">Còn lại {remainingTodayCount} công việc</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1765FF]" />
                    <span>Đã hoàn thành: {completedTodayCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
                    <span>Chưa hoàn thành: {remainingTodayCount}</span>
                  </div>
                  <div className="pt-1 border-t border-[#F2F4F7] font-semibold text-[#101828]">
                    Tổng cộng: {totalTodayCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Lịch tiếp theo - Matching Image 3 */}
            <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#101828]">Lịch tiếp theo</h3>
                <Link
                  href="/calendar"
                  className="text-xs font-semibold text-[#1765FF] hover:underline flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 text-xs">
                  <div className="font-bold text-[#1765FF] pt-0.5">14:00</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#101828]">Demo sản phẩm</p>
                    <p className="text-[11px] text-[#667085]">Công ty Thành Phát</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1765FF]">
                    Sắp diễn ra
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs pt-3 border-t border-[#F2F4F7]">
                  <div className="font-bold text-[#667085] pt-0.5">16:30</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#101828]">Trao đổi hợp đồng</p>
                    <p className="text-[11px] text-[#667085]">Công ty Minh Gia</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    Còn 2 giờ
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Banner Xem lịch của bạn - Matching Image 3 */}
            <Link
              href="/calendar"
              className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[12px] p-4 flex items-center justify-between hover:bg-[#E0EFFF] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1765FF] text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Xem lịch của bạn</h4>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Xem chi tiết lịch hẹn và đồng bộ để không bỏ lỡ công việc.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1765FF] group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['Cần làm', 'Đang làm', 'Hoàn thành'] as TaskStatus[]).map((status) => {
            const statusTasks = filteredTasks.filter((t) => t.status === status);
            return (
              <div key={status} className="bg-[#F8FAFC] border border-[#E6EBF2] rounded-2xl p-4 min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6EBF2]">
                  <span className="font-bold text-sm text-[#101828]">{status}</span>
                  <span className="text-xs font-bold text-[#667085]">{statusTasks.length}</span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {statusTasks.map(renderTaskItem)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTask ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
        description="Lập kế hoạch và phân công xử lý cho thành viên đội ngũ."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Tiêu đề công việc"
            placeholder="Ví dụ: Gọi điện tư vấn gói CRM"
            required
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Khách hàng liên kết</label>
              <select
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
              >
                <option value="">-- Không chọn / Nội bộ --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Người thực hiện</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#344054]">Mức độ ưu tiên</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
              >
                <option value="Cao">Cao</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Thấp">Thấp</option>
              </select>
            </div>

            <Input
              label="Hạn hoàn thành"
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
            />

            <Input
              label="Giờ đến hạn"
              type="time"
              value={formDueTime}
              onChange={(e) => setFormDueTime(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#344054]">Ghi chú chi tiết</label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Yêu cầu đầu ra hoặc thông tin cần chuẩn bị..."
              className="w-full p-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2F4F7]">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? 'Lưu thay đổi' : 'Tạo việc'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        maxWidth="sm"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center text-center p-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#101828]">Xóa công việc</h3>
          <p className="text-xs text-[#667085] mt-2 mb-5 leading-relaxed">
            Bạn có chắc chắn muốn xóa công việc <strong>{taskToDelete?.title}</strong>?
          </p>
          <div className="flex items-center gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setTaskToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                if (taskToDelete) {
                  deleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                }
              }}
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
