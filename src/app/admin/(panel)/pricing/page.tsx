import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminPricingPage() {
  return (
    <div className="space-y-6">
      <AdminSectionScaffold
        title="Prices"
        description="Общие цены услуг и дополнительных материалов. Поля будут простыми: «Название», «Цена», «Единица измерения»."
        blocks={[
          { title: 'Категории цен', description: 'Например: печать, вывески, монтаж, дополнительные услуги.' },
          { title: 'Позиции внутри категории', description: 'Каждая строка: название, цена, единица, краткое описание.' },
          { title: 'Включено/скрыто', description: 'Можно временно скрыть позицию, не удаляя ее из системы.' },
          { title: 'Порядок отображения', description: 'Простая настройка порядка вывода на сайте.' }
        ]}
      />

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-amber-900">Важно: багет и цены</h3>
        <p className="mt-2 text-sm text-amber-800">
          Каталог багета и базовые цены рам остаются в Google Sheets. В админке редактируются только дополнительные
          материалы: стекло, ПВХ, картон, паспарту, подвесы, задники и другие доп. опции.
        </p>
      </section>
    </div>
  );
}
