import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { syncBagetCatalogSnapshot } from '@/lib/baget/catalogSnapshot';

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const result = await syncBagetCatalogSnapshot();

    if (!result.ok) {
      const details = result.preservedSnapshot
        ? 'Предыдущий успешный снимок сохранён.'
        : 'Успешного снимка пока нет.';

      return NextResponse.json({
        ok: false,
        error: `Не удалось обновить каталог багета: ${result.error}. ${details}`,
        sheetId: result.sheetId,
        tab: result.tab,
        preservedSnapshot: result.preservedSnapshot,
        diagnostics: result.diagnostics,
        rowsCount: result.diagnostics?.rowsCount,
        headers: result.diagnostics?.headers,
        skipped: result.diagnostics?.skipped,
      }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `Каталог багета обновлён: ${result.itemCount} позиций, синхронизация ${new Date(result.syncedAt).toLocaleString('ru-RU')}.`,
      itemCount: result.itemCount,
      syncedAt: result.syncedAt,
      sheetId: result.sheetId,
      tab: result.tab,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({
      ok: false,
      error: `Ошибка синхронизации каталога багета: ${message}. Предыдущий успешный снимок сохранён.`,
    }, { status: 500 });
  }
}
