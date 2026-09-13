import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code is required.' }, { status: 400 });
    }
    const result = await dbService.validateCoupon(code, Number(subtotal) || 0);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon.' }, { status: 500 });
  }
}
