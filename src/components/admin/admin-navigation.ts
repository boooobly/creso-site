import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Settings,
  FileText,
  HandCoins
} from 'lucide-react';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const adminNavigation: AdminNavItem[] = [
  { href: '/admin', label: 'Панель', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Заказы', icon: ClipboardList },
  { href: '/admin/reviews', label: 'Отзывы', icon: MessageSquareQuote },
  { href: '/admin/portfolio', label: 'Портфолио', icon: Package },
  { href: '/admin/pricing', label: 'Прайс', icon: HandCoins },
  { href: '/admin/content', label: 'Контент', icon: FileText },
  { href: '/admin/settings', label: 'Настройки', icon: Settings }
];
