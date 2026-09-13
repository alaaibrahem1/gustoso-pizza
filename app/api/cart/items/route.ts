import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAuthUser } from '@/server/routeAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { productId, quantity, unitPrice, selectedSize, selectedCrust, kitchenNotes, toppings } = await req.json();
    if (!productId || !quantity || !unitPrice) {
      return NextResponse.json({ error: 'Product ID, quantity, and unit price are required.' }, { status: 400 });
    }

    const items = await dbService.addToCart(auth.user.id, {
      productId,
      quantity,
      unitPrice,
      selectedSize,
      selectedCrust,
      kitchenNotes,
      toppings,
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Failed to add item to cart.' }, { status: 500 });
  }
}
