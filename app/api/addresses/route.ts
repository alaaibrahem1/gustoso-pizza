import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const addresses = await dbService.getUserAddresses(auth.user.id);
    return NextResponse.json(addresses);
  } catch (error: any) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { label, city, district, street, buildingNumber, apartmentOrUnit, notes, isDefault } = await req.json();
    if (!city || !district || !street || !buildingNumber) {
      return NextResponse.json(
        { error: 'City, district, street, and building number are required.' },
        { status: 400 }
      );
    }

    const address = await dbService.createAddress(auth.user.id, {
      label,
      city,
      district,
      street,
      buildingNumber,
      apartmentOrUnit,
      notes,
      isDefault,
    });
    return NextResponse.json(address, { status: 201 });
  } catch (error: any) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Failed to create address.' }, { status: 500 });
  }
}
