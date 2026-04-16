import { getAdminSystemHealth, type HealthStatusLevel } from '@/lib/admin/system-health';

const statusStyles: Record<HealthStatusLevel, string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
};

export default async function AdminHealthPage() {
  const health = await getAdminSystemHealth();
  const hasReliabilityWarning = health.items.some((item) =>
    (item.key === 'database' || item.key === 'pricing_source') && item.status !== 'ok',
  );

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Системное здоровье</h1>
        <p className="mt-2 text-sm text-slate-600">
          Короткая проверка ключевых настроек. Здесь показываются только статусы и объяснения без секретных данных.
        </p>
        <p className="mt-2 text-xs text-slate-500">Проверено: {new Date(health.checkedAt).toLocaleString('ru-RU')}</p>
      </section>

      {hasReliabilityWarning ? (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <p className="text-sm font-semibold">Внимание владельцу: сайт работает с ограничениями надёжности</p>
          <p className="mt-1 text-xs leading-5">
            Обнаружены предупреждения по базе данных или источнику прайса. Проверьте карточки ниже: при fallback-режиме
            расчёты и часть данных могут опираться на встроенные значения.
          </p>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        {health.items.map((item) => (
          <article key={item.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusStyles[item.status]}`}>
                {item.statusLabel}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">{item.summary}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{item.details}</p>
            {item.key === 'baguette_catalog_snapshot' ? (
              <form method="post" action="/api/admin/baget-catalog/sync" className="mt-3">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Обновить snapshot каталога багета
                </button>
              </form>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
