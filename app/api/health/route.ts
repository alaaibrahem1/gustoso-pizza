import { NextResponse } from 'next/server';
import { dbService } from '@/server/db';

export async function GET() {
  const isConnected = await dbService.checkConnection();
  return NextResponse.json({
    status: 'ok',
    database: isConnected ? 'connected (Neon PostgreSQL)' : 'fallback',
    timestamp: new Date().toISOString(),
  });
}
