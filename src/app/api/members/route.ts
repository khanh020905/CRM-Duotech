export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MemberModel } from '@/models/Member';

export async function GET() {
  try {
    await connectToDatabase();
    const members = await MemberModel.find({}).sort({ role: 1 }).lean();
    return NextResponse.json({ success: true, data: members });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const memberId = data.id || `user-${Date.now()}`;
    const newMember = await MemberModel.create({
      ...data,
      id: memberId,
      joinedDate: data.joinedDate || new Date().toLocaleDateString('vi-VN'),
    });

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
