'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminButton } from '@/components/admin/ui';

type SyncState = 'idle' | 'loading' | 'success' | 'error';

type SyncResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export default function BagetCatalogSyncButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSync = async () => {
    setState('loading');
    setFeedback('Обновляем snapshot каталога багета…');

    try {
      const response = await fetch('/api/admin/baget-catalog/sync', {
        method: 'POST'
      });

      const payload = (await response.json().catch(() => ({}))) as SyncResponse;

      if (!response.ok || payload.ok === false) {
        const errorText = payload.error || 'Не удалось обновить snapshot каталога багета.';
        setState('error');
        setFeedback(errorText);
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
        <p role={state === 'error' ? 'alert' : 'status'} className={`text-xs ${feedbackClassName}`}>
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
