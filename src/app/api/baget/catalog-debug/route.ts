import { NextResponse } from 'next/server';
import { loadBagetCatalog } from '@/lib/baget/sheetsCatalog';

export const runtime = 'nodejs';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 });
  }

  const result = await loadBagetCatalog();

  return NextResponse.json({
    ok: result.source === 'sheet',
    source: result.source,
    sheetId: result.sheetId,
    tab: result.tab,
    count: result.items.length,
    firstItems: result.items.slice(0, 5),
    error: result.error,
  });
}
