import { NextResponse } from 'next/server';
import { getPlotterCuttingPricingConfig } from '@/lib/plotter-cutting/plotterCuttingPricing';

export const runtime = 'nodejs';

export async function GET() {
  const pricing = await getPlotterCuttingPricingConfig();
  return NextResponse.json({ ok: true, ...pricing });
}
