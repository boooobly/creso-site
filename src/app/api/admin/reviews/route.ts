import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

const statusSchema = z.enum(['pending', 'approved', 'rejected']);

function isAdminAuthorized(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  const headerToken = request.headers.get('x-admin-token');

  if (!adminToken) {
    return false;
  }

  return headerToken === adminToken;
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const parsed = statusSchema.safeParse(request.nextUrl.searchParams.get('status') || 'pending');

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 });
  }

  const items = await prisma.review.findMany({
    where: { status: parsed.data },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      name: true,
      isAnonymous: true,
      rating: true,
      text: true,
      status: true,
      createdAt: true,
      moderatedAt: true,
    },
  });

  return NextResponse.json({ items });
}
