export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ContractModel } from '@/models/Contract';
import { TaskModel } from '@/models/Task';
import { DealModel } from '@/models/Deal';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { fromMemberId, toMemberId } = await req.json();

    if (!fromMemberId || !toMemberId) {
      return NextResponse.json(
        { success: false, error: 'fromMemberId and toMemberId are required' },
        { status: 400 }
      );
    }

    await Promise.all([
      ContractModel.updateMany({ assigneeId: fromMemberId }, { $set: { assigneeId: toMemberId } }),
      TaskModel.updateMany({ assigneeId: fromMemberId }, { $set: { assigneeId: toMemberId } }),
      DealModel.updateMany({ assigneeId: fromMemberId }, { $set: { assigneeId: toMemberId } }),
    ]);

    return NextResponse.json({ success: true, message: 'Work reassigned successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
