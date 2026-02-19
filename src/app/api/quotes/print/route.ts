import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logQuoteGeneration } from '@/lib/quote-logging';
import { getPrintQuote, type PrintPricingInput } from '@/lib/engine';

import { logger } from '@/lib/logger';
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
      return NextResponse.json({ ok: false, error: 'Некорректные параметры расчёта.' }, { status: 400 });
    }

    const input: PrintPricingInput = parsed.data;
    const quote = getPrintQuote(input);

    logQuoteGeneration({
      calculatorType: 'print',
      inputParameters: {
        productType: input.productType,
        size: input.size,
        density: input.density,
        printType: input.printType,
        lamination: input.lamination,
        presetQuantity: input.presetQuantity,
        customQuantityInput: input.customQuantityInput,
      },
      calculatedPrice: quote.totalPrice,
    });
    return NextResponse.json({ quote });
  } catch (error) {
    logger.error('quotes.calculate.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка расчёта.' }, { status: 500 });
  }
}
