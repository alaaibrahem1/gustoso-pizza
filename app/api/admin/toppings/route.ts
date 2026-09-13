import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const toppings = await dbService.listToppings();
    return NextResponse.json(toppings);
  } catch (error: any) {
    console.error('Fetch admin toppings error:', error);
    return NextResponse.json({ error: 'Failed to fetch toppings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { name, category, price, isAvailable } = await req.json();
    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: 'Name, category, and price are required.' }, { status: 400 });
    }
    const topping = await dbService.createTopping({
      name,
      category,
      price: Number(price),
      isAvailable: isAvailable !== undefined ? !!isAvailable : true,
    });
    return NextResponse.json(topping, { status: 201 });
  } catch (error: any) {
    console.error('Create topping error:', error);
    return NextResponse.json({ error: 'Failed to create topping.' }, { status: 500 });
  }
}
