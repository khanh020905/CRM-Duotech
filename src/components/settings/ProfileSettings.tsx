'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserSettings, ProfileSettings as ProfileSettingsType } from '@/types/crm';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  User,
  Building2,
  Calendar,
  CheckSquare,
  Megaphone,
  Check,
  AlertCircle,
  Camera,
  Trash2,
} from 'lucide-react';

interface ProfileSettingsProps {
  settings: UserSettings;
  onSave: (updatedSettings: Partial<UserSettings>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ProfileSettings({
  settings,
  onSave,
  onDirtyChange,
}: ProfileSettingsProps) {
  // Form fields
  const [name, setName] = useState(settings.profile?.name || settings.currentUser.name);
  const [email, setEmail] = useState(settings.profile?.email || settings.currentUser.email);
  const [phone, setPhone] = useState(settings.profile?.phone || settings.currentUser.phone);
  const [title, setTitle] = useState(settings.profile?.title || 'Quản lý kinh doanh');
  const [bio, setBio] = useState(
    settings.profile?.bio ||
      'Tôi là Quản lý kinh doanh tại Duotech CRM, đam mê xây dựng mối quan hệ khách hàng bền vững và thúc đẩy tăng trưởng doanh thu.'
  );
  const [avatarUrl, setAvatarUrl] = useState(settings.profile?.avatarUrl || settings.currentUser.avatarUrl);
  const [language, setLanguage] = useState(settings.profile?.language || 'Tiếng Việt');
  const [timezone, setTimezone] = useState(settings.profile?.timezone || '(UTC+07:00) Bangkok, Hà Nội');

  // Quick notifications
  const [calendarReminders, setCalendarReminders] = useState(settings.notifications.calendarReminders);
  const [taskDueReminders, setTaskDueReminders] = useState(settings.notifications.taskDueReminders);
  const [productNewsletter, setProductNewsletter] = useState(settings.notifications.productNewsletter);

  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dirty check
  const isDirty =
    name !== (settings.profile?.name || settings.currentUser.name) ||
    email !== (settings.profile?.email || settings.currentUser.email) ||
    phone !== (settings.profile?.phone || settings.currentUser.phone) ||
    title !== (settings.profile?.title || 'Quản lý kinh doanh') ||
    bio !== (settings.profile?.bio || '') ||
    avatarUrl !== (settings.profile?.avatarUrl || settings.currentUser.avatarUrl) ||
    language !== (settings.profile?.language || 'Tiếng Việt') ||
    timezone !== (settings.profile?.timezone || '(UTC+07:00) Bangkok, Hà Nội');

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Handle Avatar Change
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WebP');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Dung lượng ảnh tối đa là 2 MB');
      return;
    }

    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setName(settings.profile?.name || settings.currentUser.name);
    setEmail(settings.profile?.email || settings.currentUser.email);
    setPhone(settings.profile?.phone || settings.currentUser.phone);
    setTitle(settings.profile?.title || 'Quản lý kinh doanh');
    setBio(settings.profile?.bio || '');
    setAvatarUrl(settings.profile?.avatarUrl || settings.currentUser.avatarUrl);
    setLanguage(settings.profile?.language || 'Tiếng Việt');
    setTimezone(settings.profile?.timezone || '(UTC+07:00) Bangkok, Hà Nội');
    setAvatarError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      profile: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: settings.profile?.role || settings.currentUser.role || 'Quản trị viên',
        title: title.trim(),
        bio: bio.trim(),
        avatarUrl,
        language,
        timezone,
        isEmailVerified: true,
      },
      currentUser: {
        ...settings.currentUser,
        name: name.trim(),
        avatarUrl,
        email: email.trim(),
        phone: phone.trim(),
      },
    });
  };

  // Toggle quick notifications immediately
  const handleToggleNotification = (key: 'calendarReminders' | 'taskDueReminders' | 'productNewsletter', val: boolean) => {
    if (key === 'calendarReminders') setCalendarReminders(val);
    if (key === 'taskDueReminders') setTaskDueReminders(val);
    if (key === 'productNewsletter') setProductNewsletter(val);

    onSave({
      notifications: {
        ...settings.notifications,
        [key]: val,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Profile Form + Display Options (~65% = 8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Card 1: Thông tin cá nhân */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs">
          <div className="mb-5">
            <h3 className="text-base font-bold text-[#101828]">Thông tin cá nhân</h3>
            <p className="text-xs text-[#667085] mt-0.5">Cập nhật thông tin hồ sơ của bạn.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar Row */}
            <div className="flex items-center gap-4">
              <Avatar name={name} src={avatarUrl} size="lg" className="w-16 h-16 text-lg ring-2 ring-[#E6EBF2]" />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold border-[#1765FF] text-[#1765FF] hover:bg-[#EFF6FF]"
                  >
                    Thay ảnh
                  </Button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(undefined)}
                      className="p-1.5 text-[#667085] hover:text-[#DC2626] rounded-lg transition-colors"
                      title="Xóa ảnh đại diện"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#667085]">JPG, PNG. Tối đa 2 MB.</p>
                {avatarError && <p className="text-[11px] text-[#DC2626] font-medium">{avatarError}</p>}
              </div>
            </div>

            {/* Inputs Grid: 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Họ và tên <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Email <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
                />
              </div>

              {/* Chức danh */}
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Chức danh
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
                />
              </div>
            </div>

            {/* Giới thiệu */}
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Giới thiệu
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF] resize-none"
              />
            </div>

            {/* Action Buttons matching Image 1: Right aligned Hủy & Lưu thay đổi */}
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
                disabled={!isDirty || !name.trim()}
                className="text-xs font-semibold bg-[#1765FF] hover:bg-[#155BE5] text-white"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>

        {/* Card 2: Tùy chọn hiển thị */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#101828]">Tùy chọn hiển thị</h3>
            <p className="text-xs text-[#667085] mt-0.5">Cá nhân hóa trải nghiệm sử dụng Duotech CRM.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Ngôn ngữ
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              >
                <option value="Tiếng Việt">Tiếng Việt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Múi giờ
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20 focus:border-[#1765FF]"
              >
                <option value="(UTC+07:00) Bangkok, Hà Nội">(UTC+07:00) Bangkok, Hà Nội</option>
                <option value="(UTC+08:00) Singapore, Kuala Lumpur">(UTC+08:00) Singapore, Kuala Lumpur</option>
                <option value="(UTC+09:00) Tokyo, Seoul">(UTC+09:00) Tokyo, Seoul</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Account Info & Quick Notifications (~35% = 4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Card 1: Tài khoản */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Tài khoản</h3>
            <p className="text-xs text-[#667085] mt-0.5">Thông tin về tài khoản và quyền truy cập của bạn.</p>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Email with Verified Badge */}
            <div className="flex items-center justify-between gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E6EBF2]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E6EBF2] flex items-center justify-center text-[#667085] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#667085] block leading-none">Email</span>
                  <span className="font-semibold text-[#101828] truncate block mt-0.5">{email}</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] shrink-0">
                <Check className="w-3 h-3" /> Đã xác thực
              </span>
            </div>

            {/* Role */}
            <div className="flex items-center gap-2.5 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E6EBF2]">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E6EBF2] flex items-center justify-center text-[#667085] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#667085] block leading-none">Vai trò</span>
                <span className="font-semibold text-[#101828] block mt-0.5">
                  {settings.profile?.role || settings.currentUser.role || 'Quản trị viên'}
                </span>
              </div>
            </div>

            {/* Workspace */}
            <div className="flex items-center gap-2.5 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E6EBF2]">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E6EBF2] flex items-center justify-center text-[#667085] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#667085] block leading-none">Không gian làm việc</span>
                <span className="font-semibold text-[#101828] block mt-0.5">
                  {settings.workspaceInfo?.name || 'Công ty TNHH Demo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Thông báo nhanh */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Thông báo nhanh</h3>
            <p className="text-xs text-[#667085] mt-0.5">Quản lý các loại thông báo quan trọng.</p>
          </div>

          <div className="space-y-4 text-xs divide-y divide-[#F2F4F7]">
            {/* 1. Nhắc lịch hẹn */}
            <div className="flex items-center justify-between gap-3 pt-2 first:pt-0">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#667085] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#101828]">Nhắc lịch hẹn</p>
                  <p className="text-[11px] text-[#667085]">Nhận thông báo trước khi diễn ra lịch hẹn.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={calendarReminders}
                  onChange={(e) => handleToggleNotification('calendarReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
              </label>
            </div>

            {/* 2. Công việc đến hạn */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-[#667085] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#101828]">Công việc đến hạn</p>
                  <p className="text-[11px] text-[#667085]">Nhận thông báo về các công việc sắp đến hạn.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={taskDueReminders}
                  onChange={(e) => handleToggleNotification('taskDueReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
              </label>
            </div>

            {/* 3. Bản tin sản phẩm */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="flex items-start gap-2.5">
                <Megaphone className="w-4 h-4 text-[#667085] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#101828]">Bản tin sản phẩm</p>
                  <p className="text-[11px] text-[#667085]">
                    Nhận thông tin cập nhật về tính năng mới, mẹo sử dụng và các thông báo quan trọng.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={productNewsletter}
                  onChange={(e) => handleToggleNotification('productNewsletter', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1765FF]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
