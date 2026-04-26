'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminButton } from '@/components/admin/ui';

type SyncState = 'idle' | 'loading' | 'success' | 'error';

type SyncResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
  rowsCount?: number;
  headers?: string[];
  skipped?: {
    missingResidues: number;
    hidden: number;
    invalidWidth: number;
    invalidPrice: number;
    other: number;
  };
};

export default function BagetCatalogSyncButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>('idle');
  const [feedback, setFeedback] = useState('');
  const [diagnostics, setDiagnostics] = useState<SyncResponse['skipped'] | null>(null);
  const [rowsCount, setRowsCount] = useState<number | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);

  const handleSync = async () => {
    setState('loading');
    setFeedback('Обновляем snapshot каталога багета…');
    setDiagnostics(null);
    setRowsCount(null);
    setHeaders([]);

    try {
      const response = await fetch('/api/admin/baget-catalog/sync', {
        method: 'POST'
      });

      const payload = (await response.json().catch(() => ({}))) as SyncResponse;

      if (!response.ok || payload.ok === false) {
        const errorText = payload.error || 'Не удалось обновить snapshot каталога багета.';
        setState('error');
        setFeedback(errorText);
        setDiagnostics(payload.skipped ?? null);
        setRowsCount(typeof payload.rowsCount === 'number' ? payload.rowsCount : null);
        setHeaders(Array.isArray(payload.headers) ? payload.headers : []);
        return;
      }

      setState('success');
      setFeedback(payload.message || 'Snapshot каталога багета успешно обновлён.');
      router.refresh();
    } catch {
      setState('error');
      setFeedback('Ошибка сети при обновлении snapshot каталога багета. Попробуйте ещё раз.');
    }
  };

  const feedbackClassName =
    state === 'error'
      ? 'text-rose-700'
      : state === 'success'
      ? 'text-emerald-700'
      : 'text-slate-600';

  return (
    <div className="mt-3 space-y-2">
      <AdminButton type="button" disabled={state === 'loading'} onClick={handleSync} className="px-3 py-1.5 text-xs">
        {state === 'loading' ? 'Обновляем snapshot…' : 'Обновить snapshot каталога багета'}
      </AdminButton>
      {state !== 'idle' ? (
        <div className="space-y-1">
          <p role={state === 'error' ? 'alert' : 'status'} className={`text-xs ${feedbackClassName}`}>
            {feedback}
          </p>
          {state === 'error' && diagnostics ? (
            <div className="rounded border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-800">
              <p>Диагностика: строк {rowsCount ?? '—'}.</p>
              <p className="truncate">Заголовки: {headers.length > 0 ? headers.join(', ') : '—'}</p>
              <p>
                Пропуски: hidden={diagnostics.hidden}, missingResidues={diagnostics.missingResidues}, invalidWidth=
                {diagnostics.invalidWidth}, invalidPrice={diagnostics.invalidPrice}, other={diagnostics.other}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
