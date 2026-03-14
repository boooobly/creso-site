'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': {
    title: 'Панель управления',
    subtitle: 'Краткий обзор текущей активности на сайте'
  },
  '/admin/orders': {
    title: 'Заказы',
    subtitle: 'Новые обращения и статус обработки'
  },
  '/admin/reviews': {
    title: 'Отзывы',
    subtitle: 'Модерация и публикация отзывов клиентов'
  },
  '/admin/portfolio': {
    title: 'Портфолио',
    subtitle: 'Работы компании и их содержание'
  },
  '/admin/pricing': {
    title: 'Прайс',
    subtitle: 'Цены услуг и контроль актуальности'
  },
  '/admin/content': {
    title: 'Контент',
    subtitle: 'Тексты и блоки на страницах сайта'
  },
  '/admin/settings': {
    title: 'Настройки',
    subtitle: 'Основные параметры панели и сайта'
  }
};

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const pageMeta = pageTitles[pathname] ?? {
    title: 'Админ-панель',
    subtitle: 'Управление сайтом'
  };

  return (
    <div className="mx-auto -mt-8 w-screen max-w-none bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar title={pageMeta.title} subtitle={pageMeta.subtitle} />
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
