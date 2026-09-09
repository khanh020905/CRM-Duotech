import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = Boolean(body.force);
    const result = await seedDatabase(force);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
