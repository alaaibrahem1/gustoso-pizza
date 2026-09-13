import { NextResponse } from 'next/server';
import { dbService } from '@/server/db';

export async function GET() {
  try {
    const categories = await dbService.listCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
  }
}
