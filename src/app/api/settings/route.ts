import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SettingsModel } from '@/models/Settings';
import { INITIAL_SETTINGS } from '@/data/mockData';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SettingsModel.findOne({ key: 'default_settings' }).lean();
    if (!settings) {
      settings = await SettingsModel.create({
        key: 'default_settings',
        ...INITIAL_SETTINGS,
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const updates = await req.json();

    const settings = await SettingsModel.findOneAndUpdate(
      { key: 'default_settings' },
      { $set: updates },
      { returnDocument: 'after', upsert: true, lean: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
