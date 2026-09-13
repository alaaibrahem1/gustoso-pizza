import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { requireAdminUser } from '@/server/routeAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const coupons = await dbService.listCoupons();
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error('Fetch admin coupons error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdminUser(req);
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { code, discountType, discountValue, minimumOrder, maximumDiscount, usageLimit, isActive } = await req.json();
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Code, discountType, and discountValue are required.' }, { status: 400 });
    }
    const coupon = await dbService.createCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder) || 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive: isActive !== undefined ? !!isActive : true,
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Failed to create coupon.' }, { status: 500 });
  }
}
