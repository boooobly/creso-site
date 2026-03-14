import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminReviewsPage() {
  return (
    <AdminSectionScaffold
      title="Reviews"
      description="Проверка отзывов перед публикацией. Интерфейс рассчитан на быструю ежедневную модерацию."
      blocks={[
        { title: 'Новые отзывы', description: 'Список отзывов, которые ожидают проверки.' },
        { title: 'Решение по отзыву', description: 'Кнопки «Опубликовать» или «Отклонить».' },
        { title: 'Поиск', description: 'Поиск по имени клиента и тексту отзыва.' },
        { title: 'Архив', description: 'Просмотр уже обработанных отзывов.' }
      ]}
    />
  );
}
