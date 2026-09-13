import { NextResponse } from 'next/server';
import { dbService } from '@/server/db';

export async function GET() {
  try {
    const coupons = await dbService.listCoupons();
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons.' }, { status: 500 });
  }
}
