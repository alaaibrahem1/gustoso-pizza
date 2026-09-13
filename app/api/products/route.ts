import { NextResponse } from 'next/server';
import { dbService } from '@/server/db';

export async function GET() {
  try {
    const products = await dbService.listProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }
}
