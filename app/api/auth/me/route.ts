import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const user = await dbService.findUserById(auth.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error: any) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile.' }, { status: 500 });
  }
}
