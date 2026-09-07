'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { cn } from '@/lib/utils';

export function WorkspaceSelect() {
  const { workspace, setWorkspace, showToast } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const workspaces = [
    'Công ty TNHH Demo',
    'Chi nhánh Hà Nội',
    'Chi nhánh TP. Hồ Chí Minh',
    'Khối Doanh nghiệp VIP',
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E6EBF2] bg-white hover:bg-[#F8FAFC] transition-colors text-left group shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#475467] shrink-0 group-hover:text-[#1765FF] group-hover:border-[#BFDBFE] transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-semibold text-[#98A2B3] tracking-wider leading-none mb-1">
              Workspace
            </span>
            <span className="block text-xs font-semibold text-[#101828] truncate leading-none">
              {workspace}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#98A2B3] transition-transform duration-200 shrink-0 ml-1',
            isOpen && 'rotate-180 text-[#1765FF]'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E6EBF2] rounded-xl shadow-xl py-1.5 z-40 animate-fade-in">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
            Chọn Workspace
          </div>
          {workspaces.map((ws) => (
            <button
              key={ws}
              type="button"
              onClick={() => {
                setWorkspace(ws);
                setIsOpen(false);
                showToast('Chuyển workspace thành công', ws, 'info');
              }}
              className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F8FAFC] text-[#344054] transition-colors"
            >
              <span className={cn('truncate', ws === workspace && 'font-semibold text-[#1765FF]')}>
                {ws}
              </span>
              {ws === workspace && <Check className="w-4 h-4 text-[#1765FF] shrink-0" />}
            </button>
          ))}
          <div className="border-t border-[#F2F4F7] my-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                showToast('Tính năng tạo workspace', 'Tính năng đang được phát triển', 'info');
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-[#1765FF] font-medium flex items-center gap-1.5 hover:bg-[#EFF6FF] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo workspace mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
