import mongoose, { Schema, Model } from 'mongoose';
import { UserSettings } from '@/types/crm';

const ProfileSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarUrl: { type: String },
    language: { type: String, default: 'Tiếng Việt' },
    timezone: { type: String, default: '(UTC+07:00) Bangkok, Hà Nội' },
    isEmailVerified: { type: Boolean, default: true },
  },
  { _id: false }
);

const WorkspaceSchema = new Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String },
    contactEmail: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    taxCode: { type: String },
    website: { type: String },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    currency: { type: String, default: 'VNĐ' },
    dateFormat: { type: String, default: 'dd/MM/yyyy' },
  },
  { _id: false }
);

const NotificationSchema = new Schema(
  {
    taskReminders: { type: Boolean, default: true },
    taskDueReminders: { type: Boolean, default: true },
    calendarReminders: { type: Boolean, default: true },
    maintenanceReminders: { type: Boolean, default: true },
    productNewsletter: { type: Boolean, default: false },
    contractStatusChanges: { type: Boolean, default: true },
    calendarTiming: { type: String, default: '15' },
    taskTiming: { type: String, default: '1h' },
    maintenanceTiming: { type: String, default: '7' },
  },
  { _id: false }
);

const MemberSubSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    avatarUrl: { type: String },
    initials: { type: String, required: true },
    status: { type: String, required: true },
    joinedDate: { type: String },
  },
  { _id: false }
);

const UserSettingsSchema = new Schema<{ key: string } & UserSettings>(
  {
    key: { type: String, required: true, unique: true, default: 'default_settings' },
    currentUser: { type: MemberSubSchema, required: true },
    profile: { type: ProfileSchema, required: true },
    workspaceInfo: { type: WorkspaceSchema, required: true },
    notifications: { type: NotificationSchema, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>)._id;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

export const SettingsModel: Model<{ key: string } & UserSettings> =
  (mongoose.models.Settings as Model<{ key: string } & UserSettings>) ||
  mongoose.model<{ key: string } & UserSettings>('Settings', UserSettingsSchema);
