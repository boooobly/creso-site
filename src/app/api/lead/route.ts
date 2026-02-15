import { NextResponse } from 'next/server';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  service: z.string().min(2),
  message: z.string().optional(),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    const calculationDetails = parsed.data.message?.includes('Расчёт:') ? parsed.data.message : undefined;

    return NextResponse.json({ ok: true, calculationDetails });
  } catch {
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}
