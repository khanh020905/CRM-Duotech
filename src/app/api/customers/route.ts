import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CustomerModel } from '@/models/Customer';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    const filter = workspaceId ? { workspaceId } : {};

    const customers = await CustomerModel.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const customerId = data.id || `cust-${Date.now()}`;
    const newCustomer = await CustomerModel.create({
      ...data,
      id: customerId,
      workspaceId: data.workspaceId || 'ws-default',
      createdAt: data.createdAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
