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

export async function updatePriceCategory(id: string, payload: unknown) {
  const data = priceCategorySchema.partial().parse(payload);
  return prisma.priceCategory.update({ where: { id }, data });
}

export async function deletePriceCategory(id: string) {
  const itemsCount = await prisma.priceItem.count({ where: { categoryId: id } });

  if (itemsCount > 0) {
    throw new Error('Нельзя удалить категорию, пока в ней есть позиции. Сначала удалите или перенесите позиции.');
  }

  return prisma.priceCategory.delete({ where: { id } });
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

export async function updatePriceItem(id: string, payload: unknown) {
  const data = priceItemSchema.partial().parse(payload);

  return prisma.priceItem.update({
    where: { id },
    data: {
      ...data,
      ...(data.price === undefined ? {} : { price: new Prisma.Decimal(data.price) })
    }
  });
}

export async function deletePriceItem(id: string) {
  return prisma.priceItem.delete({ where: { id } });
}
