import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { id } = await params;
    const { status } = await req.json();
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await dbService.updateOrderStatusAdmin(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Failed to update order status.' }, { status: 500 });
  }
}
