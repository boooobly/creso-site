import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminReviewsPage() {
  return (
    <AdminSectionScaffold
      title="Модерация отзывов"
      description="Раздел для проверки новых отзывов перед публикацией на сайте."
      blocks={[
        { title: 'Очередь модерации', description: 'Список отзывов, ожидающих проверки администратором.' },
        { title: 'Публикация', description: 'Кнопки одобрения, отклонения и скрытия неактуальных отзывов.' },
        { title: 'Поиск и фильтры', description: 'Быстрый поиск по имени клиента, дате и оценке.' },
        { title: 'История изменений', description: 'Журнал решений по каждому отзыву.' }
      ]}
    />
  );
}
