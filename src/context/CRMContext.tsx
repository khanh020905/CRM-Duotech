'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Customer,
  Deal,
  Contract,
  Task,
  CalendarEvent,
  Member,
  UserSettings,
  TimeRangeFilter,
  ChartPeriod,
  ToastMessage,
  KPICardData,
  DealStage,
} from '@/types/crm';
import {
  INITIAL_CUSTOMERS,
  INITIAL_DEALS,
  INITIAL_CONTRACTS,
  INITIAL_TASKS,
  INITIAL_CALENDAR_EVENTS,
  MEMBERS,
  INITIAL_SETTINGS,
  KPI_DATA_MAP,
} from '@/data/mockData';

interface CanDeleteCustomerResult {
  canDelete: boolean;
  reason?: string;
  linkedDealsCount: number;
  linkedContractsCount: number;
  linkedTasksCount: number;
}

interface CRMContextType {
  // Core Entities
  customers: Customer[];
  deals: Deal[];
  contracts: Contract[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  members: Member[];
  settings: UserSettings;

  // Global UI State
  timeRange: TimeRangeFilter;
  chartPeriod: ChartPeriod;
  toast: ToastMessage | null;
  workspace: string;
  uncompletedTasksCount: number;
  kpiStats: KPICardData[];
  isCommandMenuOpen: boolean;
  setIsCommandMenuOpen: (open: boolean) => void;

  // Helper getters
  getCustomerById: (id: string) => Customer | undefined;
  getMemberById: (id: string) => Member | undefined;
  getCustomerOpportunityValue: (customerId: string) => number;
  canDeleteCustomer: (customerId: string) => CanDeleteCustomerResult;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;
  archiveCustomer: (id: string) => void;

  // Deal Actions
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'commentsCount' | 'checklistCount'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDealStage: (id: string, newStage: DealStage) => void;
  markDealWon: (id: string) => void;
  markDealLost: (id: string, lossReason?: string) => void;

  // Contract Actions
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  archiveContract: (id: string) => void;
  importContracts: (newContracts: Omit<Contract, 'id' | 'createdAt'>[]) => number;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Calendar Actions
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => boolean;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => boolean;
  deleteCalendarEvent: (id: string) => void;
  checkCalendarConflict: (event: Omit<CalendarEvent, 'id'>, excludeId?: string) => CalendarEvent | null;

  // Settings & Member Actions
  updateUserSettings: (newSettings: Partial<UserSettings>) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  canDisableMember: (id: string) => { canDisable: boolean; reason?: string; linkedContractsCount: number; linkedTasksCount: number; linkedDealsCount: number };
  toggleMemberStatus: (id: string) => boolean;
  reassignMemberWork: (fromMemberId: string, toMemberId: string) => void;

  // Common UI Actions
  showToast: (title: string, description?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: () => void;
  setTimeRange: (range: TimeRangeFilter) => void;
  setChartPeriod: (period: ChartPeriod) => void;
  setWorkspace: (ws: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const STORAGE_KEY = 'duotech_crm_data_v1';
const LEGACY_STORAGE_KEY = 'nexa_crm_data_v2';

export function CRMProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);

  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('2026-09');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('month');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [workspace, setWorkspace] = useState('Công ty TNHH Demo');
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.deals) setDeals(parsed.deals);
        if (parsed.contracts) setContracts(parsed.contracts);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.calendarEvents) setCalendarEvents(parsed.calendarEvents);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.workspace) setWorkspace(parsed.workspace);
      }
    } catch (e) {
      console.error('Failed to load CRM state from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const dataToSave = {
        customers,
        deals,
        contracts,
        tasks,
        calendarEvents,
        members,
        settings,
        workspace,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save CRM state to localStorage', e);
    }
  }, [customers, deals, contracts, tasks, calendarEvents, members, settings, workspace, isInitialized]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setToast({
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      type,
    });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Helper getters
  const getCustomerById = (id: string) => customers.find((c) => c.id === id);
  const getMemberById = (id: string) => members.find((m) => m.id === id) || members[0];

  const getCustomerOpportunityValue = (customerId: string) => {
    return deals
      .filter((d) => d.customerId === customerId && d.stage !== 'Thua')
      .reduce((sum, d) => sum + d.value, 0);
  };

  const canDeleteCustomer = (customerId: string): CanDeleteCustomerResult => {
    const linkedDeals = deals.filter((d) => d.customerId === customerId && d.stage !== 'Thua');
    const linkedContracts = contracts.filter((c) => c.customerId === customerId && c.status !== 'Đã kết thúc');
    const linkedTasks = tasks.filter((t) => t.customerId === customerId && !t.completed);

    if (linkedDeals.length > 0 || linkedContracts.length > 0 || linkedTasks.length > 0) {
      const parts = [];
      if (linkedDeals.length > 0) parts.push(`${linkedDeals.length} cơ hội kinh doanh`);
      if (linkedContracts.length > 0) parts.push(`${linkedContracts.length} hợp đồng`);
      if (linkedTasks.length > 0) parts.push(`${linkedTasks.length} công việc chưa hoàn thành`);

      return {
        canDelete: false,
        reason: `Khách hàng đang có ${parts.join(', ')} liên kết. Hãy lưu trữ khách hàng thay vì xóa vĩnh viễn.`,
        linkedDealsCount: linkedDeals.length,
        linkedContractsCount: linkedContracts.length,
        linkedTasksCount: linkedTasks.length,
      };
    }

    return {
      canDelete: true,
      linkedDealsCount: 0,
      linkedContractsCount: 0,
      linkedTasksCount: 0,
    };
  };

  // Customer Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast('Thêm khách hàng thành công', newCustomer.name, 'success');
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Đã cập nhật khách hàng', '', 'success');
  };

  const deleteCustomer = (id: string): boolean => {
    const check = canDeleteCustomer(id);
    if (!check.canDelete) {
      showToast('Không thể xóa khách hàng', check.reason, 'error');
      return false;
    }
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa khách hàng', target?.company || target?.name, 'info');
    return true;
  };

  const archiveCustomer = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: !c.isArchived } : c))
    );
    showToast('Đã lưu trữ khách hàng', 'Hồ sơ đã được đưa vào kho lưu trữ', 'info');
  };

  // Deal Actions
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'commentsCount' | 'checklistCount'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      commentsCount: 0,
      checklistCount: 0,
      createdAt: new Date().toISOString(),
      stageHistory: [{ stage: dealData.stage, date: new Date().toISOString() }],
    };
    setDeals((prev) => [newDeal, ...prev]);
    showToast('Thêm cơ hội thành công', newDeal.title, 'success');
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    showToast('Cập nhật cơ hội thành công', '', 'success');
  };

  const deleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    showToast('Đã xóa cơ hội', '', 'info');
  };

  const moveDealStage = (id: string, newStage: DealStage) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const history = d.stageHistory || [];
          return {
            ...d,
            stage: newStage,
            stageHistory: [...history, { stage: newStage, date: new Date().toISOString() }],
          };
        }
        return d;
      })
    );
  };

  const markDealWon = (id: string) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              stage: 'Thắng',
              probability: 100,
              closedAt: new Date().toISOString(),
            }
          : d
      )
    );
    showToast('Chúc mừng!', 'Cơ hội đã được đánh dấu Thắng', 'success');
  };

  const markDealLost = (id: string, lossReason?: string) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              stage: 'Thua',
              probability: 0,
              lossReason: lossReason || 'Không phù hợp ngân sách / tính năng',
              closedAt: new Date().toISOString(),
            }
          : d
      )
    );
    showToast('Đã đánh dấu thua', 'Cơ hội đã được chuyển sang danh sách Đóng', 'info');
  };

  // Contract Actions
  const addContract = (contractData: Omit<Contract, 'id' | 'createdAt'>) => {
    const newContract: Contract = {
      ...contractData,
      id: `cont-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContracts((prev) => [newContract, ...prev]);
    showToast('Tạo hợp đồng thành công', newContract.contractCode, 'success');
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Cập nhật hợp đồng thành công', '', 'success');
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa hợp đồng vĩnh viễn', '', 'info');
  };

  const archiveContract = (id: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isArchived: !c.isArchived,
              history: [
                ...(c.history || []),
                {
                  id: `h-${Date.now()}`,
                  timestamp: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  authorName: settings.profile?.name || settings.currentUser.name,
                  action: c.isArchived ? 'Bỏ lưu trữ hợp đồng' : 'Lưu trữ hợp đồng',
                },
              ],
            }
          : c
      )
    );
    showToast('Đã cập nhật trạng thái lưu trữ hợp đồng', '', 'info');
  };

  const importContracts = (newContractsData: Omit<Contract, 'id' | 'createdAt'>[]) => {
    const timestamp = Date.now();
    const formattedContracts: Contract[] = newContractsData.map((c, idx) => ({
      ...c,
      id: `cont-${timestamp}-${idx}`,
      createdAt: new Date().toISOString(),
    }));

    setContracts((prev) => [...formattedContracts, ...prev]);
    showToast('Nhập dữ liệu thành công', `Đã thêm ${formattedContracts.length} hợp đồng mới`, 'success');
    return formattedContracts.length;
  };

  // Task Actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Tạo công việc thành công', newTask.title, 'success');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Đã cập nhật công việc', '', 'success');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa công việc', '', 'info');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'Hoàn thành' : 'Cần làm',
          };
        }
        return t;
      })
    );
  };

  // Calendar Actions
  const checkCalendarConflict = (eventData: Omit<CalendarEvent, 'id'>, excludeId?: string): CalendarEvent | null => {
    const conflict = calendarEvents.find((e) => {
      if (excludeId && e.id === excludeId) return false;
      if (e.assigneeId !== eventData.assigneeId) return false;
      if (e.date !== eventData.date) return false;

      // Overlap condition: start1 < end2 && start2 < end1
      return eventData.startTime < e.endTime && e.startTime < eventData.endTime;
    });

    return conflict || null;
  };

  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>): boolean => {
    const conflict = checkCalendarConflict(eventData);
    if (conflict) {
      showToast('Cảnh báo trùng lịch!', `Người phụ trách đã có lịch "${conflict.title}" từ ${conflict.startTime} đến ${conflict.endTime}`, 'warning');
    }

    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    showToast('Tạo lịch hẹn thành công', `${newEvent.title} (${newEvent.startTime} - ${newEvent.endTime})`, 'success');
    return true;
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>): boolean => {
    const currentEvent = calendarEvents.find((e) => e.id === id);
    if (!currentEvent) return false;

    const merged = { ...currentEvent, ...updates };
    const conflict = checkCalendarConflict(merged, id);
    if (conflict) {
      showToast('Cảnh báo trùng lịch!', `Người phụ trách đã có lịch "${conflict.title}" từ ${conflict.startTime} đến ${conflict.endTime}`, 'warning');
    }

    setCalendarEvents((prev) => prev.map((e) => (e.id === id ? merged : e)));
    showToast('Cập nhật lịch hẹn thành công', '', 'success');
    return true;
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Đã xóa cuộc hẹn', '', 'info');
  };

  // Settings & Member Actions
  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updatedProfile = newSettings.profile ? { ...prev.profile, ...newSettings.profile } : prev.profile;
      const updatedWorkspace = newSettings.workspaceInfo ? { ...prev.workspaceInfo, ...newSettings.workspaceInfo } : prev.workspaceInfo;
      const updatedNotifications = newSettings.notifications ? { ...prev.notifications, ...newSettings.notifications } : prev.notifications;

      const updatedCurrentUser = {
        ...prev.currentUser,
        ...(newSettings.currentUser || {}),
        name: updatedProfile.name,
        avatarUrl: updatedProfile.avatarUrl,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      };

      // Also sync current member in members array
      setMembers((mList) =>
        mList.map((m) =>
          m.id === updatedCurrentUser.id
            ? { ...m, name: updatedCurrentUser.name, avatarUrl: updatedCurrentUser.avatarUrl, email: updatedCurrentUser.email, phone: updatedCurrentUser.phone }
            : m
        )
      );

      if (updatedWorkspace?.name) {
        setWorkspace(updatedWorkspace.name);
      }

      return {
        ...prev,
        ...newSettings,
        profile: updatedProfile,
        currentUser: updatedCurrentUser,
        workspaceInfo: updatedWorkspace,
        notifications: updatedNotifications,
      };
    });

    showToast('Lưu cài đặt thành công', 'Thông tin đã được áp dụng toàn hệ thống', 'success');
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: `user-${Date.now()}`,
      joinedDate: memberData.joinedDate || new Date().toLocaleDateString('vi-VN'),
    };
    setMembers((prev) => [...prev, newMember]);
    showToast('Thêm thành viên thành công', newMember.name, 'success');
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('Đã cập nhật thành viên', '', 'success');
  };

  const canDisableMember = (id: string) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) {
      return { canDisable: false, reason: 'Không tìm thấy thành viên', linkedContractsCount: 0, linkedTasksCount: 0, linkedDealsCount: 0 };
    }

    // Check if this is the last active admin
    const activeAdmins = members.filter((m) => m.role === 'Quản trị viên' && m.status === 'Hoạt động');
    if (targetMember.role === 'Quản trị viên' && activeAdmins.length <= 1 && targetMember.status === 'Hoạt động') {
      return {
        canDisable: false,
        reason: 'Không thể vô hiệu hóa hoặc hạ quyền quản trị viên hoạt động cuối cùng của hệ thống.',
        linkedContractsCount: 0,
        linkedTasksCount: 0,
        linkedDealsCount: 0,
      };
    }

    const linkedContractsCount = contracts.filter((c) => c.assigneeId === id).length;
    const linkedTasksCount = tasks.filter((t) => t.assigneeId === id && !t.completed).length;
    const linkedDealsCount = deals.filter((d) => d.assigneeId === id && d.stage !== 'Thắng' && d.stage !== 'Thua').length;

    return {
      canDisable: true,
      linkedContractsCount,
      linkedTasksCount,
      linkedDealsCount,
    };
  };

  const toggleMemberStatus = (id: string): boolean => {
    const check = canDisableMember(id);
    const member = members.find((m) => m.id === id);
    if (!member) return false;

    if (member.status === 'Hoạt động' && !check.canDisable) {
      showToast('Thao tác bị chặn', check.reason, 'error');
      return false;
    }

    const nextStatus = member.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m)));
    showToast(`Đã ${nextStatus === 'Tạm khóa' ? 'tạm ngưng' : 'kích hoạt'} thành viên`, member.name, 'success');
    return true;
  };

  const reassignMemberWork = (fromMemberId: string, toMemberId: string) => {
    setContracts((prev) => prev.map((c) => (c.assigneeId === fromMemberId ? { ...c, assigneeId: toMemberId } : c)));
    setTasks((prev) => prev.map((t) => (t.assigneeId === fromMemberId ? { ...t, assigneeId: toMemberId } : t)));
    setDeals((prev) => prev.map((d) => (d.assigneeId === fromMemberId ? { ...d, assigneeId: toMemberId } : d)));
    showToast('Đã bàn giao công việc thành công', '', 'success');
  };

  // Uncompleted tasks for badge on sidebar (for current user)
  const uncompletedTasksCount = useMemo(() => {
    const currentUserId = settings.currentUser.id;
    return tasks.filter((t) => !t.completed && (t.assigneeId === currentUserId || !t.assigneeId)).length;
  }, [tasks, settings.currentUser.id]);

  const kpiStats = useMemo(() => {
    return KPI_DATA_MAP[timeRange] || KPI_DATA_MAP['2026-09'];
  }, [timeRange]);

  return (
    <CRMContext.Provider
      value={{
        customers,
        deals,
        contracts,
        tasks,
        calendarEvents,
        members,
        settings,
        timeRange,
        chartPeriod,
        toast,
        workspace,
        uncompletedTasksCount,
        kpiStats,
        isCommandMenuOpen,
        setIsCommandMenuOpen,
        getCustomerById,
        getMemberById,
        getCustomerOpportunityValue,
        canDeleteCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        archiveCustomer,
        addDeal,
        updateDeal,
        deleteDeal,
        moveDealStage,
        markDealWon,
        markDealLost,
        addContract,
        updateContract,
        deleteContract,
        archiveContract,
        importContracts,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        checkCalendarConflict,
        updateUserSettings,
        addMember,
        updateMember,
        canDisableMember,
        toggleMemberStatus,
        reassignMemberWork,
        showToast,
        dismissToast,
        setTimeRange,
        setChartPeriod,
        setWorkspace,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
