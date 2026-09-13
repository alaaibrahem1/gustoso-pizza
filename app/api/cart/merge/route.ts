import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { guestItems } = await req.json();
    if (!Array.isArray(guestItems)) {
      return NextResponse.json({ error: 'guestItems must be an array.' }, { status: 400 });
    }
    const cart = await dbService.mergeGuestCart(auth.user.id, guestItems);
    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Merge cart error:', error);
    return NextResponse.json({ error: 'Failed to merge guest cart.' }, { status: 500 });
  }
}
