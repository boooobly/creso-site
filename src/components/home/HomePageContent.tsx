'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import BadgeChip from '@/components/home/BadgeChip';
import FeatureCard from '@/components/home/FeatureCard';
import KpiCard from '@/components/home/KpiCard';
import type { SiteMessages } from '@/lib/messages';
import { fadeUp, staggerContainer } from '@/lib/motion';

type HomePageContentProps = {
  services: Array<{ id: string; title: string; description: string; href: string }>;
  portfolio: Array<{ id: string; title: string; category: string }>;
  faq: any[];
  messages: SiteMessages;
};

const trustBadges = ['Более 10 лет на рынке', 'Собственное производство', 'Контроль качества на каждом этапе', 'Сроки от 2 дней'];

const processSteps = [
  { title: 'Бриф и расчёт', description: 'Уточняем задачу, сроки и бюджет. Предлагаем лучший формат и материалы.' },
  { title: 'Макет и согласование', description: 'Подготавливаем визуализацию и корректируем детали до финального согласования.' },
  { title: 'Производство', description: 'Запускаем проект на собственных мощностях, соблюдая стандарты качества.' },
  { title: 'Монтаж и передача', description: 'Организуем доставку, установку или передачу готового тиража.' },
];

export default function HomePageContent({ services, portfolio, faq, messages }: HomePageContentProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <Section className="pb-10 md:pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <motion.div className="space-y-6" variants={fadeUp()} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
            <p className="inline-flex rounded-full border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-red)]">
              Производственная студия Creso
            </p>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-6xl">{messages.hero.title}</h1>
            <p className="max-w-2xl text-base text-neutral-600 md:text-lg">{messages.hero.subtitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Link className="btn-primary no-underline text-center shadow-sm hover:shadow-md" href="/#lead-form">
                  {messages.hero.ctas.primary}
                </Link>
              </motion.div>
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.2 }}>
                <Link className="btn-secondary no-underline text-center shadow-sm hover:shadow-md" href="/portfolio">
                  {messages.hero.ctas.secondary}
                </Link>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            variants={staggerContainer(0.08)}
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView={shouldReduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              ['5000+', 'Реализованных проектов'],
              ['2 дня', 'Средний срок запуска'],
              ['24/7', 'Поддержка менеджера'],
              ['98%', 'Клиентов возвращаются снова'],
            ].map(([value, label]) => (
              <motion.div key={value} variants={fadeUp(14)} whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
                <KpiCard value={value} label={label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-8 md:py-10" background="muted">
        <motion.ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" variants={staggerContainer(0.07)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
          {trustBadges.map((badge) => (
            <BadgeChip key={badge} label={badge} />
          ))}
        </motion.ul>
      </Section>

      <Section>
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Услуги</p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Комплексные решения для рекламы и печати</h2>
        </div>
        <motion.div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" variants={staggerContainer(0.09)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
          {services.map((s) => (
            <motion.div key={s.id} variants={fadeUp(16)} whileHover={shouldReduceMotion ? undefined : { y: -5 }} transition={{ duration: 0.22 }}>
              <ServiceCard title={s.title} desc={s.description} href={s.href} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="muted">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Портфолио</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Избранные проекты</h2>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)]">Смотреть всё портфолио</Link>
        </div>
        <motion.div className="grid gap-5 md:grid-cols-3" variants={staggerContainer(0.1)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
          {portfolio.slice(0, 3).map((item) => (
            <motion.div key={item.id} variants={fadeUp(18)} whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
              <FeatureCard title={item.title} category={item.category} href="/portfolio" />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section>
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Процесс</p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Как мы запускаем ваш проект</h2>
        </div>
        <motion.ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
          {processSteps.map((step, index) => (
            <motion.li key={step.title} variants={fadeUp(16)} whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md">
              <p className="text-sm font-bold text-[var(--brand-red)]">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </Section>

      <Section background="muted">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Частые вопросы</h2>
          </div>
          <Link href="/contacts" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)]">Задать свой вопрос</Link>
        </div>
        <motion.div variants={fadeUp(14)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
          <FAQ items={faq.slice(0, 4)} />
        </motion.div>
      </Section>

      <Section id="lead-form">
        <motion.div className="grid gap-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-10 lg:grid-cols-[1fr_1.1fr]" variants={fadeUp(16)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Оставить заявку</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">{messages.lead.title}</h2>
            <p className="text-sm text-neutral-600">Опишите задачу, а мы предложим оптимальный формат производства, сроки и стоимость.</p>
          </div>
          <LeadForm t={messages} />
        </motion.div>
      </Section>
    </div>
  );
}
