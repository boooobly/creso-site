'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import BadgeChip from '@/components/home/BadgeChip';
import FeatureCard from '@/components/home/FeatureCard';
import type { SiteMessages } from '@/lib/messages';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';

type HomePageContentProps = {
  services: Array<{ id: string; title: string; description: string; href: string }>;
  portfolio: Array<{ id: string; title: string; category: string }>;
  faq: any[];
  messages: SiteMessages;
};

const trustBadges = ['Собственное производство', 'Монтажная бригада', 'НДС и договор', 'Гарантия 5 лет'];

const trustedByPlaceholders = ['Компания A', 'Компания B', 'Компания C', 'Компания D', 'Компания E', 'Компания F', 'Компания G', 'Компания H'];

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
      <Section className="relative overflow-hidden pb-10 pt-16 md:pb-14 md:pt-24">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.03) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
            opacity: 0.45,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(212,28,28,0.14),transparent_55%)]" aria-hidden="true" />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-[44%_56%_53%_47%/49%_45%_55%_51%] bg-[var(--brand-red)]/8 blur-2xl"
          animate={shouldReduceMotion ? undefined : { x: [0, 12, 0], y: [0, -8, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 bottom-2 h-52 w-52 rounded-[57%_43%_46%_54%/41%_53%_47%_59%] bg-[var(--brand-red)]/6 blur-2xl"
          animate={shouldReduceMotion ? undefined : { x: [0, -10, 0], y: [0, 8, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          variants={fadeUp(20)}
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView={shouldReduceMotion ? undefined : 'show'}
          viewport={viewportOnce}
          className="relative z-10 space-y-8"
        >
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-red)]">
              ПРОИЗВОДСТВЕННАЯ СТУДИЯ CREDOMIR
            </p>
            <h1 className="max-w-5xl text-3xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl md:text-6xl lg:text-7xl">
              Реклама и производство<br className="hidden md:block" /> под ключ без срывов сроков
            </h1>
            <p className="max-w-[45rem] text-base leading-relaxed text-neutral-600 md:text-lg">{messages.hero.subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
              <Link className="btn-primary no-underline text-center shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2" href="/#lead-form" aria-label="Рассчитать стоимость и отправить заявку">
                Рассчитать стоимость
              </Link>
            </motion.div>
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.2 }}>
              <Link className="btn-secondary no-underline text-center shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2" href="/portfolio" aria-label="Перейти в портфолио">
                Смотреть портфолио
              </Link>
            </motion.div>
          </div>

          <motion.ul
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer(0.07)}
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView={shouldReduceMotion ? undefined : 'show'}
            viewport={viewportOnce}
          >
            {trustBadges.map((badge) => (
              <BadgeChip key={badge} label={badge} />
            ))}
          </motion.ul>
        </motion.div>
      </Section>

      <Section className="border-y border-neutral-200/70 py-10 md:py-12" background="muted">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Нам доверяют</p>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
        <motion.ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
          variants={staggerContainer(0.05)}
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView={shouldReduceMotion ? undefined : 'show'}
          viewport={viewportOnce}
        >
          {trustedByPlaceholders.map((item) => (
            <motion.li
              key={item}
              variants={fadeUp(10)}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex h-14 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/90 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 opacity-70 grayscale"
            >
              {item}
            </motion.li>
          ))}
        </motion.ul>
      </Section>

      <Section>
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Услуги</p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Комплексные решения для рекламы и печати</h2>
        </div>
        <motion.div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" variants={staggerContainer(0.09)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {services.map((s) => (
            <motion.div key={s.id} variants={fadeUp(16)}>
              <ServiceCard title={s.title} desc={s.description} href={s.href} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/70">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Портфолио</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Избранные проекты</h2>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2">Смотреть всё портфолио</Link>
        </div>
        <motion.div className="grid gap-5 md:grid-cols-3" variants={staggerContainer(0.1)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
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
        <motion.ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {processSteps.map((step, index) => (
            <motion.li key={step.title} variants={fadeUp(16)} whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }} className="premium-card p-6">
              <p className="text-sm font-bold text-[var(--brand-red)]">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/70">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Частые вопросы</h2>
          </div>
          <Link href="/contacts" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2">Задать свой вопрос</Link>
        </div>
        <motion.div variants={fadeUp(14)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          <FAQ items={faq.slice(0, 4)} />
        </motion.div>
      </Section>

      <Section id="lead-form">
        <motion.div className="grid gap-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10 lg:grid-cols-[1fr_1.1fr]" variants={fadeUp(16)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Оставить заявку</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">{messages.lead.title}</h2>
            <p className="text-sm text-neutral-600">Опишите задачу, а мы предложим оптимальный формат производства, сроки и стоимость.</p>
          </div>
          <LeadForm t={messages} showMessageField />
        </motion.div>
      </Section>
    </div>
  );
}
