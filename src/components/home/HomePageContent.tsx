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
      <Section className="relative overflow-hidden pb-10 pt-14 md:pb-12 md:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,28,28,0.1),transparent_60%)]" aria-hidden="true" />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-9rem] top-8 hidden h-[23rem] w-[23rem] rounded-[56%_44%_60%_40%/42%_58%_42%_58%] bg-[var(--brand-red)]/8 blur-3xl lg:block"
          animate={shouldReduceMotion ? undefined : { x: [0, 8, 0], y: [0, -6, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div variants={fadeUp(20)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce} className="space-y-7">
            <div className="space-y-7">
              <p className="t-eyebrow rounded-full border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/5 px-4 py-1.5">
                ПРОИЗВОДСТВЕННАЯ СТУДИЯ CREDOMIR
              </p>
              <h1 className="t-h1 max-w-5xl">
                Реклама и производство<br className="hidden md:block" /> под ключ без срывов сроков
              </h1>
              <p className="t-body max-w-[34rem]">{messages.hero.subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Link className="btn-primary w-full no-underline text-center shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 sm:w-auto" href="/#lead-form" aria-label="Рассчитать стоимость и отправить заявку">
                  Рассчитать стоимость
                </Link>
              </motion.div>
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.2 }}>
                <Link className="btn-secondary w-full no-underline text-center shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 sm:w-auto" href="/portfolio" aria-label="Перейти в портфолио">
                  Смотреть портфолио
                </Link>
              </motion.div>
            </div>

            <motion.ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" variants={staggerContainer(0.07)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
              {trustBadges.map((badge) => (
                <BadgeChip key={badge} label={badge} />
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="relative hidden lg:flex lg:justify-end"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
          >
            <motion.div
              className="relative h-72 w-[22rem] rounded-[28px] border border-neutral-200/80 bg-white/90 p-5 shadow-[0_28px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur-sm"
              style={{ rotate: '1.8deg' }}
              animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-x-5 top-5 h-24 rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-white to-neutral-100" />
              <div className="absolute inset-x-5 top-34 h-px bg-neutral-200" />
              <div className="absolute left-5 right-5 top-40 space-y-3">
                <div className="h-2.5 w-3/4 rounded-full bg-neutral-200" />
                <div className="h-2.5 w-full rounded-full bg-neutral-100" />
                <div className="h-2.5 w-5/6 rounded-full bg-neutral-100" />
              </div>
              <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/8 px-3 py-1 text-[11px] font-medium text-[var(--brand-red)]">
                <span className="size-1.5 rounded-full bg-[var(--brand-red)]" />
                Макет согласован
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      <Section className="border-y border-neutral-200/70 py-10 md:py-12" background="muted">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="t-eyebrow text-neutral-500">Нам доверяют</p>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {shouldReduceMotion ? (
          <ul className="flex flex-wrap gap-3">
            {trustedByPlaceholders.map((item) => (
              <li key={item} className="flex h-14 min-w-[140px] items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/90 px-5 text-xs font-semibold uppercase tracking-wide text-neutral-500 opacity-70 grayscale">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="marquee-wrap group overflow-hidden">
            <div className="marquee-track flex w-max gap-3 group-hover:[animation-play-state:paused]">
              {[...trustedByPlaceholders, ...trustedByPlaceholders].map((item, index) => (
                <div key={`${item}-${index}`} className="flex h-14 min-w-[160px] items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/90 px-5 text-xs font-semibold uppercase tracking-wide text-neutral-500 opacity-70 grayscale">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section className="py-9 md:py-14">
        <div className="mb-5 space-y-1.5 md:mb-7">
          <p className="t-eyebrow">УСЛУГИ</p>
          <h2 className="t-h2">Комплексные решения для рекламы и печати</h2>
          <p className="t-body max-w-2xl">Берём на себя весь цикл: от идеи и расчёта до производства, монтажа и сопровождения.</p>
        </div>
        <motion.div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" variants={staggerContainer(0.09)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {services.map((s, index) => (
            <motion.div key={s.id} variants={fadeUp(16)} className={index === 0 ? 'md:col-span-2 xl:col-span-2' : ''}>
              <ServiceCard title={s.title} desc={s.description} href={s.href} featured={index === 0} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/60 py-9 md:py-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-7">
          <div className="space-y-1.5">
            <p className="t-eyebrow">ПОРТФОЛИО</p>
            <h2 className="t-h2">Избранные проекты</h2>
            <p className="t-body max-w-2xl">Примеры работ, где сочетаются дизайн, точная реализация и соблюдение сроков.</p>
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

      <Section className="py-9 md:py-14">
        <div className="mb-5 space-y-1.5 md:mb-7">
          <p className="t-eyebrow">ПРОЦЕСС</p>
          <h2 className="t-h2">Как мы запускаем ваш проект</h2>
          <p className="t-body max-w-2xl">Прозрачные этапы, понятные сроки и контроль качества на каждом шаге.</p>
        </div>
        <motion.ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {processSteps.map((step, index) => (
            <motion.li key={step.title} variants={fadeUp(16)} whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }} className="premium-card p-6">
              <p className="text-sm font-bold text-[var(--brand-red)]">0{index + 1}</p>
              <h3 className="t-h3 mt-3">{step.title}</h3>
              <p className="t-body mt-2">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/60 py-9 md:py-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-7">
          <div className="space-y-1.5">
            <p className="t-eyebrow">FAQ</p>
            <h2 className="t-h2">Частые вопросы</h2>
            <p className="t-body max-w-2xl">Коротко ответили на вопросы, которые чаще всего возникают перед запуском проекта.</p>
          </div>
          <Link href="/contacts" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2">Задать свой вопрос</Link>
        </div>
        <motion.div variants={fadeUp(14)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          <FAQ items={faq.slice(0, 4)} />
        </motion.div>
      </Section>

      <Section id="lead-form" className="py-9 md:py-12">
        <motion.div className="grid gap-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10 lg:grid-cols-[1fr_1.1fr]" variants={fadeUp(16)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          <div className="space-y-1.5">
            <p className="t-eyebrow">ЗАЯВКА</p>
            <h2 className="t-h2 font-extrabold">{messages.lead.title}</h2>
            <p className="t-body max-w-md">Опишите задачу — предложим формат, сроки и стоимость.</p>
          </div>
          <LeadForm t={messages} showMessageField />
        </motion.div>
      </Section>
    </div>
  );
}
