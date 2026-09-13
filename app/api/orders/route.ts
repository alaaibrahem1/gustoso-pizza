import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { getAuthUser, requireAuthUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const orders = await dbService.getUserOrders(auth.user.id);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);

  try {
    const {
      subtotal,
      discount,
      discountCode,
      deliveryFee,
      vat,
      total,
      deliveryMethod,
      paymentMethod,
      deliveryAddressSnapshot,
      customerSnapshot,
      notes,
      items,
    } = await req.json();

    if (!items || !items.length || total === undefined) {
      return NextResponse.json({ error: 'Order must contain items and a total amount.' }, { status: 400 });
    }

    const order = await dbService.createOrder({
      userId: user ? user.id : undefined,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      discountCode,
      deliveryFee: Number(deliveryFee) || 0,
      vat: Number(vat) || 0,
      total: Number(total) || 0,
      deliveryMethod: deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY',
      paymentMethod:
        paymentMethod === 'apple_pay'
          ? 'APPLE_PAY'
          : paymentMethod === 'card_on_delivery'
          ? 'CARD_ON_DELIVERY'
          : 'CASH_ON_DELIVERY',
      paymentStatus: paymentMethod === 'apple_pay' ? 'PAID' : 'PENDING',
      orderStatus: 'CONFIRMED',
      deliveryAddressSnapshot,
      customerSnapshot,
      notes,
      items,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
  }
}
