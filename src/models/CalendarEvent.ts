import mongoose, { Schema, Model } from 'mongoose';
import { CalendarEvent } from '@/types/crm';

const CalendarEventSchema = new Schema<CalendarEvent>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, index: true, default: 'ws-default' },
    title: { type: String, required: true },
    type: { type: String, required: true, default: 'Tư vấn' },
    customerId: { type: String, index: true },
    assigneeId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    locationOrLink: { type: String },
    notes: { type: String },
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

export const CalendarEventModel: Model<CalendarEvent> =
  (mongoose.models.CalendarEvent as Model<CalendarEvent>) ||
  mongoose.model<CalendarEvent>('CalendarEvent', CalendarEventSchema);
