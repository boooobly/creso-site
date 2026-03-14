import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminOrdersPage() {
  return (
    <AdminSectionScaffold
      title="Управление заказами"
      description="Здесь будут список заказов, фильтры по статусам и карточка каждого клиента."
      blocks={[
        { title: 'Список заказов', description: 'Таблица с номером, датой, услугой, суммой и текущим статусом.' },
        { title: 'Статусы обработки', description: 'Перевод заказа между этапами: новый, в работе, выполнен.' },
        { title: 'Карточка клиента', description: 'Контакты, комментарии менеджера и история взаимодействия.' },
        { title: 'Уведомления', description: 'Быстрые действия для подтверждения и связи с клиентом.' }
      ]}
    />
  );
}
