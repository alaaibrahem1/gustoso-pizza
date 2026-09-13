import { NextResponse } from 'next/server';
import { dbService } from '@/server/db';

export async function GET() {
  try {
    const toppings = await dbService.listToppings();
    return NextResponse.json(toppings);
  } catch (error: any) {
    console.error('Fetch toppings error:', error);
    return NextResponse.json({ error: 'Failed to fetch toppings.' }, { status: 500 });
  }
}
