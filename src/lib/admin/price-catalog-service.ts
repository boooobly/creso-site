import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { priceCategorySchema, priceItemSchema } from './validation';

export async function listPriceCatalog() {
  return prisma.priceCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      items: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
      }
    }
  });
}

export async function createPriceCategory(payload: unknown) {
  const data = priceCategorySchema.parse(payload);
  return prisma.priceCategory.create({ data });
}

export async function createPriceItem(payload: unknown) {
  const data = priceItemSchema.parse(payload);
  return prisma.priceItem.create({
    data: {
      ...data,
      price: new Prisma.Decimal(data.price)
    }
  });
}
