import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const products = await dbService.listProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Fetch admin products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { name, slug, description, image, categoryId, basePrice, rating, isPopular, isFeatured, isAvailable } = await req.json();
    if (!name || !slug || !basePrice || !categoryId) {
      return NextResponse.json({ error: 'Name, slug, category, and base price are required.' }, { status: 400 });
    }

    const product = await dbService.createProduct({
      name,
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
      categoryId,
      basePrice: Number(basePrice),
      rating: Number(rating) || 4.9,
      isPopular: !!isPopular,
      isFeatured: !!isFeatured,
      isAvailable: isAvailable !== undefined ? !!isAvailable : true,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Create admin product error:', error);
    return NextResponse.json({ error: 'Failed to create product.' }, { status: 500 });
  }
}
