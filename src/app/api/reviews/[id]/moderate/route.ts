import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PATCH() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Маршрут модерации устарел. Используйте защищённый endpoint /api/admin/reviews/[id].',
    },
    { status: 410 },
  );
}
