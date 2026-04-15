import { NextRequest } from 'next/server';
import { verifyOrderAccessToken } from '@/lib/orders/pdfAccessToken';

export function isAdminAuthorized(request: NextRequest, adminToken: string): boolean {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return false;
  }

  const token = authorization.slice(7).trim();
  return token === adminToken;
}

export function hasValidOrderAccessToken(params: {
  token: string | null | undefined;
  orderNumber: string;
  secret: string;
}): boolean {
  const token = params.token?.trim();
  if (!token) return false;

  return verifyOrderAccessToken({
    token,
    orderNumber: params.orderNumber,
    secret: params.secret,
  });
}
