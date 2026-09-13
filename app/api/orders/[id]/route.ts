import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { getAuthUser } from '@/server/routeAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);

  try {
    const { id } = await params;
    const order = await dbService.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.userId) {
      if (!user) {
        return NextResponse.json({ error: 'Authentication required to view this order.' }, { status: 401 });
      }
      if (order.userId !== user.id && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to view this order.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}
