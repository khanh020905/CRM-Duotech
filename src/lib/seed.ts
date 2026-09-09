import { connectToDatabase } from './mongodb';
import { CustomerModel } from '@/models/Customer';
import { DealModel } from '@/models/Deal';
import { ContractModel } from '@/models/Contract';
import { TaskModel } from '@/models/Task';
import { CalendarEventModel } from '@/models/CalendarEvent';
import { MemberModel } from '@/models/Member';
import { SettingsModel } from '@/models/Settings';
import { WorkspaceModel } from '@/models/Workspace';

export const DEFAULT_WORKSPACE = {
  id: 'ws-default',
  name: 'Duotech Solution',
  slug: 'duotech-solution',
  description: 'Trụ sở chính công ty Duotech Solution',
  contactEmail: 'contact@duotech.vn',
  phone: '028 3822 9999',
  address: 'Tầng 12, Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh',
  taxCode: '0316888999',
  website: 'https://duotech.vn',
  timezone: 'Asia/Ho_Chi_Minh',
  currency: 'VNĐ',
  dateFormat: 'dd/MM/yyyy',
  isDefault: true,
  createdAt: new Date().toISOString(),
};

export const INITIAL_ADMIN_MEMBER = {
  id: 'user-1',
  name: 'Quốc Khánh',
  email: 'khankq@example.com',
  phone: '090 123 4567',
  role: 'Quản trị viên' as const,
  initials: 'QK',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  status: 'Hoạt động' as const,
  joinedDate: '15/01/2025',
};

export const CLEAN_SETTINGS = {
  currentUser: INITIAL_ADMIN_MEMBER,
  profile: {
    name: 'Quốc Khánh',
    email: 'khankq@example.com',
    phone: '090 123 4567',
    role: 'Quản trị viên',
    title: 'Giám đốc Kinh doanh',
    bio: 'Quản trị viên hệ thống Duotech CRM.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    language: 'Tiếng Việt',
    timezone: '(UTC+07:00) Bangkok, Hà Nội',
    isEmailVerified: true,
  },
  workspaceInfo: {
    name: 'Duotech Solution',
    logoUrl: '',
    contactEmail: 'contact@duotech.vn',
    phone: '028 3822 9999',
    address: 'Tầng 12, Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh',
    taxCode: '0316888999',
    website: 'https://duotech.vn',
    timezone: 'Asia/Ho_Chi_Minh',
    currency: 'VNĐ',
    dateFormat: 'dd/MM/yyyy',
  },
  notifications: {
    taskReminders: true,
    taskDueReminders: true,
    calendarReminders: true,
    maintenanceReminders: true,
    productNewsletter: false,
    contractStatusChanges: true,
    calendarTiming: '15' as const,
    taskTiming: '1h' as const,
    maintenanceTiming: '7' as const,
  },
};

export async function clearAllMockData() {
  await connectToDatabase();

  // Wipe mock collections completely
  await Promise.all([
    CustomerModel.deleteMany({}),
    DealModel.deleteMany({}),
    ContractModel.deleteMany({}),
    TaskModel.deleteMany({}),
    CalendarEventModel.deleteMany({}),
  ]);

  // Ensure default workspace exists
  const existingWs = await WorkspaceModel.findOne({ id: DEFAULT_WORKSPACE.id });
  if (!existingWs) {
    await WorkspaceModel.create(DEFAULT_WORKSPACE);
  }

  // Ensure admin user exists
  const existingAdmin = await MemberModel.findOne({ id: INITIAL_ADMIN_MEMBER.id });
  if (!existingAdmin) {
    await MemberModel.create(INITIAL_ADMIN_MEMBER);
  }

  // Ensure settings exist and point to clean workspace
  await SettingsModel.findOneAndUpdate(
    { key: 'default_settings' },
    { $set: { key: 'default_settings', ...CLEAN_SETTINGS } },
    { upsert: true, returnDocument: 'after' }
  );

  return {
    success: true,
    message: 'Đã xóa sạch mock data và khởi tạo Workspace sạch thành công!',
  };
}

export async function seedDatabase(force: boolean = false) {
  await connectToDatabase();

  const wsCount = await WorkspaceModel.countDocuments();
  if (force || wsCount === 0) {
    return await clearAllMockData();
  }

  return {
    success: true,
    message: 'Hệ thống đã có workspace và dữ liệu sạch.',
    seeded: false,
  };
}
