'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Filter,
  FileText,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { WorkspaceSelect } from './WorkspaceSelect';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { uncompletedTasksCount, settings } = useCRM();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/customers',
      label: 'Khách hàng',
      icon: Users,
      badge: null,
    },
    {
      href: '/deals',
      label: 'Cơ hội',
      icon: Filter,
      badge: null,
    },
    {
      href: '/contracts',
      label: 'Hợp đồng',
      icon: FileText,
      badge: null,
    },
    {
      href: '/tasks',
      label: 'Công việc',
      icon: CheckSquare,
      badge: uncompletedTasksCount > 0 ? uncompletedTasksCount : null,
    },
    {
      href: '/calendar',
      label: 'Lịch hẹn',
      icon: Calendar,
      badge: null,
    },
    {
      href: '/reports',
      label: 'Báo cáo',
      icon: BarChart2,
      badge: null,
    },
  ];

  return (
    <aside
      className={cn(
        'w-[240px] bg-white border-r border-[#E6EBF2] flex flex-col h-screen select-none shrink-0 sticky top-0 z-30',
        className
      )}
    >
      {/* Top Header: Logo */}
      <div className="h-16 px-5 flex items-center border-b border-[#F2F4F7]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {/* Stylized Duotech CRM Logo Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1765FF] to-[#3B82F6] flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 4h6a7 7 0 0 1 7 7v2a7 7 0 0 1-7 7H6V4z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-[#101828] tracking-tight">Duotech CRM</span>
        </Link>
      </div>

      {/* Workspace Selector */}
      <div className="px-4 pt-4 pb-3">
        <WorkspaceSelect />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group text-left',
                isActive
                  ? 'bg-[#EAF2FF] text-[#1765FF]'
                  : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#101828]'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-[#1765FF]' : 'text-[#667085] group-hover:text-[#101828]'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && (
                <span className="inline-flex items-center justify-center px-1.5 min-w-[20px] h-5 rounded-full text-[11px] font-bold bg-[#DC2626] text-white shrink-0 shadow-2xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Settings & User Profile */}
      <div className="p-3 border-t border-[#F2F4F7] space-y-2">
        <Link
          href="/settings"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-[#EAF2FF] text-[#1765FF]'
              : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#101828]'
          )}
        >
          <Settings className={cn('w-5 h-5', pathname === '/settings' ? 'text-[#1765FF]' : 'text-[#667085]')} />
          <span>Cài đặt</span>
        </Link>

        {/* User Card */}
        <Link
          href="/settings"
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E6EBF2] transition-colors text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              name={settings.currentUser.name}
              src={settings.currentUser.avatarUrl}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#101828] truncate leading-tight">
                {settings.currentUser.name}
              </p>
              <p className="text-[11px] text-[#667085] truncate leading-tight mt-0.5">
                {settings.currentUser.email}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#667085] shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
