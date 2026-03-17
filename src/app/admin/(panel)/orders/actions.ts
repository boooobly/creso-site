'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/admin/orders';

const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  managerNote: z.string().max(5000).optional()
});

export async function updateOrderAdminAction(orderId: string, formData: FormData) {
  const parsed = updateOrderSchema.safeParse({
    status: String(formData.get('status') ?? ''),
    paymentStatus: String(formData.get('paymentStatus') ?? ''),
    managerNote: String(formData.get('managerNote') ?? '').trim()
  });

  if (!parsed.success) {
    redirect(`/admin/orders/${orderId}?error=validation`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: parsed.data.status,
      paymentStatus: parsed.data.paymentStatus,
      managerNote: parsed.data.managerNote || null
    }
  });

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?success=saved`);
}
