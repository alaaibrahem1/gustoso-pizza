import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const cats = await dbService.listCategories();
    return NextResponse.json(cats);
  } catch (error: any) {
    console.error('Fetch admin categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { name, slug, description, image } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }
    const cat = await dbService.createCategory({ name, slug, description, image });
    return NextResponse.json(cat, { status: 201 });
  } catch (error: any) {
    console.error('Create admin category error:', error);
    return NextResponse.json({ error: 'Failed to create category.' }, { status: 500 });
  }
}
