import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { guestFavorites } = await req.json();
    if (!Array.isArray(guestFavorites)) {
      return NextResponse.json({ error: 'guestFavorites must be an array.' }, { status: 400 });
    }
    const favs = await dbService.mergeGuestFavorites(auth.user.id, guestFavorites);
    return NextResponse.json(favs);
  } catch (error: any) {
    console.error('Merge favorites error:', error);
    return NextResponse.json({ error: 'Failed to merge guest favorites.' }, { status: 500 });
  }
}
