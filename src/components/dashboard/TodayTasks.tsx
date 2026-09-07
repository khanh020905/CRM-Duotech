'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Clock, ArrowRight, Check } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { TaskPriority } from '@/types/crm';
import { cn } from '@/lib/utils';

export function TodayTasks() {
  const { tasks, toggleTask } = useCRM();

  // Show first 3-4 tasks on dashboard (matching screenshot)
  const displayedTasks = tasks.slice(0, 3);
  const remainingCount = tasks.filter((t) => !t.completed).length;

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Cao':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/60">
            Cao
          </span>
        );
      case 'Trung bình':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]/60">
            Trung bình
          </span>
        );
      case 'Thấp':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/60">
            Thấp
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#E6EBF2] p-5 sm:p-6 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="text-[#1765FF]">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-semibold text-[#101828]">
              Công việc hôm nay
            </h2>
          </div>
          <span className="text-xs font-medium text-[#667085]">
            {remainingCount} công việc
          </span>
        </div>

        {/* Task Items List */}
        <div className="space-y-4">
          {displayedTasks.map((task) => {
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-3.5 p-2 rounded-xl transition-colors',
                  task.completed ? 'opacity-60 bg-[#FAFAFC]' : 'hover:bg-[#F8FAFC]'
                )}
              >
                {/* Circle Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    'w-5 h-5 rounded-full border transition-all duration-200 flex items-center justify-center mt-0.5 shrink-0',
                    task.completed
                      ? 'bg-[#1765FF] border-[#1765FF] text-white'
                      : 'border-[#D0D5DD] hover:border-[#1765FF] bg-white'
                  )}
                  aria-label={task.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-xs sm:text-sm font-semibold text-[#101828] leading-snug',
                      task.completed && 'line-through text-[#98A2B3]'
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                    {task.company}
                  </p>
                </div>

                {/* Due Time & Priority */}
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-[#667085]">
                    <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                    <span>{task.dueTime}</span>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link to view all tasks */}
      <div className="mt-5 pt-3 border-t border-[#F2F4F7] text-center">
        <Link
          href="/tasks"
          className="text-xs font-medium text-[#1765FF] hover:text-[#1254DB] inline-flex items-center gap-1 group transition-colors"
        >
          <span>Xem tất cả công việc</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
