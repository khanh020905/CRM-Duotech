import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkspaceModel } from '@/models/Workspace';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const workspace = await WorkspaceModel.findOne({ id }).lean();
    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace không tồn tại' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: workspace });
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

    const updated = await WorkspaceModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', lean: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Workspace không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
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

    const count = await WorkspaceModel.countDocuments();
    if (count <= 1) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa workspace cuối cùng của hệ thống' },
        { status: 400 }
      );
    }

    const deleted = await WorkspaceModel.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Workspace không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa workspace thành công' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
