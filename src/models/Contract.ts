import mongoose, { Schema, Model } from 'mongoose';
import { Contract } from '@/types/crm';

const MaintenanceSchema = new Schema(
  {
    status: { type: String, required: true, default: 'Chưa đăng ký' },
    description: { type: String, default: '' },
    startDate: { type: String, default: '' },
    nextRenewalDate: { type: String, default: '' },
    monthlyFee: { type: Number, default: 0 },
  },
  { _id: false }
);

const AttachmentSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadDate: { type: String, required: true },
    blobKey: { type: String },
    dataUrl: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const HistorySchema = new Schema(
  {
    id: { type: String, required: true },
    timestamp: { type: String, required: true },
    authorName: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
  },
  { _id: false }
);

const ContractSchema = new Schema<Contract>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, index: true, default: 'ws-default' },
    contractCode: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String },
    phone: { type: String },
    project: { type: String, required: true },
    value: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, required: true, default: 'Chờ ký' },
    assigneeId: { type: String, required: true, index: true },
    signDate: { type: String, required: true },
    handoverDate: { type: String },
    isArchived: { type: Boolean, default: false },
    maintenance: { type: MaintenanceSchema, required: true },
    attachments: [AttachmentSchema],
    notes: { type: String },
    history: [HistorySchema],
    createdAt: { type: String, required: true },
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

export const ContractModel: Model<Contract> =
  (mongoose.models.Contract as Model<Contract>) ||
  mongoose.model<Contract>('Contract', ContractSchema);
