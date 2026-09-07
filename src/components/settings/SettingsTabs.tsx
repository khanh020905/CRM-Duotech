'use client';

import React from 'react';

export type SettingsTabKey = 'profile' | 'workspace' | 'members' | 'notifications' | 'security';

interface SettingsTabsProps {
  activeTab: SettingsTabKey;
  onTabChange: (tab: SettingsTabKey) => void;
  hasUnsavedChanges?: boolean;
  onRequestSwitchTab?: (tab: SettingsTabKey) => void;
}

export function SettingsTabs({
  activeTab,
  onTabChange,
  hasUnsavedChanges = false,
  onRequestSwitchTab,
}: SettingsTabsProps) {
  const tabs: { key: SettingsTabKey; label: string }[] = [
    { key: 'profile', label: 'Hồ sơ cá nhân' },
    { key: 'workspace', label: 'Không gian làm việc' },
    { key: 'members', label: 'Thành viên' },
    { key: 'notifications', label: 'Thông báo' },
    { key: 'security', label: 'Bảo mật' },
  ];

  const handleTabClick = (key: SettingsTabKey) => {
    if (key === activeTab) return;
    if (hasUnsavedChanges && onRequestSwitchTab) {
      onRequestSwitchTab(key);
    } else {
      onTabChange(key);
    }
  };

  return (
    <div className="flex border-b border-[#E6EBF2] gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            className={`pb-3.5 text-xs sm:text-sm font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              isActive
                ? 'text-[#1765FF]'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1765FF] rounded-t-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
}
