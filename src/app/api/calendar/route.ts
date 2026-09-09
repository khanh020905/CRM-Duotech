export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CalendarEventModel } from '@/models/CalendarEvent';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    const filter = workspaceId ? { workspaceId } : {};

    const events = await CalendarEventModel.find(filter).sort({ date: 1, startTime: 1 }).lean();
    return NextResponse.json({ success: true, data: events });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const eventId = data.id || `cal-${Date.now()}`;
    const newEvent = await CalendarEventModel.create({
      ...data,
      id: eventId,
      workspaceId: data.workspaceId || 'ws-default',
    });

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
