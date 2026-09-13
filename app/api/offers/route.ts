import { NextResponse } from 'next/server';
import { dbService } from '@/server/db';

export async function GET() {
  try {
    const offers = await dbService.listOffers();
    return NextResponse.json(offers);
  } catch (error: any) {
    console.error('Fetch offers error:', error);
    return NextResponse.json({ error: 'Failed to fetch offers.' }, { status: 500 });
  }
}
