import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await dbService.updateTopping(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Topping not found.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update topping error:', error);
    return NextResponse.json({ error: 'Failed to update topping.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { id } = await params;
    const success = await dbService.deleteTopping(id);
    if (!success) {
      return NextResponse.json({ error: 'Topping not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Topping deleted.' });
  } catch (error: any) {
    console.error('Delete topping error:', error);
    return NextResponse.json({ error: 'Failed to delete topping.' }, { status: 500 });
  }
}
