import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logQuoteGeneration } from '@/lib/quote-logging';
import { getHeatTransferQuote, type HeatTransferPricingInput } from '@/lib/engine';

const heatTransferQuoteSchema = z.object({
  productType: z.enum(['mug', 'tshirt', 'film']),
  mugType: z.enum(['white330', 'chameleon']),
  mugPrintType: z.enum(['single', 'wrap']),
  mugQuantity: z.number(),
  tshirtQuantity: z.number(),
  useOwnClothes: z.boolean(),
  filmLengthInput: z.string(),
  filmUrgent: z.boolean(),
  filmTransfer: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = heatTransferQuoteSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректные параметры расчёта.' }, { status: 400 });
    }

    const input: HeatTransferPricingInput = parsed.data;
    const quote = getHeatTransferQuote(input);

    logQuoteGeneration({
      calculatorType: 'heat-transfer',
      inputParameters: {
        productType: input.productType,
        mugType: input.mugType,
        mugPrintType: input.mugPrintType,
        mugQuantity: input.mugQuantity,
        tshirtQuantity: input.tshirtQuantity,
        useOwnClothes: input.useOwnClothes,
        filmLengthInput: input.filmLengthInput,
        filmUrgent: input.filmUrgent,
        filmTransfer: input.filmTransfer,
      },
      calculatedPrice: quote.total,
    });
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: 'Ошибка расчёта.' }, { status: 500 });
  }
}
