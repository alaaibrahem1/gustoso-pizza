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
    const updated = await dbService.updateCategory(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
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
    const result = await dbService.deleteCategory(id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Category deleted successfully.' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
  }
}
