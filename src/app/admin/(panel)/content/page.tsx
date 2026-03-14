import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminContentPage() {
  return (
    <AdminSectionScaffold
      title="Контент сайта"
      description="Управление текстами, блоками и информацией на ключевых страницах сайта."
      blocks={[
        { title: 'Тексты страниц', description: 'Редактирование заголовков, подзаголовков и описаний услуг.' },
        { title: 'Баннеры и блоки', description: 'Включение и обновление промо-блоков на главной странице.' },
        { title: 'Контактная информация', description: 'Телефоны, адреса, мессенджеры и график работы.' },
        { title: 'SEO-поля', description: 'Meta title, description и служебные настройки страниц.' }
      ]}
    />
  );
}
