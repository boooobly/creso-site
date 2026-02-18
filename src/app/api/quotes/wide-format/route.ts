import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logQuoteGeneration } from '@/lib/quote-logging';
import { getWideFormatQuote, type WideFormatPricingInput } from '@/lib/engine';

const wideFormatQuoteSchema = z.object({
  material: z.enum([
    'banner_240_gloss_3_2m',
    'banner_330',
    'banner_440',
    'banner_460_cast_3_2m',
    'banner_mesh_380_3_2m',
    'banner_510_cast_3_2m',
    'self_adhesive_film_gloss',
    'perforated_film_1_37',
    'paper_dupaper_blue_120',
    'paper_trans_skylight',
    'trans_film_1_27',
    'polyester_fabric_140',
    'flag_fabric_with_liner',
    'canvas_cotton_350',
    'canvas_poly_260',
    'backlit_1_07',
    'photo_paper_220',
    'customer_roll_textured',
    'customer_roll_smooth',
  ]),
  bannerDensity: z.union([z.literal(220), z.literal(300), z.literal(440)]),
  widthInput: z.string(),
  heightInput: z.string(),
  quantityInput: z.string(),
  edgeGluing: z.boolean(),
  imageWelding: z.boolean(),
  plotterCutByRegistrationMarks: z.boolean(),
  cutByPositioningMarks: z.boolean(),
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
        edgeGluing: input.edgeGluing,
        imageWelding: input.imageWelding,
        plotterCutByRegistrationMarks: input.plotterCutByRegistrationMarks,
        cutByPositioningMarks: input.cutByPositioningMarks,
      },
      calculatedPrice: quote.totalCost,
    });
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: 'Ошибка расчёта.' }, { status: 500 });
  }
}
