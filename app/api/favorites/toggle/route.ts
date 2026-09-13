import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
    }
    const result = await dbService.toggleFavorite(auth.user.id, productId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite.' }, { status: 500 });
  }
}
