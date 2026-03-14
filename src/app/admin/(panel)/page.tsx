import { ArrowRight, MessageSquareQuote, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { AdminPageSection } from '@/components/admin/AdminPageSection';

const stats = [
  {
    title: 'Новые заказы',
    value: '12',
    hint: 'За последние 7 дней',
    icon: ShoppingCart
  },
  {
    title: 'Отзывы на модерации',
    value: '4',
    hint: 'Ожидают проверки',
    icon: MessageSquareQuote
  },
  {
    title: 'Позиции в портфолио',
    value: '37',
    hint: 'Опубликовано на сайте',
    icon: Package
  }
];

const quickLinks = [
  { href: '/admin/orders', label: 'Посмотреть новые заказы' },
  { href: '/admin/reviews', label: 'Проверить отзывы' },
  { href: '/admin/content', label: 'Обновить контент страниц' }
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{item.title}</p>
                <Icon size={18} className="text-slate-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
            </article>
          );
        })}
      </section>

      <AdminPageSection
        title="Быстрые действия"
        description="Самые частые действия для ежедневной работы администратора."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <span>{item.label}</span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </AdminPageSection>
    </div>
  );
}
