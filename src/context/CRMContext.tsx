'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  Customer,
  Deal,
  Contract,
  Task,
  CalendarEvent,
  Member,
  UserSettings,
  Workspace,
  TimeRangeFilter,
  ChartPeriod,
  ToastMessage,
  KPICardData,
  DealStage,
} from '@/types/crm';
import { MEMBERS, INITIAL_SETTINGS, KPI_DATA_MAP } from '@/data/mockData';

interface CanDeleteCustomerResult {
  canDelete: boolean;
  reason?: string;
  linkedDealsCount: number;
  linkedContractsCount: number;
  linkedTasksCount: number;
}

interface CRMContextType {
  // Workspaces
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (data: Omit<Workspace, 'id' | 'createdAt'>) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<boolean>;

  // Core Entities (Clean, Scoped to active workspace)
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
  isLoading: boolean;
  refreshData: (wsId?: string) => Promise<void>;

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
  deleteMember: (id: string) => boolean;

  // Common UI Actions
  showToast: (title: string, description?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: () => void;
  setTimeRange: (range: TimeRangeFilter) => void;
  setChartPeriod: (period: ChartPeriod) => void;
  setWorkspace: (ws: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const ACTIVE_WS_KEY = 'duotech_crm_active_ws_id';

export function CRMProvider({ children }: { children: ReactNode }) {
  // Workspaces State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-default');

  // Core Data Entities: Start completely empty (Clean Production State)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);

  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('2026-09');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('month');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId]);

  const workspace = activeWorkspace?.name || 'Duotech Solution';

  const showToast = useCallback(
    (
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
    },
    []
  );

  const dismissToast = () => {
    setToast(null);
  };

  // Fetch all CRM data for a given workspace
  const refreshData = useCallback(async (targetWsId?: string) => {
    try {
      setIsLoading(true);
      const wsId = targetWsId || localStorage.getItem(ACTIVE_WS_KEY) || 'ws-default';
      const res = await fetch(`/api/init?workspaceId=${encodeURIComponent(wsId)}`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        const {
          workspaces: dbWorkspaces,
          activeWorkspace: dbActiveWs,
          activeWorkspaceId: dbActiveWsId,
          customers: dbCustomers,
          deals: dbDeals,
          contracts: dbContracts,
          tasks: dbTasks,
          calendarEvents: dbCalendarEvents,
          members: dbMembers,
          settings: dbSettings,
        } = json.data;

        if (Array.isArray(dbWorkspaces)) {
          setWorkspaces(dbWorkspaces);
        }

        const resolvedWsId = dbActiveWsId || (dbActiveWs ? dbActiveWs.id : wsId);
        setActiveWorkspaceId(resolvedWsId);
        localStorage.setItem(ACTIVE_WS_KEY, resolvedWsId);

        setCustomers(Array.isArray(dbCustomers) ? dbCustomers : []);
        setDeals(Array.isArray(dbDeals) ? dbDeals : []);
        setContracts(Array.isArray(dbContracts) ? dbContracts : []);
        setTasks(Array.isArray(dbTasks) ? dbTasks : []);
        setCalendarEvents(Array.isArray(dbCalendarEvents) ? dbCalendarEvents : []);
        if (Array.isArray(dbMembers) && dbMembers.length > 0) setMembers(dbMembers);
        if (dbSettings) setSettings(dbSettings);
      }
    } catch (error) {
      console.error('Error fetching CRM data from MongoDB:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const savedWsId = localStorage.getItem(ACTIVE_WS_KEY);
    refreshData(savedWsId || undefined);
  }, [refreshData]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Workspace Actions
  const switchWorkspace = async (wsId: string) => {
    if (wsId === activeWorkspaceId) return;
    setActiveWorkspaceId(wsId);
    localStorage.setItem(ACTIVE_WS_KEY, wsId);
    const target = workspaces.find((w) => w.id === wsId);
    showToast('Chuyển Workspace', `Đang tải dữ liệu ${target?.name || ''}`, 'info');
    await refreshData(wsId);
  };

  const createWorkspace = async (data: Omit<Workspace, 'id' | 'createdAt'>): Promise<Workspace> => {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create workspace');
    }

    const newWs: Workspace = result.data;
    setWorkspaces((prev) => [...prev, newWs]);
    showToast('Tạo Workspace thành công', newWs.name, 'success');

    // Automatically switch to the newly created workspace
    await switchWorkspace(newWs.id);
    return newWs;
  };

  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));

    const res = await fetch(`/api/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (result.success) {
      showToast('Cập nhật Workspace thành công', '', 'success');
    } else {
      showToast('Lỗi cập nhật Workspace', result.error, 'error');
    }
  };

  const deleteWorkspace = async (id: string): Promise<boolean> => {
    if (workspaces.length <= 1) {
      showToast('Không thể xóa', 'Phải giữ lại ít nhất 1 workspace', 'error');
      return false;
    }

    const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) {
      showToast('Lỗi khi xóa workspace', result.error, 'error');
      return false;
    }

    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    showToast('Đã xóa Workspace thành công', '', 'info');

    // If active workspace was deleted, switch to first remaining
    if (id === activeWorkspaceId) {
      const remaining = workspaces.filter((w) => w.id !== id);
      if (remaining.length > 0) {
        await switchWorkspace(remaining[0].id);
      }
    }
    return true;
  };

  const setWorkspace = (wsName: string) => {
    const found = workspaces.find((w) => w.name === wsName);
    if (found) {
      switchWorkspace(found.id);
    }
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
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast('Thêm khách hàng thành công', newCustomer.name, 'success');

    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    }).catch((err) => {
      console.error('Failed to save customer to MongoDB', err);
    });
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Đã cập nhật khách hàng', '', 'success');

    fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.error('Failed to update customer in MongoDB', err);
    });
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

    fetch(`/api/customers/${id}`, { method: 'DELETE' }).catch((err) => {
      console.error('Failed to delete customer from MongoDB', err);
    });
    return true;
  };

  const archiveCustomer = (id: string) => {
    let updatedArchived = false;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedArchived = !c.isArchived;
          return { ...c, isArchived: updatedArchived };
        }
        return c;
      })
    );
    showToast('Đã lưu trữ khách hàng', 'Hồ sơ đã được đưa vào kho lưu trữ', 'info');

    fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: updatedArchived }),
    }).catch((err) => {
      console.error('Failed to archive customer in MongoDB', err);
    });
  };

  // Deal Actions
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'commentsCount' | 'checklistCount'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      commentsCount: 0,
      checklistCount: 0,
      createdAt: new Date().toISOString(),
      stageHistory: [{ stage: dealData.stage, date: new Date().toISOString() }],
    };
    setDeals((prev) => [newDeal, ...prev]);
    showToast('Thêm cơ hội thành công', newDeal.title, 'success');

    fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDeal),
    }).catch((err) => {
      console.error('Failed to save deal to MongoDB', err);
    });
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    showToast('Cập nhật cơ hội thành công', '', 'success');

    fetch(`/api/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.error('Failed to update deal in MongoDB', err);
    });
  };

  const deleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    showToast('Đã xóa cơ hội', '', 'info');

    fetch(`/api/deals/${id}`, { method: 'DELETE' }).catch((err) => {
      console.error('Failed to delete deal from MongoDB', err);
    });
  };

  const moveDealStage = (id: string, newStage: DealStage) => {
    let updatedDeal: Deal | undefined;
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const history = d.stageHistory || [];
          updatedDeal = {
            ...d,
            stage: newStage,
            stageHistory: [...history, { stage: newStage, date: new Date().toISOString() }],
          };
          return updatedDeal;
        }
        return d;
      })
    );

    if (updatedDeal) {
      fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: updatedDeal.stage,
          stageHistory: updatedDeal.stageHistory,
        }),
      }).catch((err) => {
        console.error('Failed to update deal stage in MongoDB', err);
      });
    }
  };

  const markDealWon = (id: string) => {
    const closedAt = new Date().toISOString();
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              stage: 'Thắng',
              probability: 100,
              closedAt,
            }
          : d
      )
    );
    showToast('Chúc mừng!', 'Cơ hội đã được đánh dấu Thắng', 'success');

    fetch(`/api/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: 'Thắng',
        probability: 100,
        closedAt,
      }),
    }).catch((err) => {
      console.error('Failed to mark deal won in MongoDB', err);
    });
  };

  const markDealLost = (id: string, lossReason?: string) => {
    const closedAt = new Date().toISOString();
    const reason = lossReason || 'Không phù hợp ngân sách / tính năng';
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              stage: 'Thua',
              probability: 0,
              lossReason: reason,
              closedAt,
            }
          : d
      )
    );
    showToast('Đã đánh dấu thua', 'Cơ hội đã được chuyển sang danh sách Đóng', 'info');

    fetch(`/api/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: 'Thua',
        probability: 0,
        lossReason: reason,
        closedAt,
      }),
    }).catch((err) => {
      console.error('Failed to mark deal lost in MongoDB', err);
    });
  };

  // Contract Actions
  const addContract = (contractData: Omit<Contract, 'id' | 'createdAt'>) => {
    const newContract: Contract = {
      ...contractData,
      id: `cont-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    };
    setContracts((prev) => [newContract, ...prev]);
    showToast('Tạo hợp đồng thành công', newContract.contractCode, 'success');

    fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContract),
    }).catch((err) => {
      console.error('Failed to save contract to MongoDB', err);
    });
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Cập nhật hợp đồng thành công', '', 'success');

    fetch(`/api/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.error('Failed to update contract in MongoDB', err);
    });
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa hợp đồng vĩnh viễn', '', 'info');

    fetch(`/api/contracts/${id}`, { method: 'DELETE' }).catch((err) => {
      console.error('Failed to delete contract from MongoDB', err);
    });
  };

  const archiveContract = (id: string) => {
    let updatedContract: Contract | undefined;
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = {
            ...c,
            isArchived: !c.isArchived,
            history: [
              ...(c.history || []),
              {
                id: `h-${Date.now()}`,
                timestamp:
                  new Date().toLocaleDateString('vi-VN') +
                  ' ' +
                  new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                authorName: settings.profile?.name || settings.currentUser.name,
                action: c.isArchived ? 'Bỏ lưu trữ hợp đồng' : 'Lưu trữ hợp đồng',
              },
            ],
          };
          updatedContract = updated;
          return updated;
        }
        return c;
      })
    );
    showToast('Đã cập nhật trạng thái lưu trữ hợp đồng', '', 'info');

    if (updatedContract) {
      fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isArchived: updatedContract.isArchived,
          history: updatedContract.history,
        }),
      }).catch((err) => {
        console.error('Failed to update contract archive status in MongoDB', err);
      });
    }
  };

  const importContracts = (newContractsData: Omit<Contract, 'id' | 'createdAt'>[]) => {
    const timestamp = Date.now();
    const formattedContracts: Contract[] = newContractsData.map((c, idx) => ({
      ...c,
      id: `cont-${timestamp}-${idx}`,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    }));

    setContracts((prev) => [...formattedContracts, ...prev]);
    showToast('Nhập dữ liệu thành công', `Đã thêm ${formattedContracts.length} hợp đồng mới`, 'success');

    fetch(`/api/contracts/import?workspaceId=${encodeURIComponent(activeWorkspaceId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedContracts),
    }).catch((err) => {
      console.error('Failed to import contracts to MongoDB', err);
    });

    return formattedContracts.length;
  };

  // Task Actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Tạo công việc thành công', newTask.title, 'success');

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    }).catch((err) => {
      console.error('Failed to save task to MongoDB', err);
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Đã cập nhật công việc', '', 'success');

    fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.error('Failed to update task in MongoDB', err);
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa công việc', '', 'info');

    fetch(`/api/tasks/${id}`, { method: 'DELETE' }).catch((err) => {
      console.error('Failed to delete task from MongoDB', err);
    });
  };

  const toggleTask = (id: string) => {
    let nextCompleted = false;
    let nextStatus: Task['status'] = 'Cần làm';

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          nextCompleted = !t.completed;
          nextStatus = nextCompleted ? 'Hoàn thành' : 'Cần làm';
          return {
            ...t,
            completed: nextCompleted,
            status: nextStatus,
          };
        }
        return t;
      })
    );

    fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed: nextCompleted,
        status: nextStatus,
      }),
    }).catch((err) => {
      console.error('Failed to toggle task in MongoDB', err);
    });
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
      showToast(
        'Cảnh báo trùng lịch!',
        `Người phụ trách đã có lịch "${conflict.title}" từ ${conflict.startTime} đến ${conflict.endTime}`,
        'warning'
      );
    }

    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
      workspaceId: activeWorkspaceId,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    showToast('Tạo lịch hẹn thành công', `${newEvent.title} (${newEvent.startTime} - ${newEvent.endTime})`, 'success');

    fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    }).catch((err) => {
      console.error('Failed to save calendar event to MongoDB', err);
    });

    return true;
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>): boolean => {
    const currentEvent = calendarEvents.find((e) => e.id === id);
    if (!currentEvent) return false;

    const merged = { ...currentEvent, ...updates };
    const conflict = checkCalendarConflict(merged, id);
    if (conflict) {
      showToast(
        'Cảnh báo trùng lịch!',
        `Người phụ trách đã có lịch "${conflict.title}" từ ${conflict.startTime} đến ${conflict.endTime}`,
        'warning'
      );
    }

    setCalendarEvents((prev) => prev.map((e) => (e.id === id ? merged : e)));
    showToast('Cập nhật lịch hẹn thành công', '', 'success');

    fetch(`/api/calendar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.error('Failed to update calendar event in MongoDB', err);
    });

    return true;
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Đã xóa cuộc hẹn', '', 'info');

    fetch(`/api/calendar/${id}`, { method: 'DELETE' }).catch((err) => {
      console.error('Failed to delete calendar event from MongoDB', err);
    });
  };

  // Settings & Member Actions
  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    let fullUpdatedSettings: UserSettings | undefined;

    setSettings((prev) => {
      const updatedProfile = newSettings.profile ? { ...prev.profile, ...newSettings.profile } : prev.profile;
      const updatedWorkspace = newSettings.workspaceInfo
        ? { ...prev.workspaceInfo, ...newSettings.workspaceInfo }
        : prev.workspaceInfo;
      const updatedNotifications = newSettings.notifications
        ? { ...prev.notifications, ...newSettings.notifications }
        : prev.notifications;

      const updatedCurrentUser = {
        ...prev.currentUser,
        ...(newSettings.currentUser || {}),
        name: updatedProfile.name,
        avatarUrl: updatedProfile.avatarUrl,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      };

      setMembers((mList) =>
        mList.map((m) =>
          m.id === updatedCurrentUser.id
            ? {
                ...m,
                name: updatedCurrentUser.name,
                avatarUrl: updatedCurrentUser.avatarUrl,
                email: updatedCurrentUser.email,
                phone: updatedCurrentUser.phone,
              }
            : m
        )
      );

      fullUpdatedSettings = {
        ...prev,
        ...newSettings,
        profile: updatedProfile,
        currentUser: updatedCurrentUser,
        workspaceInfo: updatedWorkspace,
        notifications: updatedNotifications,
      };

      return fullUpdatedSettings;
    });

    showToast('Lưu cài đặt thành công', 'Thông tin đã được áp dụng toàn hệ thống', 'success');

    if (fullUpdatedSettings) {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullUpdatedSettings),
      }).catch((err) => {
        console.error('Failed to save settings to MongoDB', err);
      });
    }
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: `user-${Date.now()}`,
      joinedDate: memberData.joinedDate || new Date().toLocaleDateString('vi-VN'),
    };
    setMembers((prev) => [...prev, newMember]);
    showToast('Thêm thành viên thành công', newMember.name, 'success');

    fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember),
    }).catch((err) => {
      console.error('Failed to save member to MongoDB', err);
    });
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('Đã cập nhật thành viên', '', 'success');

    fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.error('Failed to update member in MongoDB', err);
    });
  };

  const canDisableMember = (id: string) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) {
      return {
        canDisable: false,
        reason: 'Không tìm thấy thành viên',
        linkedContractsCount: 0,
        linkedTasksCount: 0,
        linkedDealsCount: 0,
      };
    }

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

    fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    }).catch((err) => {
      console.error('Failed to toggle member status in MongoDB', err);
    });

    return true;
  };

  const reassignMemberWork = (fromMemberId: string, toMemberId: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.assigneeId === fromMemberId ? { ...c, assigneeId: toMemberId } : c))
    );
    setTasks((prev) =>
      prev.map((t) => (t.assigneeId === fromMemberId ? { ...t, assigneeId: toMemberId } : t))
    );
    setDeals((prev) =>
      prev.map((d) => (d.assigneeId === fromMemberId ? { ...d, assigneeId: toMemberId } : d))
    );
    showToast('Đã bàn giao công việc thành công', '', 'success');

    fetch('/api/members/reassign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromMemberId, toMemberId }),
    }).catch((err) => {
      console.error('Failed to reassign work in MongoDB', err);
    });
  };

  const deleteMember = (id: string): boolean => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) return false;

    // Check if last active admin
    const activeAdmins = members.filter((m) => m.role === 'Quản trị viên' && m.status === 'Hoạt động');
    if (targetMember.role === 'Quản trị viên' && activeAdmins.length <= 1) {
      showToast('Không thể xóa', 'Phải giữ lại ít nhất 1 Quản trị viên hoạt động trong hệ thống', 'error');
      return false;
    }

    if (members.length <= 1) {
      showToast('Không thể xóa', 'Hệ thống cần ít nhất 1 thành viên', 'error');
      return false;
    }

    // Count linked active items
    const linkedContractsCount = contracts.filter((c) => c.assigneeId === id && !c.isArchived).length;
    const linkedTasksCount = tasks.filter((t) => t.assigneeId === id && !t.completed).length;
    const linkedDealsCount = deals.filter((d) => d.assigneeId === id && d.stage !== 'Thắng' && d.stage !== 'Thua').length;

    if (linkedContractsCount > 0 || linkedTasksCount > 0 || linkedDealsCount > 0) {
      showToast(
        'Không thể xóa thành viên',
        `Thành viên đang phụ trách ${linkedContractsCount} hợp đồng, ${linkedDealsCount} cơ hội và ${linkedTasksCount} việc chưa xong. Hãy bàn giao công việc trước khi xóa.`,
        'error'
      );
      return false;
    }

    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Đã xóa thành viên', targetMember.name, 'info');

    fetch(`/api/members/${id}`, { method: 'DELETE' }).catch((err) => {
      console.error('Failed to delete member from MongoDB', err);
    });

    return true;
  };

  // Uncompleted tasks for badge on sidebar (for current user)
  const uncompletedTasksCount = useMemo(() => {
    const currentUserId = settings.currentUser.id;
    return tasks.filter((t) => !t.completed && (t.assigneeId === currentUserId || !t.assigneeId)).length;
  }, [tasks, settings.currentUser.id]);

  // Dynamic KPI Stats based on real data
  const kpiStats = useMemo(() => {
    // If real data exists, compute dynamic KPIs
    const totalWonRevenue = contracts
      .filter((c) => c.status === 'Hoàn thành' || c.status === 'Đang triển khai' || c.status === 'Đang bảo trì')
      .reduce((sum, c) => sum + (c.paidAmount || c.value || 0), 0);

    const totalDeals = deals.length;
    const wonDeals = deals.filter((d) => d.stage === 'Thắng').length;
    const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
    const totalCustomers = customers.length;

    // Formatting revenue nicely in millions
    const revenueFormatted =
      totalWonRevenue >= 1_000_000_000
        ? `${(totalWonRevenue / 1_000_000_000).toFixed(1)} tỷ đ`
        : totalWonRevenue > 0
        ? `${(totalWonRevenue / 1_000_000).toFixed(0)} triệu đ`
        : '0 đ';

    return [
      {
        title: 'Tổng doanh thu',
        value: revenueFormatted,
        change: totalWonRevenue > 0 ? '+100%' : '0%',
        isPositive: true,
        type: 'revenue' as const,
        subtext: 'tính từ hợp đồng thực tế',
      },
      {
        title: 'Khách hàng',
        value: totalCustomers.toString(),
        change: totalCustomers > 0 ? `+${totalCustomers}` : '0',
        isPositive: true,
        type: 'customers' as const,
        subtext: 'trong workspace này',
      },
      {
        title: 'Cơ hội kinh doanh',
        value: totalDeals.toString(),
        change: totalDeals > 0 ? `+${totalDeals}` : '0',
        isPositive: true,
        type: 'deals' as const,
        subtext: `${wonDeals} đã chốt thắng`,
      },
      {
        title: 'Tỷ lệ chuyển đổi',
        value: `${conversionRate}%`,
        change: `${wonDeals}/${totalDeals || 1}`,
        isPositive: conversionRate > 0,
        type: 'conversion' as const,
        subtext: 'deal thắng / tổng deal',
      },
    ];
  }, [contracts, deals, customers]);

  return (
    <CRMContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
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
        isLoading,
        refreshData,
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
        deleteMember,
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
