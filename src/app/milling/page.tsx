'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Layers3,
  Maximize,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react';
import Section from '@/components/Section';
import OrderMillingForm from '@/components/OrderMillingForm';
import MillingMaterialsAccordion from '@/components/MillingMaterialsAccordion';
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll';
import {
  MILLING_ADDITIONAL_SERVICE_GROUPS,
  MILLING_MATERIAL_GROUPS,
} from '@/lib/pricing-config/milling';

const quickInfo = [
  'Минимальный заказ - 450 ₽',
  'Цены без учета материала',
  'По вашим векторным файлам',
];

const heroKpi = [
  'от 30 ₽/м.п.',
  'Максимальный размер 2×4 м',
  'Работаем с материалом заказчика',
];

const steps = [
  'Отправляете макет',
  'Проверяем и подтверждаем стоимость',
  'Запускаем фрезеровку',
];

const galleryItems = [
  { title: 'Акрил 8 мм', bg: 'from-cyan-500/35 via-sky-500/20 to-transparent' },
  { title: 'АКП 4 мм', bg: 'from-emerald-500/35 via-green-500/20 to-transparent' },
  { title: 'ПВХ 10 мм', bg: 'from-violet-500/35 via-fuchsia-500/20 to-transparent' },
];

const workConditions = [
  { title: 'Минимальный заказ — 450 ₽', icon: ClipboardCheck },
  { title: 'Цены указаны без стоимости материала', icon: Layers3 },
  { title: 'Максимальный размер заготовки — 2×4 м', icon: Maximize },
  { title: 'Подготовительные и постобрабатывающие работы согласовываются отдельно', icon: Wrench },
];

const whyChooseUs = [
  { title: 'Собственная производственная база', icon: CheckCircle2 },
  { title: 'Помогаем подготовить макет', icon: Sparkles },
  { title: 'Работаем с материалом клиента', icon: Truck },
  { title: 'Контроль качества на каждом этапе', icon: ShieldCheck },
];

const revealBase =
  'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none';

export default function MillingPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const howReveal = useRevealOnScroll<HTMLDivElement>();
  const servicesReveal = useRevealOnScroll<HTMLDivElement>();
  const galleryReveal = useRevealOnScroll<HTMLDivElement>();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const rafId = window.requestAnimationFrame(() => {
      setHeroVisible(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const revealClass = (isVisible: boolean) =>
    `${revealBase} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} motion-reduce:translate-y-0 motion-reduce:opacity-100`;

  return (
    <div>
      <Section className="pb-8">
        <div className={`card space-y-6 p-6 md:p-10 ${revealClass(heroVisible)}`}>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold md:text-5xl">Фрезеровка листовых материалов</h1>
            <p className="max-w-3xl text-neutral-700 dark:text-neutral-300">
              Точная 2D-фрезеровка пластика, композита и древесных плит на производстве полного цикла. От единичных заказов до серий с контролем качества на каждом этапе.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            {heroKpi.map((item, index) => (
              <span
                key={item}
                className={`rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-100 ${revealClass(heroVisible)}`}
                style={{ transitionDelay: reduceMotion ? '0ms' : `${index * 120}ms` }}
              >
                {item}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => document.getElementById('milling-request')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
          >
            Рассчитать заказ
          </button>
        </div>
      </Section>

      <Section className="pt-0">
        <div id="milling-prices" className="card p-6 md:p-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap gap-2">
            {quickInfo.map((item) => (
              <span key={item} className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200">{item}</span>
            ))}
          </div>
          <h2 className="mb-5 text-2xl font-semibold">Прайс по материалам</h2>
          <MillingMaterialsAccordion groups={MILLING_MATERIAL_GROUPS} />
        </div>
      </Section>

      <Section className="pt-0">
        <div ref={howReveal.ref} className={`card p-6 md:p-8 ${revealClass(howReveal.isVisible)}`}>
          <h2 className="mb-6 text-2xl font-semibold">Как проходит заказ</h2>
          <div className="relative grid gap-4 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-5 hidden h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent md:block dark:via-neutral-700" />
            {steps.map((step, index) => (
              <div key={step} className="relative rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-300">
                  {index + 1}
                </span>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <aside className="lg:sticky lg:top-[120px] lg:self-start">
            <div className="card p-6 md:p-8">
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
            <h2 className="mb-4 text-2xl font-semibold">Дополнительные услуги</h2>
            <div className="space-y-4">
              {MILLING_ADDITIONAL_SERVICE_GROUPS.map((group) => {
                const GroupIcon = group.id === 'urgency' ? Zap : group.id === 'preparation-and-complexity' ? Wrench : Truck;

                return (
                  <section key={group.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
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
          <h2 className="mb-4 text-2xl font-semibold">Примеры материалов в работе</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {galleryItems.map((item) => (
              <article key={item.title} className="group overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <div className="relative h-44 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none`} />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{item.title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-12">
        <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
          <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" /><span>Подтверждаем стоимость перед запуском. Макет проверяется инженером.</span></p>
        </div>
        <OrderMillingForm />
      </Section>
    </div>
  );
}
