import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  HandCoins,
  Package,
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
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Page Content', icon: FileText },
  { href: '/admin/pricing', label: 'Prices', icon: HandCoins },
  { href: '/admin/portfolio', label: 'Portfolio', icon: Package },
  { href: '/admin/site-images', label: 'Site Images', icon: Image },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];
