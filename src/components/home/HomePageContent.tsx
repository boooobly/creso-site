'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
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

const trustHighlights = [
  { title: 'Собственное производство', description: 'Контроль качества и сроков без посредников.' },
  { title: 'Монтажная бригада', description: 'Доставка и установка силами штатной команды.' },
  { title: 'Работаем по договору', description: 'Прозрачные сметы, НДС и фиксированные этапы.' },
  { title: 'Гарантия 5 лет', description: 'Сопровождаем проекты и после сдачи.' },
];

const processSteps = [
  { title: 'Бриф и расчёт', description: 'Уточняем задачу, сроки и бюджет. Предлагаем лучший формат и материалы.' },
  { title: 'Макет и согласование', description: 'Подготавливаем визуализацию и корректируем детали до финального согласования.' },
  { title: 'Производство', description: 'Запускаем проект на собственных мощностях, соблюдая стандарты качества.' },
  { title: 'Монтаж и передача', description: 'Организуем доставку, установку или передачу готового тиража.' },
];

const leadPoints = ['Расчёт стоимости и сроков в день обращения', 'Подбор материалов под бюджет и задачу', 'Один менеджер на всём цикле проекта'];

export default function HomePageContent({ services, portfolio, faq, messages }: HomePageContentProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <Section className="relative overflow-hidden pb-12 pt-14 md:pb-14 md:pt-20">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <motion.div variants={fadeUp(20)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce} className="space-y-7">
            <div className="space-y-5">
              <p className="t-eyebrow inline-flex rounded-full border border-[#efb9b9] bg-[#fff7f7] px-4 py-1.5 text-[var(--brand-red)]">
                ПРОИЗВОДСТВЕННАЯ СТУДИЯ CREDOMIR
              </p>
              <h1 className="t-h1 max-w-5xl">
                Реклама и производство<br className="hidden md:block" /> под ключ без срывов сроков
              </h1>
              <p className="t-body text-muted-foreground max-w-[40rem]">{messages.hero.subtitle}</p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
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

            <motion.ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.07)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
              {trustBadges.map((badge) => (
                <BadgeChip key={badge} label={badge} />
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            className="relative"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
          >
            <motion.div
              className="relative mx-auto w-full max-w-[38rem] overflow-hidden rounded-[30px] border border-neutral-200/80 bg-white/90 p-4 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-5"
              animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-neutral-100 via-white to-neutral-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,28,28,0.12),transparent_45%)]" />
                <div className="absolute inset-x-5 top-5 h-7 rounded-full border border-neutral-200/80 bg-white/80" />
                <div className="absolute inset-x-5 bottom-5 top-16 rounded-2xl border border-dashed border-neutral-300/90 bg-white/70" />
                <div className="absolute left-8 top-24 h-3.5 w-24 rounded-full bg-neutral-200" />
                <div className="absolute left-8 top-32 h-2.5 w-36 rounded-full bg-neutral-200/80" />
                <div className="absolute bottom-8 left-8 inline-flex items-center gap-2 rounded-full border border-[var(--brand-red)]/25 bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-red)]">
                  <span className="size-1.5 rounded-full bg-[var(--brand-red)]" />
                  Медиа-зона для кейсов и проектов
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      <Section className="border-y border-neutral-200/70 py-10 md:py-12" background="muted">
        <div className="mb-6 space-y-2 md:mb-7">
          <p className="t-eyebrow">ПОЧЕМУ НАМ ДОВЕРЯЮТ</p>
          <h2 className="t-h2">Прозрачная работа и предсказуемый результат</h2>
        </div>
        <motion.ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {trustHighlights.map((item) => (
            <motion.li key={item.title} variants={fadeUp(14)} className="h-full rounded-2xl border border-neutral-200/80 bg-white/90 p-5">
              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.description}</p>
            </motion.li>
          ))}
        </motion.ul>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mb-5 space-y-2 md:mb-8">
          <p className="t-eyebrow">УСЛУГИ</p>
          <h2 className="t-h2">Комплексные решения для рекламы и печати</h2>
          <p className="t-body text-muted-foreground max-w-2xl">Берём на себя весь цикл: от идеи и расчёта до производства, монтажа и сопровождения.</p>
        </div>
        <motion.div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3" variants={staggerContainer(0.09)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {services.map((s, index) => (
            <motion.div key={s.id} variants={fadeUp(16)} className={index === 0 ? 'h-full md:col-span-2 xl:col-span-2' : 'h-full'}>
              <ServiceCard title={s.title} desc={s.description} href={s.href} featured={index === 0} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/60 py-12 md:py-16">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-8">
          <div className="space-y-2">
            <p className="t-eyebrow">ПОРТФОЛИО</p>
            <h2 className="t-h2">Примеры работ</h2>
            <p className="t-body text-muted-foreground max-w-2xl">Примеры работ, где сочетаются дизайн, точная реализация и соблюдение сроков.</p>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2">Смотреть всё портфолио</Link>
        </div>
        <motion.div className="grid items-stretch gap-5 md:grid-cols-3" variants={staggerContainer(0.1)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {portfolio.slice(0, 3).map((item) => (
            <motion.div key={item.id} variants={fadeUp(18)} transition={{ duration: 0.2 }} className="h-full">
              <FeatureCard title={item.title} category={item.category} href="/portfolio" />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mb-5 space-y-2 md:mb-8">
          <p className="t-eyebrow">ПРОЦЕСС</p>
          <h2 className="t-h2">Как мы запускаем ваш проект</h2>
          <p className="t-body text-muted-foreground max-w-2xl">Прозрачные этапы, понятные сроки и контроль качества на каждом шаге.</p>
        </div>
        <motion.ol className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          <div aria-hidden="true" className="absolute left-0 right-0 top-8 hidden h-px bg-neutral-200 xl:block" />
          {processSteps.map((step, index) => (
            <motion.li key={step.title} variants={fadeUp(16)} className="relative h-full rounded-2xl border border-neutral-200 bg-white px-5 pb-5 pt-4 shadow-sm md:px-6 md:pb-6">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-base font-bold text-[var(--brand-red)]">
                0{index + 1}
              </div>
              <h3 className="t-h3">{step.title}</h3>
              <p className="t-body mt-2">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/60 py-12 md:py-16">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-8">
          <div className="space-y-2">
            <p className="t-eyebrow">FAQ</p>
            <h2 className="t-h2">Частые вопросы</h2>
            <p className="t-body text-muted-foreground max-w-2xl">Коротко ответили на вопросы, которые чаще всего возникают перед запуском проекта.</p>
          </div>
          <Link href="/contacts" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2">Задать свой вопрос</Link>
        </div>
        <motion.div variants={fadeUp(14)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce} className="rounded-2xl border border-neutral-200/70 bg-white/80 p-4 sm:p-5 md:p-6">
          <FAQ items={faq.slice(0, 4)} />
        </motion.div>
      </Section>

      <Section id="lead-form" className="py-12 md:py-14">
        <motion.div className="grid gap-8 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm md:gap-10 md:p-10 lg:grid-cols-[1fr_1.05fr]" variants={fadeUp(16)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="t-eyebrow">ЗАЯВКА</p>
              <h2 className="t-h2 font-extrabold">{messages.lead.title}</h2>
              <p className="t-body text-muted-foreground max-w-md">Опишите задачу — предложим формат, сроки и стоимость.</p>
            </div>
            <ul className="space-y-2.5">
              {leadPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <CheckCircle2 className="mt-0.5 size-4 text-[var(--brand-red)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 md:p-6">
            <LeadForm t={messages} showMessageField />
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
