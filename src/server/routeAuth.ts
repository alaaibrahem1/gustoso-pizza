import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from '@/server/auth';

export interface AuthenticatedNextRequest {
  user: TokenPayload | null;
}

export function getAuthUser(req: NextRequest): TokenPayload | null {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function requireAuthUser(req: NextRequest): { user: TokenPayload } | { errorResponse: Response } {
  const user = getAuthUser(req);
  if (!user) {
    return {
      errorResponse: Response.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export function requireAdminUser(req: NextRequest): { user: TokenPayload } | { errorResponse: Response } {
  const auth = requireAuthUser(req);
  if ('errorResponse' in auth) {
    return auth;
  }
  if (auth.user.role !== 'ADMIN') {
    return {
      errorResponse: Response.json(
        { error: 'Forbidden: Admin privileges required.' },
        { status: 403 }
      ),
    };
  }
  return auth;
}
