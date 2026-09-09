export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TaskModel } from '@/models/Task';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    const filter = workspaceId ? { workspaceId } : {};

    const tasks = await TaskModel.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const taskId = data.id || `task-${Date.now()}`;
    const newTask = await TaskModel.create({
      ...data,
      id: taskId,
      workspaceId: data.workspaceId || 'ws-default',
      createdAt: data.createdAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
