import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logQuoteGeneration } from '@/lib/quote-logging';
import { getWideFormatQuote, type WideFormatPricingInput } from '@/lib/engine';

const wideFormatQuoteSchema = z.object({
  material: z.enum(['banner', 'selfAdhesiveFilm', 'backlit', 'perforatedFilm', 'posterPaper']),
  bannerDensity: z.union([z.literal(220), z.literal(300), z.literal(440)]),
  widthInput: z.string(),
  heightInput: z.string(),
  quantityInput: z.string(),
  grommetsInput: z.string(),
  edgeGluing: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = wideFormatQuoteSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректные параметры расчёта.' }, { status: 400 });
    }

    const input: WideFormatPricingInput = parsed.data;
    const quote = getWideFormatQuote(input);

    logQuoteGeneration({
      calculatorType: 'wide-format',
      inputParameters: {
        material: input.material,
        bannerDensity: input.bannerDensity,
        widthInput: input.widthInput,
        heightInput: input.heightInput,
        quantityInput: input.quantityInput,
        grommetsInput: input.grommetsInput,
        edgeGluing: input.edgeGluing,
      },
      calculatedPrice: quote.totalCost,
    });
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: 'Ошибка расчёта.' }, { status: 500 });
  }
}
