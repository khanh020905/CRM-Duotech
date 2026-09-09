import mongoose, { Schema, Model } from 'mongoose';
import { Deal } from '@/types/crm';

const StageHistorySchema = new Schema(
  {
    stage: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const DealSchema = new Schema<Deal>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, index: true, default: 'ws-default' },
    title: { type: String, required: true },
    customerId: { type: String, required: true, index: true },
    value: { type: Number, required: true, default: 0 },
    stage: { type: String, required: true, default: 'Mới' },
    probability: { type: Number, required: true, default: 10 },
    assigneeId: { type: String, required: true, index: true },
    expectedCloseDate: { type: String, required: true },
    source: { type: String, required: true },
    lossReason: { type: String },
    notes: { type: String },
    commentsCount: { type: Number, default: 0 },
    checklistCount: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
    closedAt: { type: String },
    stageHistory: [StageHistorySchema],
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

export const DealModel: Model<Deal> =
  (mongoose.models.Deal as Model<Deal>) ||
  mongoose.model<Deal>('Deal', DealSchema);
