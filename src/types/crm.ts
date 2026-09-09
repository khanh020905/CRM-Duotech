export type CustomerStatus = 'Tiềm năng' | 'Đang chăm sóc' | 'Đã chuyển đổi';

export type CustomerSource =
  | 'Website'
  | 'Giới thiệu'
  | 'Facebook'
  | 'Sự kiện'
  | 'Khách hàng cũ'
  | 'Đối tác'
  | 'Hội thảo'
  | 'Tìm kiếm'
  | 'Khác';

export interface Assignee {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  phone?: string;
  role?: MemberRole;
}

export type MemberRole = 'Quản trị viên' | 'Quản lý kinh doanh' | 'Nhân viên kinh doanh';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  avatarUrl?: string;
  initials: string;
  status: 'Hoạt động' | 'Tạm khóa';
  joinedDate?: string; // DD/MM/YYYY
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  ownerId?: string;
  logoUrl?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface Customer {
  id: string;
  workspaceId?: string;
  name: string;
  company: string;
  website?: string;
  email: string;
  phone: string; // retains leading zero '0'
  source: CustomerSource;
  status: CustomerStatus;
  assigneeId: string;
  lastContact: string; // DD/MM/YYYY
  createdAt: string;
  notes?: string;
  avatarColor?: string;
  isArchived?: boolean;
}

export type DealStage = 'Mới' | 'Đã liên hệ' | 'Đề xuất' | 'Đàm phán' | 'Thắng' | 'Thua';

export interface Deal {
  id: string;
  workspaceId?: string;
  title: string;
  customerId: string;
  value: number; // in VND
  stage: DealStage;
  probability: number; // 0 - 100%
  assigneeId: string;
  expectedCloseDate: string; // YYYY-MM-DD
  source: CustomerSource;
  lossReason?: string;
  notes?: string;
  commentsCount: number;
  checklistCount: number;
  createdAt: string;
  closedAt?: string;
  stageHistory?: { stage: DealStage; date: string }[];
}

export type ContractStatus =
  | 'Chờ ký'
  | 'Đang triển khai'
  | 'Hoàn thành'
  | 'Đang bảo trì'
  | 'Đã kết thúc';

export type MaintenanceStatus =
  | 'Chưa đăng ký'
  | 'Đang hoạt động'
  | 'Tạm dừng'
  | 'Đã kết thúc';

export interface ContractHistoryItem {
  id: string;
  timestamp: string;
  authorName: string;
  action: string;
  details?: string;
}

export interface ContractAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  blobKey?: string;
  dataUrl?: string;
  url?: string;
}

export interface Contract {
  id: string;
  workspaceId?: string;
  contractCode: string; // e.g. "HD-2026-001"
  customerId: string;
  customerName?: string; // Optional cached name or company
  phone?: string; // Stored separately per contract to preserve leading zeros
  project: string;
  value: number; // in VND, non-negative
  paidAmount?: number; // ĐÃ THU, in VND, non-negative
  status: ContractStatus;
  assigneeId: string;
  signDate: string; // YYYY-MM-DD or DD/MM/YYYY
  handoverDate?: string;
  isArchived?: boolean;
  maintenance: {
    status: MaintenanceStatus;
    description: string;
    startDate: string;
    nextRenewalDate: string;
    monthlyFee: number; // in VND, non-negative
  };
  attachments: ContractAttachment[];
  notes?: string;
  history?: ContractHistoryItem[];
  createdAt: string;
}

export type TaskStatus = 'Cần làm' | 'Đang làm' | 'Hoàn thành';
export type TaskPriority = 'Cao' | 'Trung bình' | 'Thấp';

export interface Task {
  id: string;
  workspaceId?: string;
  title: string;
  description?: string;
  customerId?: string;
  dealId?: string;
  contractId?: string;
  company?: string;
  assigneeId: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // e.g. "09:30"
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
}

export type CalendarEventType = 'Demo' | 'Tư vấn' | 'Nội bộ';

export interface CalendarEvent {
  id: string;
  workspaceId?: string;
  title: string;
  type: CalendarEventType;
  customerId?: string;
  assigneeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm e.g. "09:00"
  endTime: string; // HH:mm e.g. "10:00"
  locationOrLink?: string;
  notes?: string;
}

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  role: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  language: string;
  timezone: string;
  isEmailVerified: boolean;
}

export interface WorkspaceSettings {
  name: string;
  logoUrl?: string;
  contactEmail: string;
  phone: string;
  address: string;
  taxCode?: string;
  website?: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

export interface NotificationSettings {
  taskReminders: boolean;
  taskDueReminders: boolean;
  calendarReminders: boolean;
  maintenanceReminders: boolean;
  productNewsletter: boolean;
  contractStatusChanges: boolean;
  calendarTiming: '5' | '15' | '30' | '60';
  taskTiming: 'due' | '1h' | '1d';
  maintenanceTiming: '3' | '7' | '14' | '30';
}

export interface UserSettings {
  currentUser: Member;
  profile: ProfileSettings;
  workspaceInfo: WorkspaceSettings;
  notifications: NotificationSettings;
}

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  totalValue: number;
  percent: number;
}

export interface RevenuePoint {
  label: string;
  value: number;
  fullAmount?: number;
}

export interface KPICardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  type: 'revenue' | 'customers' | 'deals' | 'conversion';
  subtext?: string;
}

export type TimeRangeFilter = '2026-09' | '2026-08' | 'Q3-2026' | '2026';
export type ChartPeriod = 'month' | 'quarter' | 'year';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
