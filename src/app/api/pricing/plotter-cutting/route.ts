import { NextResponse } from 'next/server';
import { getPlotterCuttingPricingConfig } from '@/lib/plotter-cutting/plotterCuttingPricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const pricing = await getPlotterCuttingPricingConfig();
  return NextResponse.json({ ok: true, ...pricing });
}
