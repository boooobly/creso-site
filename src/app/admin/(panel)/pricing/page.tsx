import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminPricingPage() {
  return (
    <AdminSectionScaffold
      title="Прайс и цены"
      description="Раздел для поддержки актуальных цен на услуги и материалы."
      blocks={[
        { title: 'Прайс-лист', description: 'Таблица с позициями, единицами измерения и текущими ценами.' },
        { title: 'Массовое обновление', description: 'Быстрое обновление группы цен по выбранной категории.' },
        { title: 'Публикация изменений', description: 'Подтверждение перед применением новых цен на сайте.' },
        { title: 'История правок', description: 'Кто и когда изменял цены в последний раз.' }
      ]}
    />
  );
}
