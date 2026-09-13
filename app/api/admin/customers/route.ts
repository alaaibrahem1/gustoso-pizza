import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const customers = await dbService.listCustomers();
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers.' }, { status: 500 });
  }
}
