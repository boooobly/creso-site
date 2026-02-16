import RevealOnScroll from '@/components/RevealOnScroll';

const productionFeatures = ['ЧПУ 2×4 м', 'Печать 3.2 м', 'Сварка и покраска', 'Монтажная бригада'];

const guaranteeItems = [
  'Прозрачные сроки и этапы производства в договоре.',
  'Контроль качества на каждом этапе: от проекта до монтажа.',
  'Собственная команда без передачи подрядчикам.',
  'Гарантийная поддержка и оперативный выезд при необходимости.',
];

export default function ProductionTrustBlock() {
  return (
    <section className="bg-gradient-to-b from-neutral-900 to-neutral-950 py-16 text-neutral-100 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">Производим сами. От проекта до монтажа.</h2>
          <p className="mt-4 text-base text-neutral-300 md:text-lg">Собственная производственная база и монтажная команда.</p>
        </RevealOnScroll>

        <RevealOnScroll className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productionFeatures.map((feature) => (
            <article
              key={feature}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.18)]"
            >
              <p className="text-sm font-semibold tracking-wide text-neutral-100 md:text-base">{feature}</p>
            </article>
          ))}
        </RevealOnScroll>

        <RevealOnScroll className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 text-center text-sm text-neutral-400 md:min-h-[280px]">
            Фото производства (placeholder)
          </div>
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 text-center text-sm text-neutral-400 md:min-h-[280px]">
            Фото монтажа (placeholder)
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <h3 className="text-xl font-semibold">Гарантии и контроль качества</h3>
          <ul className="mt-4 space-y-3 text-sm text-neutral-300 md:text-base">
            {guaranteeItems.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
