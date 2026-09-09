import mongoose, { Schema, Model } from 'mongoose';
import { Member } from '@/types/crm';

const MemberSchema = new Schema<Member>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true, default: 'Nhân viên kinh doanh' },
    avatarUrl: { type: String },
    initials: { type: String, required: true },
    status: { type: String, required: true, default: 'Hoạt động' },
    joinedDate: { type: String },
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

export const MemberModel: Model<Member> =
  (mongoose.models.Member as Model<Member>) ||
  mongoose.model<Member>('Member', MemberSchema);
