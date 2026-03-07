import RevealOnScroll from '@/components/RevealOnScroll';
import Image from 'next/image';

const productionFeatures = ['ЧПУ 2×4 м', 'Печать 3.2 м', 'Сварка и покраска', 'Монтажная бригада'];

const guaranteeItems = [
  'Прозрачные сроки и этапы производства в договоре.',
  'Контроль качества на каждом этапе: от проекта до монтажа.',
  'Собственная команда без передачи подрядчикам.',
  'Гарантийная поддержка и оперативный выезд при необходимости.',
];

const productionPlaceholders = [
  {
    title: 'Производство',
    imageSrc: '/images/outdoor_advertising/manufacturing.png',
    imageAlt: 'Производство наружной рекламы',
  },
  {
    title: 'Монтаж',
    imageSrc: '/images/outdoor_advertising/installation.png',
    imageAlt: 'Монтаж наружной рекламы',
  },
] as const;

export default function ProductionTrustBlock() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <RevealOnScroll className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-8">
          <div className="grid gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">Производим сами. От проекта до монтажа.</h2>
                <p className="mt-3 text-base text-neutral-600 md:text-lg">Собственная производственная база и монтажная команда.</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {productionFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {guaranteeItems.map((item) => (
                  <article key={item} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                    <p className="flex items-start gap-2.5 text-sm text-neutral-700 md:text-[15px]">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                      <span>{item}</span>
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {productionPlaceholders.map((item) => (
                <article key={item.title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                  <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                  <div className="relative mt-3 min-h-[160px] overflow-hidden rounded-lg md:min-h-[190px]">
                    <Image src={item.imageSrc} alt={item.imageAlt} fill className="h-full w-full object-cover" sizes="(max-width: 1024px) 100vw, 320px" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-6 border-t border-neutral-200 pt-4 text-sm font-medium text-neutral-700">
            Работаем по договору. Гарантия 5 лет.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
