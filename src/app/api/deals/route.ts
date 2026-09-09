export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DealModel } from '@/models/Deal';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    const filter = workspaceId ? { workspaceId } : {};

    const deals = await DealModel.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: deals });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const dealId = data.id || `deal-${Date.now()}`;
    const newDeal = await DealModel.create({
      ...data,
      id: dealId,
      workspaceId: data.workspaceId || 'ws-default',
      commentsCount: data.commentsCount || 0,
      checklistCount: data.checklistCount || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      stageHistory: data.stageHistory || [
        { stage: data.stage || 'Mới', date: new Date().toISOString() },
      ],
    });

    return NextResponse.json({ success: true, data: newDeal }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
