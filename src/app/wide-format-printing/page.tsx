import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';

export default function WideFormatPrintingPage() {
  const trustMarkers = [
    '720 dpi, 6 проходов',
    'Ширина рулона до 3.2 м',
    'Срок изготовления от 1 рабочего дня',
    'Рекламным агентствам -10% (по запросу)',
    'Юрлицам - оплата по счету',
  ];
  const features = [
    {
      title: 'Собственное производство',
      description: 'Полный цикл печати без посредников',
    },
    {
      title: 'Проверка макета',
      description: 'Проверяем файлы перед запуском в печать',
    },
    {
      title: 'Контроль цвета',
      description: 'Калиброванное оборудование и точность передачи',
    },
    {
      title: 'Работа по договору',
      description: 'Заключаем официальный договор при необходимости',
    },
  ];

  return (
    <div>
      <Section className="pt-6 pb-4 md:pt-10 md:pb-6">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Широкоформатная печать до 3.2 м</h1>
          <p className="mt-3 text-neutral-600">Материалы, интерьерная/уличная печать, варианты постобработки.</p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
            {trustMarkers.map((marker) => (
              <p key={marker} className="inline-flex items-center gap-2">
                <span className="text-emerald-600" aria-hidden="true">✔</span>
                <span>{marker}</span>
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-4 pb-12 md:pt-6">
        <div className="space-y-10">
          <WideFormatPricingCalculator />

          <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="text-2xl font-semibold">Нужна фигурная резка?</h2>
              <p className="text-neutral-700">Перейдите к услуге плоттерной резки.</p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <Link href="/plotter-cutting" className="btn-primary w-full text-center no-underline md:w-auto">Перейти к плоттерной резке</Link>
            </div>
          </div>

          <section className="mt-10 rounded-2xl border-2 border-muted-foreground/20 bg-muted/40 p-6 shadow-sm md:p-8">
            <div className="mb-4 h-1 w-16 rounded-full bg-red-500/80" />
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="text-xl font-semibold md:text-2xl">📌 Почему выбирают нас</h3>
              <p className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs text-muted-foreground">
                4 причины
              </p>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <OrderWideFormatForm />
        </div>
      </Section>
    </div>
  );
}
