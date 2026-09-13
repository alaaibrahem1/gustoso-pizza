import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const favorites = await dbService.getUserFavorites(auth.user.id);
    return NextResponse.json(favorites);
  } catch (error: any) {
    console.error('Fetch favorites error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites.' }, { status: 500 });
  }
}
