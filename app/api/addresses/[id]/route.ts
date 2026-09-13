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
    const body = await req.json();
    const updated = await dbService.updateAddress(id, auth.user.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Address not found or unauthorized.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Failed to update address.' }, { status: 500 });
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
    const success = await dbService.deleteAddress(id, auth.user.id);
    if (!success) {
      return NextResponse.json({ error: 'Address not found or unauthorized.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Address deleted successfully.' });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Failed to delete address.' }, { status: 500 });
  }
}
