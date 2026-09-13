import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const offers = await dbService.listOffers();
    return NextResponse.json(offers);
  } catch (error: any) {
    console.error('Fetch admin offers error:', error);
    return NextResponse.json({ error: 'Failed to fetch offers.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { name, slug, description, image, originalPrice, discountedPrice, discountPercentage, isActive } = await req.json();
    if (!name || !slug || originalPrice === undefined || discountedPrice === undefined) {
      return NextResponse.json({ error: 'Name, slug, and prices are required.' }, { status: 400 });
    }
    const offer = await dbService.createOffer({
      name,
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
      originalPrice: Number(originalPrice),
      discountedPrice: Number(discountedPrice),
      discountPercentage: Number(discountPercentage) || Math.round((1 - discountedPrice / originalPrice) * 100),
      isActive: isActive !== undefined ? !!isActive : true,
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    console.error('Create offer error:', error);
    return NextResponse.json({ error: 'Failed to create offer.' }, { status: 500 });
  }
}
