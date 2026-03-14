import AdminSectionScaffold from '@/components/admin/AdminSectionScaffold';

export default function AdminSettingsPage() {
  return (
    <AdminSectionScaffold
      title="Settings"
      description="Глобальные настройки компании и сайта. Поля будут с понятными названиями: «Телефон», «Email», «Адрес»."
      blocks={[
        { title: 'Контакты компании', description: 'Телефон, email, адрес и рабочие часы.' },
        { title: 'Мессенджеры', description: 'Ссылки на Telegram, WhatsApp и другие каналы.' },
        { title: 'SEO по умолчанию', description: 'Базовый заголовок и описание, если на странице они не заданы.' },
        { title: 'Безопасность входа', description: 'Управление доступом в админ-панель.' }
      ]}
    />
  );
}
