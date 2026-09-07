'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/context/CRMContext';
import { UserSettings } from '@/types/crm';
import { SettingsTabs, SettingsTabKey } from '@/components/settings/SettingsTabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { WorkspaceSettings } from '@/components/settings/WorkspaceSettings';
import { MembersSettings } from '@/components/settings/MembersSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    settings,
    members,
    updateUserSettings,
    addMember,
    updateMember,
    canDisableMember,
    toggleMemberStatus,
    reassignMemberWork,
  } = useCRM();

  // Tab State
  const tabFromQuery = (searchParams.get('tab') as SettingsTabKey) || 'profile';
  const [activeTab, setActiveTab] = useState<SettingsTabKey>(tabFromQuery);

  // Unsaved changes tracking
  const [isDirty, setIsDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<SettingsTabKey | null>(null);

  // Sync tab with URL query parameter
  useEffect(() => {
    const qTab = searchParams.get('tab') as SettingsTabKey;
    if (qTab && ['profile', 'workspace', 'members', 'notifications', 'security'].includes(qTab)) {
      setActiveTab(qTab);
    }
  }, [searchParams]);

  const handleSwitchTab = (newTab: SettingsTabKey) => {
    setActiveTab(newTab);
    setIsDirty(false);
    setPendingTab(null);
    router.replace(`/settings?tab=${newTab}`, { scroll: false });
  };

  const handleRequestSwitchTab = (targetTab: SettingsTabKey) => {
    if (isDirty) {
      setPendingTab(targetTab);
    } else {
      handleSwitchTab(targetTab);
    }
  };

  const handleSaveSettings = (updated: Partial<UserSettings>) => {
    updateUserSettings(updated);
    setIsDirty(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Image 1 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
          Cài đặt
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Quản lý hồ sơ và tùy chọn không gian làm việc.
        </p>
      </div>

      {/* Tabs Bar with active blue underline */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={handleSwitchTab}
        hasUnsavedChanges={isDirty}
        onRequestSwitchTab={handleRequestSwitchTab}
      />

      {/* Tab Panels */}
      <div className="pt-2">
        {/* Tab 1: Hồ sơ cá nhân */}
        {activeTab === 'profile' && (
          <ProfileSettings
            settings={settings}
            onSave={handleSaveSettings}
            onDirtyChange={setIsDirty}
          />
        )}

        {/* Tab 2: Không gian làm việc */}
        {activeTab === 'workspace' && (
          <WorkspaceSettings
            settings={settings}
            onSave={handleSaveSettings}
            onDirtyChange={setIsDirty}
          />
        )}

        {/* Tab 3: Thành viên */}
        {activeTab === 'members' && (
          <MembersSettings
            members={members}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            canDisableMember={canDisableMember}
            onToggleStatus={toggleMemberStatus}
            onReassignWork={reassignMemberWork}
          />
        )}

        {/* Tab 4: Thông báo */}
        {activeTab === 'notifications' && (
          <NotificationSettings
            settings={settings}
            onSave={handleSaveSettings}
            onDirtyChange={setIsDirty}
          />
        )}

        {/* Tab 5: Bảo mật */}
        {activeTab === 'security' && <SecuritySettings />}
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {pendingTab && (
        <Modal
          isOpen={true}
          onClose={() => setPendingTab(null)}
          title="Rời khỏi trang khi có thay đổi chưa lưu?"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div className="text-xs text-[#92400E] space-y-1">
                <p className="font-bold">Bạn có thay đổi chưa được lưu!</p>
                <p>
                  Nếu rời khỏi tab này, các thông tin bạn vừa chỉnh sửa sẽ bị hủy bỏ và không được lưu vào hệ thống.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6EBF2]">
              <Button variant="secondary" onClick={() => setPendingTab(null)}>
                Ở lại trang
              </Button>
              <Button
                variant="danger"
                onClick={() => handleSwitchTab(pendingTab)}
                className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              >
                Bỏ thay đổi & Tiếp tục
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#667085]">Đang tải cài đặt...</div>}>
        <SettingsContent />
      </Suspense>
    </AppLayout>
  );
}
