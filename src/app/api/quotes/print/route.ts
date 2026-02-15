import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrintQuote, type PrintPricingInput } from '@/lib/engine';

const printQuoteSchema = z.object({
  productType: z.enum(['cards', 'flyers']),
  size: z.string().min(1),
  density: z.union([z.literal(300), z.literal(350), z.literal(400)]),
  printType: z.enum(['single', 'double']),
  lamination: z.boolean(),
  presetQuantity: z.number(),
  customQuantityInput: z.string(),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = printQuoteSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректные параметры расчёта.' }, { status: 400 });
    }

    const input: PrintPricingInput = parsed.data;
    const quote = getPrintQuote(input);

    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: 'Ошибка расчёта.' }, { status: 500 });
  }
}
