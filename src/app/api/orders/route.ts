import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bagetData from '../../../../data/baget.json';
import { bagetQuote } from '@/lib/calculations/bagetQuote';
import { generateOrderNumber } from '@/lib/orders/generateOrderNumber';
import { notifyNewOrder } from '@/lib/notifications/notifyNewOrder';

const bagetItemSchema = z.object({
  id: z.string(),
  article: z.string(),
  name: z.string(),
  color: z.string(),
  style: z.string(),
  width_mm: z.number(),
  price_per_meter: z.number(),
  image: z.string(),
});

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2),
    phone: z.string().trim().min(1),
    email: z.string().trim().email().optional(),
    comment: z.string().trim().optional(),
  }),
  baget: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    quantity: z.number().int().positive().default(1),
    selectedBagetId: z.string().min(1),
    workType: z.enum(['canvas', 'stretchedCanvas', 'rhinestone', 'embroidery', 'beads', 'photo', 'other']),
    glazing: z.enum(['none', 'glass', 'antiReflectiveGlass', 'museumGlass', 'plexiglass', 'pet1mm']),
    hasPassepartout: z.boolean(),
    passepartoutSize: z.number().min(0).optional(),
    passepartoutBottomSize: z.number().min(0).optional(),
    backPanel: z.boolean(),
    hangerType: z.enum(['crocodile', 'wire']).nullable().optional(),
    stand: z.boolean(),
    stretcherType: z.enum(['narrow', 'wide']).nullable().optional(),
  }),
  fulfillmentType: z.enum(['pickup', 'selfPickup', 'delivery']).default('pickup'),
  company: z.string().optional(),
});

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11 || !digits.startsWith('7')) {
    return null;
  }
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = orderSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    if (parsed.data.company?.trim()) {
      return NextResponse.json({ ok: true });
    }

    const normalizedPhone = normalizePhone(parsed.data.customer.phone);
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    const allBagets = z.array(bagetItemSchema).parse(bagetData);
    const selectedBaget = allBagets.find((item) => item.id === parsed.data.baget.selectedBagetId);

    if (!selectedBaget) {
      return NextResponse.json({ ok: false, error: 'Выбранный багет не найден.' }, { status: 400 });
    }

    const quote = bagetQuote({
      ...parsed.data.baget,
      selectedBaget,
    });

    if (quote.total <= 0) {
      return NextResponse.json({ ok: false, error: 'Не удалось рассчитать стоимость заказа.' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const prepayRequired = parsed.data.fulfillmentType === 'pickup' || parsed.data.fulfillmentType === 'selfPickup';
    const prepayAmount = prepayRequired ? Math.round(quote.total * 0.5) : null;

    await notifyNewOrder({
      orderNumber,
      customer: {
        ...parsed.data.customer,
        phone: normalizedPhone,
      },
      effectiveSize: quote.effectiveSize,
      quote,
      prepayRequired,
      prepayAmount,
    });

    return NextResponse.json({
      orderNumber,
      quote,
      prepayRequired,
      prepayAmount,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заказа.' }, { status: 500 });
  }
}
