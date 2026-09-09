import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ContractModel } from '@/models/Contract';
import { Contract } from '@/types/crm';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');

    const contracts: Omit<Contract, 'id' | 'createdAt'>[] = await req.json();

    if (!Array.isArray(contracts) || contracts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty or invalid contracts array' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const formattedContracts = contracts.map((c, idx) => ({
      ...c,
      id: `cont-${timestamp}-${idx}`,
      workspaceId: c.workspaceId || workspaceIdParam || 'ws-default',
      createdAt: new Date().toISOString(),
    }));

    const inserted = await ContractModel.insertMany(formattedContracts);
    return NextResponse.json({ success: true, count: inserted.length, data: inserted });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
