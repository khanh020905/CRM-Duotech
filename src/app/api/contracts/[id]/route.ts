export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ContractModel } from '@/models/Contract';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const contract = await ContractModel.findOne({ id }).lean();
    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: contract });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const updates = await req.json();

    const updatedContract = await ContractModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', lean: true }
    );

    if (!updatedContract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedContract });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deleted = await ContractModel.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
