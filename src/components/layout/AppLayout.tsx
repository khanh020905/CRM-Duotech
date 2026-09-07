'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Toast } from '@/components/ui/Toast';
import { CommandMenu } from '@/components/dashboard/CommandMenu';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex text-[#101828]">
      {/* Desktop Sidebar */}
      <AppSidebar className="hidden xl:flex" />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Command Menu & Toast Notifications */}
      <CommandMenu />
      <Toast />
    </div>
  );
}
