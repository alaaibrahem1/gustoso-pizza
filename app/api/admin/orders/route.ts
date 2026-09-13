import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || undefined;
    const orders = await dbService.getAllOrdersAdmin(statusFilter);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Fetch admin orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin orders.' }, { status: 500 });
  }
}
