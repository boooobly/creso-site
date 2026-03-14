import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminContentPage() {
  return (
    <AdminSectionScaffold
      title="Page Content"
      description="Редактирование текстов на сайте простыми полями: название страницы, основной подзаголовок, текст кнопки и т.д."
      blocks={[
        { title: 'Главная страница', description: 'Поля: «Заголовок страницы», «Главный подзаголовок», «Текст кнопки».' },
        { title: 'Страницы услуг', description: 'Краткие описания услуг и подписи в карточках.' },
        { title: 'Контакты', description: 'Название блока контактов, подсказки и служебные подписи.' },
        { title: 'SEO по умолчанию', description: 'Базовые заголовки и описания для поисковых систем.' }
      ]}
    />
  );
}
