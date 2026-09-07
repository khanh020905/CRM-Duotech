'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, CheckCircle2, Clock } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onToggleMobileNav?: () => void;
}

export function Topbar({ onToggleMobileNav }: TopbarProps) {
  const router = useRouter();
  const { setIsCommandMenuOpen, settings } = useCRM();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: '1',
      title: 'Hợp đồng mới được xác nhận',
      desc: 'Công ty Thành Phát đã chuyển khoản 220 triệu',
      time: '10 phút trước',
      read: false,
    },
    {
      id: '2',
      title: 'Lịch hẹn sắp tới',
      desc: 'Họp tư vấn giải pháp với Công ty CP Việt Nhật',
      time: '1 giờ trước',
      read: false,
    },
    {
      id: '3',
      title: 'Cập nhật trạng thái lead',
      desc: 'Công ty Minh Gia chuyển sang Đang đàm phán',
      time: '3 giờ trước',
      read: true,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-[#E6EBF2] px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="xl:hidden p-2 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar - Exactly matching screenshot */}
        <button
          type="button"
          onClick={() => setIsCommandMenuOpen(true)}
          className="w-full max-w-md h-10 px-3.5 bg-[#F6F8FC] hover:bg-[#EEF2F6] border border-[#E6EBF2] rounded-[10px] flex items-center justify-between text-left transition-colors group shadow-2xs"
        >
          <div className="flex items-center gap-2.5 text-[#667085] group-hover:text-[#344054]">
            <Search className="w-4 h-4 text-[#98A2B3] group-hover:text-[#1765FF] transition-colors" />
            <span className="text-xs sm:text-sm text-[#98A2B3]">
              Tìm khách hàng, công ty...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-[#667085] bg-white border border-[#D0D5DD] rounded-md shadow-2xs">
            ⌘ K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] rounded-lg transition-colors"
            aria-label="Thông báo"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E6EBF2] py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2.5 border-b border-[#F2F4F7] flex items-center justify-between">
                <span className="font-semibold text-sm text-[#101828]">Thông báo mới</span>
                <span className="text-[11px] font-medium text-[#1765FF] hover:underline cursor-pointer">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="divide-y divide-[#F2F4F7] max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex gap-3',
                      !n.read && 'bg-[#F9FBFF]'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1765FF] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#101828] leading-snug">{n.title}</p>
                      <p className="text-[11px] text-[#667085] mt-0.5 line-clamp-2">{n.desc}</p>
                      <span className="text-[10px] text-[#98A2B3] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          type="button"
          onClick={() => router.push('/settings')}
          className="focus:outline-none focus:ring-2 focus:ring-[#1765FF]/40 rounded-full"
          title={`Tài khoản ${settings.currentUser.name}`}
        >
          <Avatar
            name={settings.currentUser.name}
            src={settings.currentUser.avatarUrl}
            size="md"
            className="ring-2 ring-white shadow-xs cursor-pointer hover:opacity-90"
          />
        </button>
      </div>
    </header>
  );
}
