import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function PUT(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { name, phone } = await req.json();
    const updated = await dbService.updateUser(auth.user.id, { name, phone });
    if (!updated) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    const { passwordHash: _, ...safeUser } = updated;
    return NextResponse.json({ message: 'Profile updated', user: safeUser });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
