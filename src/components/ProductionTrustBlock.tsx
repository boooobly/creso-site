import RevealOnScroll from '@/components/RevealOnScroll';
import ProtectedImage from '@/components/ui/ProtectedImage';

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
const guaranteeRevealDelays = ['', 'delay-75', 'delay-150', 'delay-200'] as const;
const productionImageRevealDelays = ['', 'delay-150'] as const;
const featureRevealDelays = ['', 'delay-75', 'delay-150', 'delay-200'] as const;

export default function ProductionTrustBlock() {
  return (
    <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] bg-neutral-50/70 py-12 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="card p-6 md:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8">
            <div className="space-y-6">
              <RevealOnScroll>
                <h2 className="t-h2">Производим сами. От проекта до монтажа.</h2>
                <p className="t-lead mt-3">Этот блок — подтверждение, что ключевые этапы выполняем своей командой.</p>
              </RevealOnScroll>

              <RevealOnScroll className="delay-75">
                <div className="grid max-w-sm grid-cols-2 gap-2.5">
                  {productionFeatures.map((feature, index) => (
                    <RevealOnScroll key={feature} className={featureRevealDelays[index]}>
                      <span
                        className="t-small inline-flex min-h-9 w-full items-center justify-center rounded-full border border-[var(--brand-red)]/40 bg-white/85 px-3 py-1.5 text-center font-medium text-neutral-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--brand-red)]/55 hover:bg-red-50/35"
                      >
                        {feature}
                      </span>
                    </RevealOnScroll>
                  ))}
                </div>
              </RevealOnScroll>

              <div className="grid gap-3">
                {guaranteeItems.map((item, index) => (
                  <RevealOnScroll key={item} className={guaranteeRevealDelays[index]}>
                    <article className="card-structured card-interactive rounded-xl p-3.5">
                      <p className="t-body flex items-start gap-2.5 text-neutral-700">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                        <span>{item}</span>
                      </p>
                    </article>
                  </RevealOnScroll>
                ))}
              </div>
            </div>

            <div className="grid gap-4 self-center sm:grid-cols-2 lg:grid-cols-1">
              {productionPlaceholders.map((item, index) => (
                <RevealOnScroll key={item.title} className={productionImageRevealDelays[index]}>
                  <article className="card-visual card-interactive group relative isolate min-h-[250px] overflow-hidden bg-neutral-900 select-none">
                    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                      <ProtectedImage
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        sizes="(max-width: 1024px) 100vw, 500px"
                      />
                    </div>
                    <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 z-10 md:inset-x-5 md:bottom-5">
                      <h3 className="t-h4 !text-base !text-white">{item.title}</h3>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <p className="t-small mt-6 border-t border-neutral-200 pt-4 font-medium text-neutral-700">Работаем по договору. Гарантия 5 лет.</p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
