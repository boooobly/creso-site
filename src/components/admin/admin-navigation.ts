import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  HandCoins,
  Package,
  ShoppingCart,
  Image,
  MessageSquareQuote,
  Settings
} from 'lucide-react';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const adminNavigation: AdminNavItem[] = [
  { href: '/admin', label: 'Панель', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Контент страниц', icon: FileText },
  { href: '/admin/pricing', label: 'Цены', icon: HandCoins },
  { href: '/admin/portfolio', label: 'Портфолио', icon: Package },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/site-images', label: 'Изображения сайта', icon: Image },
  { href: '/admin/reviews', label: 'Отзывы', icon: MessageSquareQuote },
  { href: '/admin/settings', label: 'Настройки', icon: Settings }
];
