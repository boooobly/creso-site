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
    <section className="bg-neutral-50/70 py-12 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
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

              <div className="grid gap-3">
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {productionPlaceholders.map((item) => (
                <article
                  key={item.title}
                  className="group rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-xl hover:shadow-black/10"
                >
                  <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                  <div className="relative mt-3 min-h-[220px] overflow-hidden rounded-lg md:min-h-[250px]">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-6 border-t border-neutral-200 pt-4 text-sm font-medium text-neutral-700">Работаем по договору. Гарантия 5 лет.</p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
