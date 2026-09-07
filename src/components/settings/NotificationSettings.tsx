'use client';

import React, { useState, useEffect } from 'react';
import { UserSettings, NotificationSettings as NotificationSettingsType } from '@/types/crm';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  Calendar,
  CheckSquare,
  FileText,
  ShieldAlert,
  Megaphone,
  Mail,
  Smartphone,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface NotificationSettingsProps {
  settings: UserSettings;
  onSave: (updatedSettings: Partial<UserSettings>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function NotificationSettings({
  settings,
  onSave,
  onDirtyChange,
}: NotificationSettingsProps) {
  const notifs = settings.notifications;

  const [taskReminders, setTaskReminders] = useState(notifs.taskReminders);
  const [taskDueReminders, setTaskDueReminders] = useState(notifs.taskDueReminders);
  const [calendarReminders, setCalendarReminders] = useState(notifs.calendarReminders);
  const [maintenanceReminders, setMaintenanceReminders] = useState(notifs.maintenanceReminders);
  const [contractStatusChanges, setContractStatusChanges] = useState(notifs.contractStatusChanges);
  const [productNewsletter, setProductNewsletter] = useState(notifs.productNewsletter);

  const [calendarTiming, setCalendarTiming] = useState(notifs.calendarTiming || '15');
  const [taskTiming, setTaskTiming] = useState(notifs.taskTiming || '1h');
  const [maintenanceTiming, setMaintenanceTiming] = useState(notifs.maintenanceTiming || '7');

  const isDirty =
    taskReminders !== notifs.taskReminders ||
    taskDueReminders !== notifs.taskDueReminders ||
    calendarReminders !== notifs.calendarReminders ||
    maintenanceReminders !== notifs.maintenanceReminders ||
    contractStatusChanges !== notifs.contractStatusChanges ||
    productNewsletter !== notifs.productNewsletter ||
    calendarTiming !== (notifs.calendarTiming || '15') ||
    taskTiming !== (notifs.taskTiming || '1h') ||
    maintenanceTiming !== (notifs.maintenanceTiming || '7');

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleReset = () => {
    setTaskReminders(notifs.taskReminders);
    setTaskDueReminders(notifs.taskDueReminders);
    setCalendarReminders(notifs.calendarReminders);
    setMaintenanceReminders(notifs.maintenanceReminders);
    setContractStatusChanges(notifs.contractStatusChanges);
    setProductNewsletter(notifs.productNewsletter);
    setCalendarTiming(notifs.calendarTiming || '15');
    setTaskTiming(notifs.taskTiming || '1h');
    setMaintenanceTiming(notifs.maintenanceTiming || '7');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      notifications: {
        taskReminders,
        taskDueReminders,
        calendarReminders,
        maintenanceReminders,
        contractStatusChanges,
        productNewsletter,
        calendarTiming: calendarTiming as any,
        taskTiming: taskTiming as any,
        maintenanceTiming: maintenanceTiming as any,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Kênh thông báo & Ghi chú demo */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Kênh thông báo</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Lựa chọn phương thức bạn muốn nhận thông báo từ Duotech CRM.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Trong ứng dụng */}
            <div className="p-4 bg-[#EFF6FF] border border-[#B2CCFF] rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-[#1765FF] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#101828]">Thông báo trong app</p>
                <p className="text-[11px] text-[#667085] mt-0.5">Hiển thị ở chuông thông báo (Đang bật)</p>
              </div>
            </div>

            {/* Email (Disabled demo) */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl flex items-start gap-3 opacity-60 cursor-not-allowed">
              <div className="w-8 h-8 rounded-lg bg-white text-[#667085] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#101828]">Email thông báo</p>
                <p className="text-[11px] text-[#667085] mt-0.5">Cần tích hợp SMTP server</p>
              </div>
            </div>

            {/* Push Mobile (Disabled demo) */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl flex items-start gap-3 opacity-60 cursor-not-allowed">
              <div className="w-8 h-8 rounded-lg bg-white text-[#667085] flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#101828]">Push Notifications</p>
                <p className="text-[11px] text-[#667085] mt-0.5">Cần cài ứng dụng di động</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>Lưu ý:</strong> Bản demo frontend chỉ kiểm tra và gửi thông báo khi tab ứng dụng đang mở trên trình duyệt.
            </span>
          </div>
        </div>

        {/* Card 2: Thiết lập chi tiết từng sự kiện & Thời điểm nhắc */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Quy tắc & Thời điểm nhắc nhở</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Tùy chỉnh thời gian thông báo trước cho từng sự kiện công việc và lịch hẹn.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[#F2F4F7] text-xs">
            {/* 1. Nhắc lịch hẹn khách hàng */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#101828]">Lịch hẹn sắp bắt đầu</p>
                  <p className="text-xs text-[#667085]">Nhận thông báo trước các cuộc họp demo, tư vấn.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                  <select
                    value={calendarTiming}
                    disabled={!calendarReminders}
                    onChange={(e) => setCalendarTiming(e.target.value as any)}
                    className="h-8 px-2.5 bg-[#F6F8FC] border border-[#D0D5DD] rounded-lg text-xs text-[#101828] focus:outline-none"
                  >
                    <option value="5">Trước 5 phút</option>
                    <option value="15">Trước 15 phút</option>
                    <option value="30">Trước 30 phút</option>
                    <option value="60">Trước 60 phút</option>
                  </select>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calendarReminders}
                    onChange={(e) => setCalendarReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
                </label>
              </div>
            </div>

            {/* 2. Công việc đến hạn / quá hạn */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#101828]">Công việc đến hạn / quá hạn</p>
                  <p className="text-xs text-[#667085]">Cảnh báo deadline công việc cần hoàn thành.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                  <select
                    value={taskTiming}
                    disabled={!taskDueReminders}
                    onChange={(e) => setTaskTiming(e.target.value as any)}
                    className="h-8 px-2.5 bg-[#F6F8FC] border border-[#D0D5DD] rounded-lg text-xs text-[#101828] focus:outline-none"
                  >
                    <option value="due">Đúng hạn</option>
                    <option value="1h">Trước 1 giờ</option>
                    <option value="1d">Trước 1 ngày</option>
                  </select>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taskDueReminders}
                    onChange={(e) => setTaskDueReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
                </label>
              </div>
            </div>

            {/* 3. Maintain sắp gia hạn */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#101828]">Bảo trì (Maintain) sắp gia hạn</p>
                  <p className="text-xs text-[#667085]">Nhắc nhở chuẩn bị hóa đơn gia hạn dịch vụ định kỳ.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                  <select
                    value={maintenanceTiming}
                    disabled={!maintenanceReminders}
                    onChange={(e) => setMaintenanceTiming(e.target.value as any)}
                    className="h-8 px-2.5 bg-[#F6F8FC] border border-[#D0D5DD] rounded-lg text-xs text-[#101828] focus:outline-none"
                  >
                    <option value="3">Trước 3 ngày</option>
                    <option value="7">Trước 7 ngày</option>
                    <option value="14">Trước 14 ngày</option>
                    <option value="30">Trước 30 ngày</option>
                  </select>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceReminders}
                    onChange={(e) => setMaintenanceReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
                </label>
              </div>
            </div>

            {/* 4. Hợp đồng thay đổi trạng thái */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#667085] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#101828]">Hợp đồng thay đổi trạng thái</p>
                  <p className="text-xs text-[#667085]">Thông báo khi hợp đồng chuyển sang Ký kết, Hoàn thành hoặc Bảo trì.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={contractStatusChanges}
                  onChange={(e) => setContractStatusChanges(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
              </label>
            </div>

            {/* 5. Bản tin sản phẩm */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#667085] flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#101828]">Bản tin sản phẩm & Mẹo</p>
                  <p className="text-xs text-[#667085]">Nhận tin tức tính năng mới và các mẹo sử dụng CRM hữu ích.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={productNewsletter}
                  onChange={(e) => setProductNewsletter(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="secondary"
              disabled={!isDirty}
              onClick={handleReset}
              className="text-xs font-semibold text-[#344054]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isDirty}
              className="text-xs font-semibold bg-[#1765FF] hover:bg-[#155BE5] text-white"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
