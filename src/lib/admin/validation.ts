import { Prisma } from '@prisma/client';
import { z } from 'zod';

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().max(500).optional());

const jsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema)
  ])
) as z.ZodType<Prisma.InputJsonValue>;

export const portfolioItemSchema = z.object({
  title: z.string().trim().min(2, 'Название должно содержать минимум 2 символа.').max(180),
  slug: z
    .string()
    .trim()
    .min(2, 'Слаг должен содержать минимум 2 символа.')
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Слаг должен содержать только латиницу, цифры и дефис.'),
  category: z.string().trim().min(2, 'Укажите категорию.').max(120),
  shortDescription: optionalTrimmedString,
  coverImage: optionalTrimmedString,
  galleryImages: z.array(z.string().trim().url('Изображение галереи должно быть валидным URL.')).max(30).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0)
});

export const siteSettingSchema = z.object({
  key: z.string().trim().min(3, 'Ключ должен быть не короче 3 символов.').max(160),
  value: jsonValueSchema,
  type: z.string().trim().min(2, 'Укажите тип поля.').max(40),
  group: z.string().trim().min(2, 'Укажите группу настроек.').max(80),
  label: z.string().trim().min(2, 'Укажите понятное название поля.').max(180),
  description: optionalTrimmedString
});

export const pageContentSchema = z.object({
  pageKey: z.string().trim().min(2, 'Укажите страницу.').max(120),
  sectionKey: z.string().trim().min(2, 'Укажите блок страницы.').max(120),
  fieldKey: z.string().trim().min(2, 'Укажите ключ поля.').max(120),
  value: jsonValueSchema,
  type: z.string().trim().min(2, 'Укажите тип поля.').max(40),
  label: z.string().trim().min(2, 'Укажите название поля.').max(180),
  description: optionalTrimmedString,
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0)
});

export const pricingEntrySchema = z.object({
  category: z.string().trim().min(2, 'Укажите категорию.').max(120),
  subcategory: z.string().trim().max(120).default(''),
  key: z.string().trim().min(2, 'Укажите ключ цены.').max(120),
  label: z.string().trim().min(2, 'Укажите название цены.').max(180),
  value: jsonValueSchema,
  unit: optionalTrimmedString,
  type: z.string().trim().min(2, 'Укажите тип значения.').max(40),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
  isActive: z.boolean().default(true)
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});
