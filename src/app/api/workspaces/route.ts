import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkspaceModel } from '@/models/Workspace';

export async function GET() {
  try {
    await connectToDatabase();
    let workspaces = await WorkspaceModel.find({}).sort({ createdAt: 1 }).lean();

    // If no workspaces exist yet, ensure default workspace
    if (!workspaces || workspaces.length === 0) {
      const defaultWs = await WorkspaceModel.create({
        id: 'ws-default',
        name: 'Duotech Solution',
        slug: 'duotech-solution',
        description: 'Trụ sở chính công ty Duotech Solution',
        contactEmail: 'contact@duotech.vn',
        phone: '028 3822 9999',
        address: 'Tầng 12, Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh',
        taxCode: '0316888999',
        website: 'https://duotech.vn',
        timezone: 'Asia/Ho_Chi_Minh',
        currency: 'VNĐ',
        dateFormat: 'dd/MM/yyyy',
        isDefault: true,
        createdAt: new Date().toISOString(),
      });
      workspaces = [defaultWs.toJSON()];
    }

    return NextResponse.json({ success: true, data: workspaces });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên workspace không được để trống' },
        { status: 400 }
      );
    }

    const wsId = data.id || `ws-${Date.now()}`;
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newWorkspace = await WorkspaceModel.create({
      ...data,
      id: wsId,
      name: data.name.trim(),
      slug,
      currency: data.currency || 'VNĐ',
      dateFormat: data.dateFormat || 'dd/MM/yyyy',
      timezone: data.timezone || 'Asia/Ho_Chi_Minh',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: newWorkspace }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
