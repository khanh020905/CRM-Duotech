import mongoose, { Schema, Model } from 'mongoose';
import { Customer } from '@/types/crm';

const CustomerSchema = new Schema<Customer>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, index: true, default: 'ws-default' },
    name: { type: String, required: true },
    company: { type: String, required: true },
    website: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    source: { type: String, required: true },
    status: { type: String, required: true, default: 'Tiềm năng' },
    assigneeId: { type: String, required: true, index: true },
    lastContact: { type: String, required: true },
    createdAt: { type: String, required: true },
    notes: { type: String },
    avatarColor: { type: String },
    isArchived: { type: Boolean, default: false },
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

export const CustomerModel: Model<Customer> =
  (mongoose.models.Customer as Model<Customer>) ||
  mongoose.model<Customer>('Customer', CustomerSchema);
