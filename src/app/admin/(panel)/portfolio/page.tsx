import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminPortfolioPage() {
  return (
    <AdminSectionScaffold
      title="Портфолио"
      description="Управление кейсами и примерами выполненных работ компании."
      blocks={[
        { title: 'Список работ', description: 'Текущие элементы портфолио с превью, категорией и датой.' },
        { title: 'Добавление работы', description: 'Форма для названия, описания, фото и ссылки на проект.' },
        { title: 'Категории', description: 'Упорядочивание работ по направлениям услуг.' },
        { title: 'Порядок отображения', description: 'Настройка приоритета показа на публичной странице.' }
      ]}
    />
  );
}
