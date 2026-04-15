import Link from 'next/link';
import { AdminPageSection } from '@/components/admin/AdminPageSection';

const sections = [
  {
    href: '/admin/content',
    title: 'Контент страниц',
    description: 'Заголовки, подзаголовки, тексты кнопок и блоков на страницах сайта.'
  },
  {
    href: '/admin/pricing',
    title: 'Цены',
    description: 'Общие цены услуг и дополнительные материалы для багета (стекло, ПВХ, паспарту и т.д.).'
  },
  {
    href: '/admin/portfolio',
    title: 'Портфолио',
    description: 'Примеры работ: добавление, редактирование, публикация и порядок показа.'
  },
  {
    href: '/admin/site-images',
    title: 'Изображения сайта',
    description: 'Загрузка и хранение изображений для страниц, баннеров и портфолио.'
  },
  {
    href: '/admin/reviews',
    title: 'Отзывы',
    description: 'Проверка и публикация клиентских отзывов.'
  },
  {
    href: '/admin/orders',
    title: 'Заявки',
    description: 'Список заявок, статусы обработки и контроль оплат по каждому заказу.'
  },
  {
    href: '/admin/health',
    title: 'Системное здоровье',
    description: 'Статусы ключевых интеграций: база, адрес сайта, уведомления, загрузки и источники данных.'
  },
  {
    href: '/admin/settings',
    title: 'Настройки',
    description: 'Контакты, адрес, рабочие часы, SEO-параметры по умолчанию и общие настройки.'
  }
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageSection
        title="С чего начать"
        description="Выберите раздел. Подписи сделаны простым языком, чтобы быстро понять, что именно можно изменить."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{section.description}</p>
            </Link>
          ))}
        </div>
      </AdminPageSection>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-amber-900">Важно по разделу багета</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
          <li>Каталог багета и базовые цены рам — ведутся в Google Sheets.</li>
          <li>В этой админке редактируются только дополнительные материалы: стекло, ПВХ, картон, паспарту, подвесы и другие допы.</li>
          <li>Пожалуйста, не переносите карточки багета и базовые цены рам в эту панель.</li>
        </ul>
      </section>
    </div>
  );
}
