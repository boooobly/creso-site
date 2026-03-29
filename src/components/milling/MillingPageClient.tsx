'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Cog,
  FileUp,
  Layers3,
  Maximize,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react';
import Section from '@/components/layout/Section';
import OrderMillingForm from '@/components/OrderMillingForm';
import MillingMaterialsAccordion from '@/components/MillingMaterialsAccordion';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll';
import type { MillingAdditionalServiceGroup, MillingMaterialGroup } from '@/lib/pricing-config/milling';

type MillingPageClientProps = {
  materialGroups: MillingMaterialGroup[];
  additionalServiceGroups: MillingAdditionalServiceGroup[];
  minimumOrderTotal: number;
  startingPricePerMeter: number;
};

function formatNumber(value: number) {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 0,
    maximumFractionDigits: 2,
  });
}

const steps = [
  {
    title: 'Отправляете макет',
    description: 'Загружаете файл, указываете материал и основные параметры заказа.',
    icon: FileUp,
  },
  {
    title: 'Проверяем и подтверждаем стоимость',
    description: 'Сверяем макет, толщину, материал и сообщаем итоговую цену.',
    icon: ClipboardCheck,
  },
  {
    title: 'Запускаем фрезеровку',
    description: 'Передаём заказ в работу и изготавливаем детали на оборудовании.',
    icon: Cog,
  },
];

const galleryItems = [
  { title: 'Акрил 8 мм', image: '/images/milling/milling_acryl.png' },
  { title: 'АКП 4 мм', image: '/images/milling/milling_acp.png' },
  { title: 'ПВХ 10 мм', image: '/images/milling/milling_pvc.png' },
];

const whyChooseUs = [
  { title: 'Собственная производственная база', icon: CheckCircle2 },
  { title: 'Помогаем подготовить макет', icon: Sparkles },
  { title: 'Работаем с материалом клиента', icon: Truck },
  { title: 'Контроль качества на каждом этапе', icon: ShieldCheck },
];

const heroHighlights = [
  {
    title: 'Точность обработки',
    description: 'Стабильная геометрия и аккуратная кромка на серийных и штучных заказах.',
    icon: Cog,
  },
  {
    title: 'Рабочее поле 2×4 м',
    description: 'Обрабатываем крупные листовые материалы без дробления макета.',
    icon: Maximize,
  },
  {
    title: 'Поддержка инженера',
    description: 'Проверяем векторный файл и согласовываем запуск перед производством.',
    icon: ClipboardCheck,
  },
];

const revealBase =
  'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none';

export default function MillingPageClient({
  materialGroups,
  additionalServiceGroups,
  minimumOrderTotal,
  startingPricePerMeter,
}: MillingPageClientProps) {
  const [heroVisible, setHeroVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  const howReveal = useRevealOnScroll<HTMLDivElement>();
  const servicesReveal = useRevealOnScroll<HTMLDivElement>();
  const galleryReveal = useRevealOnScroll<HTMLDivElement>();

  const quickInfo = [
    `Минимальный заказ - ${formatNumber(minimumOrderTotal)} ₽`,
    'Цены без учета материала',
    'По вашим векторным файлам',
  ];

  const heroKpi = [
    `от ${formatNumber(startingPricePerMeter)} ₽/м.п.`,
    'Максимальный размер 2×4 м',
    'Работаем с материалом заказчика',
  ];

  const workConditions = [
    { title: `Минимальный заказ — ${formatNumber(minimumOrderTotal)} ₽`, icon: ClipboardCheck },
    { title: 'Цены указаны без стоимости материала', icon: Layers3 },
    { title: 'Максимальный размер заготовки — 2×4 м', icon: Maximize },
    { title: 'Подготовительные и постобрабатывающие работы согласовываются отдельно', icon: Wrench },
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const rafId = window.requestAnimationFrame(() => {
      setHeroVisible(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const updateFloatingCtaVisibility = () => {
      const orderSection = document.getElementById('milling-order');
      if (!orderSection) {
        setShowFloatingCta(false);
        return;
      }

      const scrolledPastHero = window.scrollY > 200;
      const rect = orderSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const orderSectionVisible = rect.top <= viewportHeight * 0.85 && rect.bottom >= 120;

      setShowFloatingCta(scrolledPastHero && !orderSectionVisible);
    };

    updateFloatingCtaVisibility();
    window.addEventListener('scroll', updateFloatingCtaVisibility, { passive: true });
    window.addEventListener('resize', updateFloatingCtaVisibility);

    return () => {
      window.removeEventListener('scroll', updateFloatingCtaVisibility);
      window.removeEventListener('resize', updateFloatingCtaVisibility);
    };
  }, []);

  const revealClass = (isVisible: boolean) =>
    `${revealBase} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} motion-reduce:translate-y-0 motion-reduce:opacity-100`;

  const scrollToOrderSection = () => {
    document.getElementById('milling-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <Section className="pt-8 pb-6 md:pt-10 md:pb-8">
        <PageHero
          className={`border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20 p-6 shadow-sm shadow-neutral-200/60 md:p-8 lg:p-10 ${revealClass(heroVisible)}`}
          contentClassName="space-y-6 lg:pr-2"
          media={
            <HeroMediaPanel className="border-neutral-200/90 bg-neutral-100/90 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-neutral-200/80 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Технический профиль</p>
                <span className="inline-flex size-8 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                  <Cog className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <div className="space-y-3">
                {heroHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="card-structured rounded-xl border-neutral-200/90 bg-white/80 p-3.5 dark:bg-neutral-900/70">
                      <div className="flex gap-3">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-200/70 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{item.description}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </HeroMediaPanel>
          }
        >
          <div className="space-y-4">
            <HeroEyebrow>Фрезеровка</HeroEyebrow>
            <HeroTitle className="max-w-3xl text-3xl md:text-5xl">Фрезеровка листовых материалов</HeroTitle>
            <HeroLead className="max-w-3xl dark:text-neutral-300">
              Точная 2D-фрезеровка пластика, композита и древесных плит на производстве полного цикла. От единичных заказов до серий с контролем качества на каждом этапе.
            </HeroLead>
          </div>

          <HeroChipList className="flex flex-wrap gap-2 md:gap-3">
            {heroKpi.map((item, index) => (
              <HeroChip
                key={item}
                className={`border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-100 ${revealClass(heroVisible)}`}
                style={{ transitionDelay: reduceMotion ? '0ms' : `${index * 120}ms` }}
              >
                {item}
              </HeroChip>
            ))}
          </HeroChipList>

          <HeroActions>
            <button
              type="button"
              onClick={scrollToOrderSection}
              className="inline-flex w-fit items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              Рассчитать заказ
            </button>
          </HeroActions>
        </PageHero>
      </Section>

      <Section className="pt-2 md:pt-4">
        <div id="milling-prices" className="card p-6 md:p-8 scroll-mt-24">
          <div className="section-header-tight mb-4">
            <p className="t-eyebrow">Прайс и материалы</p>
            <h2 className="t-h3">Прайс по материалам</h2>
            <p className="t-body text-muted-foreground max-w-3xl">
              Стоимость указана за погонный метр фрезеровки. Итоговая сумма зависит от толщины, сложности и дополнительных операций.
            </p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {quickInfo.map((item) => (
              <span key={item} className="inline-flex items-center rounded-full border border-neutral-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200">{item}</span>
            ))}
          </div>
          <MillingMaterialsAccordion groups={materialGroups} />
        </div>
      </Section>

      <Section className="pt-0">
        <div ref={howReveal.ref} className={`card p-6 md:p-8 ${revealClass(howReveal.isVisible)}`}>
          <div className="section-header-tight mb-6">
            <p className="t-eyebrow">Процесс</p>
            <h2 className="t-h3">Как проходит заказ</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="card-info card-interactive h-full p-6"
                >
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Шаг {index + 1}</p>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <aside className="lg:sticky lg:top-[120px] lg:self-start">
            <div className="card p-6 md:p-8">
              <p className="t-eyebrow mb-3">Условия</p>
              <section>
                <h2 className="text-xl font-semibold">Условия работы</h2>
                <ul className="mt-4 space-y-3.5 text-sm text-neutral-700 dark:text-neutral-300">
                  {workConditions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.title} className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-md bg-red-50 p-1.5 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="leading-relaxed">{item.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <div className="my-6 h-px bg-neutral-200 dark:bg-neutral-800" />

              <section>
                <h3 className="text-xl font-semibold">Почему выбирают нас</h3>
                <ul className="mt-4 space-y-3.5 text-sm text-neutral-700 dark:text-neutral-300">
                  {whyChooseUs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.title} className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-md bg-red-50 p-1.5 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="leading-relaxed">{item.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </aside>

          <div ref={servicesReveal.ref} className={`card p-6 md:p-8 ${revealClass(servicesReveal.isVisible)}`}>
            <div className="section-header-tight mb-4">
              <p className="t-eyebrow">Дополнительно</p>
              <h2 className="t-h3">Дополнительные услуги</h2>
            </div>
            <div className="space-y-4">
              {additionalServiceGroups.map((group) => {
                const GroupIcon = group.id === 'urgency' ? Zap : group.id === 'preparation-and-complexity' ? Wrench : Truck;

                return (
                  <section key={group.id} className="card-structured rounded-xl bg-white p-4 dark:bg-neutral-900">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      <span className="rounded-lg bg-red-50 p-1.5 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                        <GroupIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {group.title}
                    </h3>
                    <ul className="mt-3 space-y-3">
                      {group.items.map((item) => (
                        <li key={item.label} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200 sm:max-w-[62%]">{item.label}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                              {item.badges?.map((badge) => (
                                <span
                                  key={badge}
                                  className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                                >
                                  {badge}
                                </span>
                              ))}
                              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{item.details}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div ref={galleryReveal.ref} className={revealClass(galleryReveal.isVisible)}>
          <div className="section-header-tight mb-4">
            <p className="t-eyebrow">Материалы</p>
            <h2 className="t-h3">Примеры материалов в работе</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {galleryItems.map((item) => (
              <article key={item.title} className="card-visual card-interactive group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Материал</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100">{item.title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {showFloatingCta && (
        <button
          type="button"
          onClick={scrollToOrderSection}
          className="fixed bottom-5 right-4 z-40 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(220,38,38,0.3)] transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 md:bottom-6 md:right-6 md:px-5 md:py-3"
        >
          Рассчитать заказ
        </button>
      )}

      <Section id="milling-order" className="pt-0">
        <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
          <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" /><span>Подтверждаем стоимость перед запуском. Макет проверяется инженером.</span></p>
        </div>
        <OrderMillingForm />
      </Section>
    </div>
  );
}
