import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logQuoteGeneration } from '@/lib/quote-logging';
import { getWideFormatQuote, type WideFormatPricingInput } from '@/lib/engine';

import { logger } from '@/lib/logger';
const wideFormatQuoteSchema = z.object({
  material: z.enum([
    'banner_240_gloss_3_2m',
    'banner_340_matte_3_2m',
    'banner_440_matte_3_2m',
    'banner_460_cast_3_2m',
    'self_adhesive_film_matte_1_5',
    'self_adhesive_film_gloss_1_5',
    'perforated_film_1_37',
    'clear_film_matte_1_5',
    'paper_trans_skylight',
    'polyester_fabric_140_1_5',
    'polyester_fabric_100_0_9',
    'canvas_cotton_350',
    'canvas_poly_250',
    'backlit_1_07',
    'fxflex_translucent_banner_1_07',
  ]),
  bannerDensity: z.union([z.literal(220), z.literal(300), z.literal(440)]),
  widthInput: z.string(),
  heightInput: z.string(),
  quantityInput: z.string(),
  edgeGluing: z.boolean(),
  imageWelding: z.boolean(),
  grommets: z.boolean(),
  plotterCutByRegistrationMarks: z.boolean(),
  cutByPositioningMarks: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = wideFormatQuoteSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Некорректные параметры расчёта.' }, { status: 400 });
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
        edgeGluing: input.edgeGluing,
        imageWelding: input.imageWelding,
        grommets: input.grommets,
        plotterCutByRegistrationMarks: input.plotterCutByRegistrationMarks,
        cutByPositioningMarks: input.cutByPositioningMarks,
      },
      calculatedPrice: quote.totalCost,
    });
    return NextResponse.json({ quote });
  } catch (error) {
    logger.error('quotes.calculate.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка расчёта.' }, { status: 500 });
  }
}
