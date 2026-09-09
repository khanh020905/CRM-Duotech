import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DealModel } from '@/models/Deal';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deal = await DealModel.findOne({ id }).lean();
    if (!deal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deal });
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

    const updatedDeal = await DealModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', lean: true }
    );

    if (!updatedDeal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedDeal });
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
    const deleted = await DealModel.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Deal deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
