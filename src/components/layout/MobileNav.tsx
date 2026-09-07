'use client';

import React from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { AppSidebar } from './AppSidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="left" width="md">
      <div className="-m-6 h-full">
        <AppSidebar className="w-full h-full border-r-0" />
      </div>
    </Sheet>
  );
}
