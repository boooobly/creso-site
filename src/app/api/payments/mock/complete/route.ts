import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    { ok: false, error: 'Онлайн-оплата на сайте отключена.' },
    { status: 410 },
  );
}
