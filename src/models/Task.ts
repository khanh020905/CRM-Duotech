import mongoose, { Schema, Model } from 'mongoose';
import { Task } from '@/types/crm';

const TaskSchema = new Schema<Task>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, index: true, default: 'ws-default' },
    title: { type: String, required: true },
    description: { type: String },
    customerId: { type: String, index: true },
    dealId: { type: String, index: true },
    contractId: { type: String, index: true },
    company: { type: String },
    assigneeId: { type: String, required: true, index: true },
    priority: { type: String, required: true, default: 'Trung bình' },
    dueDate: { type: String, required: true },
    dueTime: { type: String, required: true, default: '09:00' },
    status: { type: String, required: true, default: 'Cần làm' },
    completed: { type: Boolean, required: true, default: false },
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

export const TaskModel: Model<Task> =
  (mongoose.models.Task as Model<Task>) ||
  mongoose.model<Task>('Task', TaskSchema);
