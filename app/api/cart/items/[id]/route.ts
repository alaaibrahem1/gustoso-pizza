import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;
    const { quantity } = await req.json();
    const items = await dbService.updateCartItemQuantity(auth.user.id, id, Number(quantity) || 1);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Update cart item error:', error);
    return NextResponse.json({ error: 'Failed to update cart item.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;
    const items = await dbService.removeCartItem(auth.user.id, id);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Remove cart item error:', error);
    return NextResponse.json({ error: 'Failed to remove cart item.' }, { status: 500 });
  }
}
