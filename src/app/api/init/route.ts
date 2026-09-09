export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { seedDatabase } from '@/lib/seed';
import { WorkspaceModel } from '@/models/Workspace';
import { CustomerModel } from '@/models/Customer';
import { DealModel } from '@/models/Deal';
import { ContractModel } from '@/models/Contract';
import { TaskModel } from '@/models/Task';
import { CalendarEventModel } from '@/models/CalendarEvent';
import { MemberModel } from '@/models/Member';
import { SettingsModel } from '@/models/Settings';
import { CLEAN_SETTINGS } from '@/lib/seed';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Ensure system is initialized with clean workspace & admin
    await seedDatabase(false);

    // Get requested workspaceId
    const { searchParams } = new URL(request.url);
    const requestedWsId = searchParams.get('workspaceId');

    // Fetch all workspaces
    const workspaces = await WorkspaceModel.find({}).sort({ createdAt: 1 }).lean();

    // Determine active workspace
    let activeWorkspace = workspaces.find((w) => w.id === requestedWsId);
    if (!activeWorkspace) {
      activeWorkspace = workspaces.find((w) => w.isDefault) || workspaces[0];
    }

    const activeWsId = activeWorkspace?.id || 'ws-default';

    // Query scoped data for the active workspace
    // Also include records that don't have workspaceId set yet for backward compatibility
    const workspaceFilter = { workspaceId: activeWsId };

    const [
      customers,
      deals,
      contracts,
      tasks,
      calendarEvents,
      members,
      settingsDoc,
    ] = await Promise.all([
      CustomerModel.find(workspaceFilter).sort({ createdAt: -1 }).lean(),
      DealModel.find(workspaceFilter).sort({ createdAt: -1 }).lean(),
      ContractModel.find(workspaceFilter).sort({ createdAt: -1 }).lean(),
      TaskModel.find(workspaceFilter).sort({ createdAt: -1 }).lean(),
      CalendarEventModel.find(workspaceFilter).sort({ date: 1, startTime: 1 }).lean(),
      MemberModel.find({}).sort({ role: 1 }).lean(),
      SettingsModel.findOne({ key: 'default_settings' }).lean(),
    ]);

    const settings = settingsDoc || {
      key: 'default_settings',
      ...CLEAN_SETTINGS,
    };

    return NextResponse.json({
      success: true,
      data: {
        workspaces,
        activeWorkspace,
        activeWorkspaceId: activeWsId,
        customers,
        deals,
        contracts,
        tasks,
        calendarEvents,
        members,
        settings,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in /api/init:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initialize CRM data' },
      { status: 500 }
    );
  }
}
