'use client';

export default function OrdersAdminError() {
  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-rose-900">Раздел заказов временно недоступен</h2>
      <p className="mt-2 text-sm text-rose-700">
        Не удалось получить данные по заказам. Обновите страницу или попробуйте снова через минуту.
      </p>
    </section>
  );
}
