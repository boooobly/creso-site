import RevealOnScroll from '@/components/RevealOnScroll';
import Image from 'next/image';

const productionFeatures = ['ЧПУ 2×4 м', 'Печать 3.2 м', 'Сварка и покраска', 'Монтажная бригада'];

const guaranteeItems = [
  'Показываем этапы производства и фото готовности до выезда на монтаж.',
  'Проверяем свет, крепёж и геометрию конструкции перед отгрузкой.',
  'Монтаж выполняет штатная команда, знакомая с нашими техрешениями.',
  'После сдачи остаёмся на связи по гарантийным и сервисным обращениям.',
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
    <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] bg-neutral-50/70 py-12 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="card p-6 md:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="t-h2">Производим сами. От проекта до монтажа.</h2>
                <p className="t-lead mt-3">Этот блок — подтверждение, что ключевые этапы выполняем своей командой.</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {productionFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="t-small rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-medium text-neutral-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="grid gap-3">
                {guaranteeItems.map((item) => (
                  <article key={item} className="card-structured rounded-xl p-3.5">
                    <p className="t-body flex items-start gap-2.5 text-neutral-700">
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
                  className="card-visual card-interactive group relative isolate min-h-[250px] overflow-hidden bg-neutral-900"
                >
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-t from-black/80 via-black/45 to-black/15" />
                  <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl border border-white/30 bg-black/35 px-3.5 py-2.5 backdrop-blur-sm md:inset-x-5 md:bottom-5">
                    <h3 className="t-h4 !text-base text-white">{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p className="t-small mt-6 border-t border-neutral-200 pt-4 font-medium text-neutral-700">Работаем по договору. Гарантия 5 лет.</p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
