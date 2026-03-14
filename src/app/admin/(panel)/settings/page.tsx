import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminSettingsPage() {
  return (
    <AdminSectionScaffold
      title="Настройки"
      description="Базовые параметры админ-панели и безопасный доступ сотрудников."
      blocks={[
        { title: 'Доступ в панель', description: 'Смена пароля администратора и контроль входов.' },
        { title: 'Параметры компании', description: 'Юридическое название, реквизиты и служебные данные.' },
        { title: 'Интеграции', description: 'Подключение почты и внешних сервисов уведомлений.' },
        { title: 'Резерв и экспорт', description: 'Подготовка данных к выгрузке и восстановлению.' }
      ]}
    />
  );
}
