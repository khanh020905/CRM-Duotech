'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { cn } from '@/lib/utils';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export function WorkspaceSelect() {
  const { workspaces, activeWorkspace, activeWorkspaceId, switchWorkspace } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentName = activeWorkspace?.name || 'Duotech Solution';

  return (
    <>
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E6EBF2] bg-white hover:bg-[#F8FAFC] transition-colors text-left group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1765FF] shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-bold text-[#98A2B3] tracking-wider leading-none mb-1">
                Workspace
              </span>
              <span className="block text-xs font-semibold text-[#101828] truncate leading-none">
                {currentName}
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
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E6EBF2] rounded-xl shadow-xl py-1.5 z-40 animate-fade-in min-w-[210px]">
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#667085] uppercase tracking-wider">
              Không gian làm việc ({workspaces.length})
            </div>
            <div className="max-h-56 overflow-y-auto">
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspaceId;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F8FAFC] transition-colors',
                      isSelected ? 'bg-[#F0F7FF] text-[#1765FF] font-semibold' : 'text-[#344054]'
                    )}
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="block truncate">{ws.name}</span>
                      {ws.description && (
                        <span className="block text-[10px] text-[#98A2B3] truncate">{ws.description}</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1765FF] shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-[#F2F4F7] my-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full px-3 py-2 text-left text-xs text-[#1765FF] font-medium flex items-center gap-1.5 hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo workspace mới</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
