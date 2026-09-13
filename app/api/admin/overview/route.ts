import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const stats = await dbService.getAdminOverview();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Fetch overview metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview metrics.' }, { status: 500 });
  }
}
