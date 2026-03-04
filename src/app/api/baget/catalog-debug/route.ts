import { NextResponse } from 'next/server';
import { loadBagetCatalog } from '@/lib/baget/sheetsCatalog';

export const runtime = 'nodejs';

export async function GET() {
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
