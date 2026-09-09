import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MemberModel } from '@/models/Member';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const member = await MemberModel.findOne({ id }).lean();
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: member });
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

    const updatedMember = await MemberModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', lean: true }
    );

    if (!updatedMember) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedMember });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
