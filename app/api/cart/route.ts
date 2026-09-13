import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const items = await dbService.getUserCart(auth.user.id);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Fetch cart error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    await dbService.clearUserCart(auth.user.id);
    return NextResponse.json({ message: 'Cart cleared.' });
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return NextResponse.json({ error: 'Failed to clear cart.' }, { status: 500 });
  }
}
