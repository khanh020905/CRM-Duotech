export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ContractModel } from '@/models/Contract';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    const filter = workspaceId ? { workspaceId } : {};

    const contracts = await ContractModel.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: contracts });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const contractId = data.id || `cont-${Date.now()}`;
    const newContract = await ContractModel.create({
      ...data,
      id: contractId,
      workspaceId: data.workspaceId || 'ws-default',
      createdAt: data.createdAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: newContract }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
