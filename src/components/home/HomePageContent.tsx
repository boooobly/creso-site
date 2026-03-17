'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ClipboardList, Clock3, Cog, KeyRound, PencilRuler, Search, Truck, Wallet } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import BadgeChip from '@/components/home/BadgeChip';
import FeatureCard from '@/components/home/FeatureCard';
import AnimatedBlurHeadline from '@/components/home/AnimatedBlurHeadline';
import type { SiteMessages } from '@/lib/messages';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';

const heroChipVariants = {
  hidden: (index: number) => ({
    opacity: 0,
    x: index === 0 ? 0 : -48,
    scale: index === 0 ? 0.985 : 1,
  }),
  show: (index: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: index === 0 ? 0.42 : 0.56,
      delay: index === 0 ? 0.04 : 0.22 + (index - 1) * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

type HomePageContentProps = {
  services: Array<{ id: string; title: string; description: string; href: string; imageSrc?: string }>;
  faq: any[];
  messages: SiteMessages;
  featuredPortfolioItems: Array<{ id: string; title: string; description: string; imageSrc: string }>;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryButtonText: string;
  heroSecondaryButtonText: string;
  heroTrustBadges: Array<{ label: string }>;
  trustSectionEyebrow: string;
  trustSectionTitle: string;
  trustFeatureCards: Array<{ title: string; description: string }>;
  portfolioBlockTitle: string;
  portfolioBlockDescription: string;
  portfolioLinkLabel: string;
  processEyebrow: string;
  processTitle: string;
  processDescription: string;
  processSteps: Array<{ title: string; description: string }>;
  faqEyebrow: string;
  faqTitle: string;
  faqDescription: string;
  faqLinkLabel: string;
  leadEyebrow: string;
  leadDescription: string;
  leadPoints: Array<{ label: string }>;
  heroImageSrc: string;
  heroImageAlt: string;
};

const trustIcons = [KeyRound, Wallet, Clock3, Search];
const processIcons = [ClipboardList, PencilRuler, Cog, Truck];

const serviceImageById: Record<string, string> = {
  baget: '/images/services/bagget.png',
  cnc: '/images/services/milling.png',
  print: '/images/services/printing.png',
  plotter: '/images/services/plotter.png',
  thermo: '/images/services/t-shirt.png',
  mugs: '/images/services/glasses.png',
  stands: '/images/services/stends.png',
  outdoor: '/images/services/outdoor.png',
  polygraphy: '/images/services/cards.png',
};

export default function HomePageContent({
  services,
  faq,
  messages,
  featuredPortfolioItems,
  heroEyebrow,
  heroTitle,
  heroDescription,
  heroPrimaryButtonText,
  heroSecondaryButtonText,
  heroTrustBadges,
  trustSectionEyebrow,
  trustSectionTitle,
  trustFeatureCards,
  portfolioBlockTitle,
  portfolioBlockDescription,
  portfolioLinkLabel,
  processEyebrow,
  processTitle,
  processDescription,
  processSteps,
  faqEyebrow,
  faqTitle,
  faqDescription,
  faqLinkLabel,
  leadEyebrow,
  leadDescription,
  leadPoints,
  heroImageSrc,
  heroImageAlt,
}: HomePageContentProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <Section className="relative overflow-hidden pb-10 pt-4 md:pb-12 md:pt-6">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <motion.div variants={fadeUp(20)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce} className="space-y-7">
            <div className="space-y-5">
              <p className="t-eyebrow inline-flex rounded-full border border-[#efb9b9] bg-[#fff7f7] px-4 py-1.5 text-[var(--brand-red)]">
                {heroEyebrow}
              </p>
              <AnimatedBlurHeadline className="t-h1 max-w-[16ch]" text={heroTitle} breakAfterWord={1} />
              <p className="t-body text-muted-foreground max-w-[40rem]">{heroDescription}</p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Link className="btn-primary w-full no-underline text-center shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 sm:w-auto" href="/#lead-form" aria-label="Рассчитать стоимость и отправить заявку">
                  {heroPrimaryButtonText}
                </Link>
              </motion.div>
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Link className="btn-secondary w-full no-underline text-center shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 sm:w-auto" href="/portfolio" aria-label="Перейти в портфолио">
                  {heroSecondaryButtonText}
                </Link>
              </motion.div>
            </div>

            <motion.ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
              {heroTrustBadges.map((badge, index) => (
                <BadgeChip key={`${badge.label}-${index}`} label={badge.label} index={index} variants={heroChipVariants} />
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-[36rem] lg:mr-0 lg:max-w-[42rem]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={viewportOnce}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[12%] top-[16%] h-[58%] rounded-full bg-[radial-gradient(circle,rgba(212,28,28,0.14)_0%,rgba(212,28,28,0.06)_40%,transparent_75%)] blur-2xl"
            />
            <div className="relative ml-2 sm:ml-6 lg:ml-10">
              <Image
                src={heroImageSrc}
                alt={heroImageAlt}
                width={980}
                height={760}
                priority
                className="h-auto w-full object-contain drop-shadow-[0_30px_40px_rgba(15,23,42,0.24)]"
              />
            </div>
          </motion.div>
        </div>
      </Section>

      <Section className="border-y border-neutral-200/70 py-12 md:py-14" background="muted" fullBleed>
        <div className="mb-6 space-y-2 md:mb-7">
          <p className="t-eyebrow">{trustSectionEyebrow}</p>
          <h2 className="t-h2">{trustSectionTitle}</h2>
        </div>
        <motion.ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {trustFeatureCards.map((item, index) => {
            const Icon = trustIcons[index % trustIcons.length];

            return (
              <motion.li
                key={`${item.title}-${index}`}
                variants={fadeUp(14)}
                className="h-full rounded-2xl border border-neutral-200 bg-white/90 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)]"
              >
                <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.description}</p>
              </motion.li>
            );
          })}
        </motion.ul>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mb-5 space-y-2 md:mb-8">
          <p className="t-eyebrow">УСЛУГИ</p>
          <h2 className="t-h2">Комплексные решения для рекламы и печати</h2>
          <p className="t-body text-muted-foreground max-w-2xl">Берём на себя весь цикл: от идеи и расчёта до производства, монтажа и сопровождения.</p>
        </div>
        <motion.div className="grid items-stretch gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3" variants={staggerContainer(0.09)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {services.map((s) => (
            <motion.div key={s.id} variants={fadeUp(16)} className="h-full">
              <ServiceCard title={s.title} desc={s.description} href={s.href} imageSrc={s.imageSrc ?? serviceImageById[s.id]} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/60 py-12 md:py-16" fullBleed>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-8">
          <div className="space-y-2">
            <p className="t-eyebrow">ПОРТФОЛИО</p>
            <h2 className="t-h2">{portfolioBlockTitle}</h2>
            <p className="t-body text-muted-foreground max-w-2xl">{portfolioBlockDescription}</p>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2">{portfolioLinkLabel}</Link>
        </div>
        <motion.div className="grid items-stretch gap-5 md:grid-cols-3" variants={staggerContainer(0.1)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {featuredPortfolioItems.map((item) => (
            <motion.div key={item.id} variants={fadeUp(18)} transition={{ duration: 0.2 }} className="h-full">
              <FeatureCard title={item.title} description={item.description} imageSrc={item.imageSrc} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mb-5 space-y-2 md:mb-8">
          <p className="t-eyebrow">{processEyebrow}</p>
          <h2 className="t-h2">{processTitle}</h2>
          <p className="t-body text-muted-foreground max-w-2xl">{processDescription}</p>
        </div>
        <motion.ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {processSteps.map((step, index) => {
            const Icon = processIcons[index % processIcons.length];

            return (
              <motion.li
                key={`${step.title}-${index}`}
                variants={fadeUp(16)}
                className="relative h-full rounded-2xl border border-neutral-200 bg-white/90 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)]"
              >
                <span className="absolute right-5 top-5 text-xs font-semibold text-neutral-400">0{index + 1}</span>
                <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                </div>
                <h3 className="t-h3">{step.title}</h3>
                <p className="t-body mt-2">{step.description}</p>
              </motion.li>
            );
          })}
        </motion.ol>
      </Section>

      <Section background="muted" className="border-y border-neutral-200/60 py-12 md:py-16" fullBleed>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-8">
          <div className="space-y-2">
            <p className="t-eyebrow">{faqEyebrow}</p>
            <h2 className="t-h2">{faqTitle}</h2>
            <p className="t-body text-muted-foreground max-w-2xl">{faqDescription}</p>
          </div>
          <Link href="/contacts" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2">{faqLinkLabel}</Link>
        </div>
        <motion.div variants={fadeUp(14)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce} className="rounded-2xl border border-neutral-200/70 bg-white/80 p-4 sm:p-5 md:p-6">
          <FAQ items={faq.slice(0, 4)} />
        </motion.div>
      </Section>

      <Section id="lead-form" className="py-12 md:py-14">
        <motion.div className="relative grid items-center gap-6 overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7 md:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8" variants={fadeUp(16)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 top-1/2 z-0 h-[19rem] w-[25rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,28,28,0.16)_0%,rgba(212,28,28,0.07)_34%,rgba(212,28,28,0.02)_58%,transparent_76%)] blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[44%] z-0 w-[12rem] bg-gradient-to-r from-transparent via-white/92 to-white"
          />
          <div className="relative z-10 space-y-4 lg:max-w-[30rem]">
            <div className="space-y-3">
              <p className="t-eyebrow">{leadEyebrow}</p>
              <h2 className="t-h2 font-extrabold">{messages.lead.title}</h2>
              <p className="t-body text-muted-foreground max-w-md">{leadDescription}</p>
            </div>
            <ul className="space-y-2">
              {leadPoints.map((point, index) => (
                <li key={`${point.label}-${index}`} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <CheckCircle2 className="mt-0.5 size-4 text-[var(--brand-red)]" />
                  <span>{point.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10 h-full rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 sm:p-5 md:p-6 lg:p-7">
            <LeadForm t={messages} showMessageField />
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
