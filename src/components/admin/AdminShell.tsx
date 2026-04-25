'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': {
    title: 'Панель',
    subtitle: 'Быстрый вход в ключевые разделы админ-панели'
  },
  '/admin/content': {
    title: 'Контент страниц',
    subtitle: 'Тексты и подписи на страницах сайта'
  },
  '/admin/pricing': {
    title: 'Цены',
    subtitle: 'Цены услуг и дополнительных материалов'
  },
  '/admin/portfolio': {
    title: 'Портфолио',
    subtitle: 'Примеры выполненных работ для сайта'
  },
  '/admin/orders': {
    title: 'Заказы',
    subtitle: 'Все заявки клиентов и их текущие статусы'
  },
  '/admin/site-images': {
    title: 'Изображения сайта',
    subtitle: 'Изображения и визуальные материалы сайта'
  },
  '/admin/reviews': {
    title: 'Отзывы',
    subtitle: 'Отзывы клиентов и их модерация'
  },
  '/admin/health': {
    title: 'Системное здоровье',
    subtitle: 'Проверка критичных настроек и источников данных'
  },
  '/admin/settings': {
    title: 'Настройки',
    subtitle: 'Контакты компании и системные настройки'
  }
};

type AdminShellProps = {
  children: ReactNode;
  newOrdersCount: number;
};

function resolvePageMeta(pathname: string) {
  if (pathname.startsWith('/admin/portfolio')) return pageTitles['/admin/portfolio'];
  if (pathname.startsWith('/admin/site-images')) return pageTitles['/admin/site-images'];

  return (
    pageTitles[pathname] ?? {
      title: 'Админ-панель',
      subtitle: 'Управление контентом сайта'
    }
  );
}

export default function AdminShell({ children, newOrdersCount }: AdminShellProps) {
  const pathname = usePathname();
  const pageMeta = resolvePageMeta(pathname);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        <AdminSidebar newOrdersCount={newOrdersCount} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar title={pageMeta.title} subtitle={pageMeta.subtitle} />
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
