import mongoose, { Schema, Model } from 'mongoose';
import { Workspace } from '@/types/crm';

const WorkspaceSchema = new Schema<Workspace>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    ownerId: { type: String },
    logoUrl: { type: String },
    contactEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    taxCode: { type: String, default: '' },
    website: { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    currency: { type: String, default: 'VNĐ' },
    dateFormat: { type: String, default: 'dd/MM/yyyy' },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: String },
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

export const WorkspaceModel: Model<Workspace> =
  (mongoose.models.Workspace as Model<Workspace>) ||
  mongoose.model<Workspace>('Workspace', WorkspaceSchema);
