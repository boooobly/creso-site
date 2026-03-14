'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavigation } from './admin-navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white lg:h-[calc(100vh-5rem)] lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Внутренняя панель</h2>
          <p className="mt-1 text-xs text-slate-500">Разделы для ежедневной работы офиса</p>
        </div>

        <nav className="grid gap-1 p-3 sm:grid-cols-2 lg:grid-cols-1">
          {adminNavigation.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
