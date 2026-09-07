'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { CalendarEvent, CalendarEventType } from '@/types/crm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/common/Avatar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  MoreHorizontal,
  Trash2,
  Edit2,
  AlertTriangle,
  Users,
  Video,
} from 'lucide-react';

export default function CalendarPage() {
  const {
    calendarEvents,
    customers,
    members,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    checkCalendarConflict,
    getCustomerById,
    getMemberById,
    showToast,
  } = useCRM();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState('2026-09-07'); // Default to Monday 07/09/2026

  // Form & Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEventType>('Demo');
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formAssigneeId, setFormAssigneeId] = useState(members[0]?.id || 'user-1');
  const [formDate, setFormDate] = useState('2026-09-07');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 7 days in week 07 - 13 tháng 9, 2026
  const weekDays = [
    { label: 'Thứ 2', dateNum: '07', fullDate: '2026-09-07' },
    { label: 'Thứ 3', dateNum: '08', fullDate: '2026-09-08' },
    { label: 'Thứ 4', dateNum: '09', fullDate: '2026-09-09' },
    { label: 'Thứ 5', dateNum: '10', fullDate: '2026-09-10' },
    { label: 'Thứ 6', dateNum: '11', fullDate: '2026-09-11' },
    { label: 'Thứ 7', dateNum: '12', fullDate: '2026-09-12' },
    { label: 'CN', dateNum: '13', fullDate: '2026-09-13' },
  ];

  // Hours 08:00 - 18:00
  const hours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  // Event counts
  const demoCount = calendarEvents.filter((e) => e.type === 'Demo').length;
  const tuVanCount = calendarEvents.filter((e) => e.type === 'Tư vấn').length;
  const noiBoCount = calendarEvents.filter((e) => e.type === 'Nội bộ').length;

  // Events for selected day in right panel
  const selectedDayEvents = useMemo(() => {
    return calendarEvents.filter((e) => e.date === selectedDate);
  }, [calendarEvents, selectedDate]);

  // Open Form
  const handleOpenForm = (slotDate?: string, slotHour?: string, event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormTitle(event.title);
      setFormType(event.type);
      setFormCustomerId(event.customerId || '');
      setFormAssigneeId(event.assigneeId);
      setFormDate(event.date);
      setFormStartTime(event.startTime);
      setFormEndTime(event.endTime);
      setFormLocation(event.locationOrLink || '');
      setFormNotes(event.notes || '');
    } else {
      setEditingEvent(null);
      setFormTitle('');
      setFormType('Demo');
      setFormCustomerId(customers[0]?.id || '');
      setFormAssigneeId(members[0]?.id || 'user-1');
      setFormDate(slotDate || selectedDate);
      const start = slotHour || '09:00';
      const endHourNum = parseInt(start.split(':')[0]) + 1;
      const end = `${String(endHourNum).padStart(2, '0')}:00`;
      setFormStartTime(start);
      setFormEndTime(end);
      setFormLocation('Google Meet');
      setFormNotes('');
    }
    setConflictWarning(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!formTitle.trim()) errs.title = 'Vui lòng nhập tiêu đề lịch hẹn';
    if (formStartTime >= formEndTime) {
      errs.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    // Check conflict
    const conflict = checkCalendarConflict(
      {
        title: formTitle,
        type: formType,
        customerId: formCustomerId || undefined,
        assigneeId: formAssigneeId,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
      },
      editingEvent?.id
    );

    if (conflict && !conflictWarning) {
      const staff = getMemberById(formAssigneeId);
      setConflictWarning(
        `Cảnh báo trùng lịch: Nhân sự ${staff?.name} đã có lịch "${conflict.title}" lúc ${conflict.startTime} - ${conflict.endTime} ngày ${conflict.date}. Bạn có muốn tiếp tục lưu?`
      );
      return;
    }

    const payload = {
      title: formTitle.trim(),
      type: formType,
      customerId: formCustomerId || undefined,
      assigneeId: formAssigneeId,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      locationOrLink: formLocation.trim() || undefined,
      notes: formNotes.trim() || undefined,
    };

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, payload);
    } else {
      addCalendarEvent(payload);
    }

    setIsFormOpen(false);
  };

  // Type styling
  const getTypeStyle = (type: CalendarEventType) => {
    switch (type) {
      case 'Demo':
        return {
          bg: 'bg-[#EFF6FF] border-l-4 border-[#1765FF] text-[#1E3A8A]',
          tag: 'text-[#1765FF]',
        };
      case 'Tư vấn':
        return {
          bg: 'bg-[#F5F3FF] border-l-4 border-[#7C3AED] text-[#4C1D95]',
          tag: 'text-[#7C3AED]',
        };
      case 'Nội bộ':
        return {
          bg: 'bg-[#ECFDF5] border-l-4 border-[#059669] text-[#064E3B]',
          tag: 'text-[#059669]',
        };
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-[#101828] tracking-tight leading-tight">
            Lịch hẹn
          </h1>
          <p className="text-sm text-[#667085] mt-1 font-normal">
            Quản lý cuộc họp và lịch chăm sóc khách hàng.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => handleOpenForm()}
          className="gap-2 shadow-sm shadow-blue-500/20 text-xs sm:text-sm h-10"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo lịch hẹn</span>
        </Button>
      </div>

      {/* Main Grid: Left Calendar (2 cols) + Right Panel (1 col) - Matching Image 4 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Section (3 cols on xl) */}
        <div className="xl:col-span-3 bg-white rounded-[12px] border border-[#E6EBF2] p-5 shadow-2xs">
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F2F4F7]">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDate('2026-09-07')}
                className="text-xs"
              >
                Hôm nay
              </Button>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg border border-[#E6EBF2] hover:bg-[#F8FAFC]">
                  <ChevronLeft className="w-4 h-4 text-[#667085]" />
                </button>
                <button className="p-1.5 rounded-lg border border-[#E6EBF2] hover:bg-[#F8FAFC]">
                  <ChevronRight className="w-4 h-4 text-[#667085]" />
                </button>
              </div>
              <span className="font-bold text-sm text-[#101828] ml-2">
                07 – 13 tháng 9, 2026
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-[#F1F4F9] rounded-lg border border-[#E6EBF2] text-xs font-semibold">
              <button
                onClick={() => setViewMode('day')}
                className={cn('px-3 py-1 rounded-[6px] transition-colors', viewMode === 'day' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]')}
              >
                Ngày
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={cn('px-3 py-1 rounded-[6px] transition-colors', viewMode === 'week' ? 'bg-[#1765FF] text-white shadow-xs' : 'text-[#667085]')}
              >
                Tuần
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn('px-3 py-1 rounded-[6px] transition-colors', viewMode === 'month' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]')}
              >
                Tháng
              </button>
            </div>
          </div>

          {/* Week Grid Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Days Row */}
              <div className="grid grid-cols-8 border-b border-[#E6EBF2] text-center text-xs font-semibold pb-3">
                <div className="text-[#667085] text-left pl-2">Giờ</div>
                {weekDays.map((day) => {
                  const isSelected = selectedDate === day.fullDate;
                  return (
                    <div
                      key={day.fullDate}
                      onClick={() => setSelectedDate(day.fullDate)}
                      className={cn(
                        'py-1.5 px-2 rounded-xl cursor-pointer transition-colors',
                        isSelected ? 'bg-[#EFF6FF] text-[#1765FF]' : 'hover:bg-[#F8FAFC] text-[#344054]'
                      )}
                    >
                      <span className="block text-[11px] font-medium">{day.label}</span>
                      <span className={cn('text-sm font-bold', isSelected && 'text-[#1765FF]')}>
                        {day.dateNum}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="divide-y divide-[#F2F4F7]">
                {hours.map((hour) => {
                  const hourNum = parseInt(hour.split(':')[0]);

                  return (
                    <div key={hour} className="grid grid-cols-8 min-h-[58px] items-stretch">
                      {/* Hour Label */}
                      <div className="text-[11px] text-[#98A2B3] font-mono pt-1 pl-2">
                        {hour}
                      </div>

                      {/* 7 Columns for Days */}
                      {weekDays.map((day) => {
                        // Find events in this date & hour slot
                        const slotEvents = calendarEvents.filter((e) => {
                          if (e.date !== day.fullDate) return false;
                          const eStartHour = parseInt(e.startTime.split(':')[0]);
                          return eStartHour === hourNum;
                        });

                        return (
                          <div
                            key={day.fullDate}
                            onClick={() => handleOpenForm(day.fullDate, hour)}
                            className="border-l border-[#F2F4F7] p-1 relative hover:bg-[#FAFAFC] cursor-pointer transition-colors group"
                          >
                            {slotEvents.map((evt) => {
                              const style = getTypeStyle(evt.type);
                              const customer = getCustomerById(evt.customerId || '');

                              return (
                                <div
                                  key={evt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenForm(undefined, undefined, evt);
                                  }}
                                  className={cn(
                                    'p-2 rounded-lg text-left shadow-2xs mb-1 transition-transform hover:scale-[1.02]',
                                    style.bg
                                  )}
                                >
                                  <p className="font-bold text-xs leading-tight truncate">
                                    {evt.title}
                                  </p>
                                  <p className="text-[10px] opacity-80 mt-0.5">
                                    {evt.startTime} – {evt.endTime}
                                  </p>
                                  <p className="text-[10px] font-medium opacity-90 truncate mt-0.5">
                                    {customer?.company || customer?.name || 'Nội bộ'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (1 col): Mini Calendar & Daily Schedule - Matching Image 4 */}
        <div className="space-y-5">
          {/* Mini Calendar Widget */}
          <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#101828]">Tháng 9, 2026</h3>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-[#F2F4F7] rounded">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#667085]" />
                </button>
                <button className="p-1 hover:bg-[#F2F4F7] rounded">
                  <ChevronRight className="w-3.5 h-3.5 text-[#667085]" />
                </button>
              </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 text-center text-[11px] gap-y-1">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                <span key={d} className="font-semibold text-[#98A2B3] py-1">
                  {d}
                </span>
              ))}
              {/* Padding empty days */}
              <span className="py-1"></span>
              {/* 1 to 30 */}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
                const dateStr = `2026-09-${String(d).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const isToday = d === 7;

                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      'py-1 rounded-full text-xs font-semibold transition-colors',
                      isSelected ? 'bg-[#1765FF] text-white' : isToday ? 'bg-[#EFF6FF] text-[#1765FF]' : 'text-[#344054] hover:bg-[#F8FAFC]'
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Event Legend Counts - Matching Image 4 */}
            <div className="mt-4 pt-3 border-t border-[#F2F4F7] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1765FF]" />
                  <span className="text-[#344054]">Demo</span>
                </div>
                <span className="font-semibold text-[#101828]">{demoCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                  <span className="text-[#344054]">Tư vấn</span>
                </div>
                <span className="font-semibold text-[#101828]">{tuVanCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                  <span className="text-[#344054]">Nội bộ</span>
                </div>
                <span className="font-semibold text-[#101828]">{noiBoCount}</span>
              </div>
            </div>
          </div>

          {/* Today's Schedule Card List - Matching Image 4 */}
          <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-4 shadow-2xs">
            <h3 className="font-bold text-xs text-[#101828] uppercase tracking-wider mb-3">
              Hôm nay • Thứ 2, 07 tháng 9, 2026
            </h3>

            <div className="space-y-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((evt) => {
                  const customer = getCustomerById(evt.customerId || '');
                  return (
                    <div
                      key={evt.id}
                      onClick={() => handleOpenForm(undefined, undefined, evt)}
                      className="p-3 rounded-xl border border-[#E6EBF2] bg-[#F8FAFC] hover:bg-white hover:shadow-2xs transition-all cursor-pointer flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="text-[11px] font-mono font-bold text-[#1765FF]">
                          {evt.startTime} – {evt.endTime}
                        </div>
                        <h4 className="font-semibold text-xs text-[#101828] mt-0.5">
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-[#667085] mt-0.5">
                          {customer?.company || 'Nội bộ'}
                        </p>
                      </div>
                      <button className="p-1 text-[#98A2B3] hover:text-[#344054]">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#98A2B3] text-center py-4">
                  Không có lịch hẹn nào trong ngày này.
                </p>
              )}
            </div>

            <button
              onClick={() => handleOpenForm(selectedDate)}
              className="w-full mt-3 text-xs font-semibold text-[#1765FF] hover:underline flex items-center justify-center gap-1 pt-2 border-t border-[#F2F4F7]"
            >
              <span>Xem tất cả lịch hẹn hôm nay ({selectedDayEvents.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Appointment Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEvent ? 'Chi tiết / Chỉnh sửa lịch hẹn' : 'Tạo lịch hẹn mới'}
        description="Lịch hẹn nội bộ quản lý cuộc họp và chăm sóc khách hàng."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          {conflictWarning && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <Input
            label="Tiêu đề cuộc hẹn"
            placeholder="Ví dụ: Demo sản phẩm CRM"
            required
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#344054]">Loại cuộc hẹn</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg"
              >
                <option value="Demo">Demo</option>
                <option value="Tư vấn">Tư vấn</option>
                <option value="Nội bộ">Nội bộ</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#344054]">Khách hàng</label>
              <select
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg"
              >
                <option value="">-- Cuộc họp nội bộ --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#344054]">Người chủ trì</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Ngày diễn ra"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <Input
              label="Giờ bắt đầu"
              type="time"
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
            />
            <Input
              label="Giờ kết thúc"
              type="time"
              value={formEndTime}
              onChange={(e) => setFormEndTime(e.target.value)}
              error={formErrors.endTime}
            />
          </div>

          <Input
            label="Địa điểm / Link họp trực tuyến"
            placeholder="Google Meet (meet.google.com/abc-xyz) hoặc Văn phòng khách hàng"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#344054]">Nội dung trao đổi</label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Ghi chú nội dung trọng tâm cần giải quyết..."
              className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7]">
            {editingEvent && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteCalendarEvent(editingEvent.id);
                  setIsFormOpen(false);
                }}
              >
                Xóa lịch
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary">
                {conflictWarning ? 'Vẫn lưu lịch hẹn' : editingEvent ? 'Lưu thay đổi' : 'Tạo lịch hẹn'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
