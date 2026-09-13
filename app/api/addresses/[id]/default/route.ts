import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;
    const updated = await dbService.setDefaultAddress(id, auth.user.id);
    if (!updated) {
      return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Set default address error:', error);
    return NextResponse.json({ error: 'Failed to set default address.' }, { status: 500 });
  }
}
