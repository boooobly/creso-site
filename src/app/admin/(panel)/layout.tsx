import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect('/admin/login?next=/admin');
  }

  const newOrdersCount = await prisma.order.count({
    where: { status: 'new' }
  });

  return <AdminShell newOrdersCount={newOrdersCount}>{children}</AdminShell>;
}
