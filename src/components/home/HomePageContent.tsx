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
  const splitCtaClassName =
    'inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-4 py-2 t-button text-neutral-700 no-underline transition-colors hover:border-neutral-400 hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2';

  return (
    <div className="relative">
      <Section spacing="hero" className="relative overflow-hidden border-b border-neutral-200/70">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-red-50/40 to-transparent" />
        <div className="relative z-10 grid items-center gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <motion.div variants={fadeUp(20)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce} className="space-y-8">
            <div className="space-y-5">
              <p className="hero-eyebrow">
                {heroEyebrow}
              </p>
              <AnimatedBlurHeadline className="t-h1 max-w-[15ch]" text={heroTitle} breakAfterWord={1} />
              <p className="t-lead max-w-[39rem] text-muted-foreground">{heroDescription}</p>
            </div>

            <div className="hero-actions flex-col sm:flex-row sm:items-end">
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

            <motion.ul className="hero-chip-list max-w-none gap-2.5 xl:grid-cols-4" initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
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
            <div className="card-visual relative ml-1 overflow-visible rounded-[2rem] border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/25 p-3 sm:ml-5 sm:p-4 lg:ml-9">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.65rem] border border-white/70" />
              <Image
                src={heroImageSrc}
                alt={heroImageAlt}
                width={980}
                height={760}
                priority
                className="h-auto w-full rounded-[1.4rem] object-contain drop-shadow-[0_24px_30px_rgba(15,23,42,0.2)]"
              />
            </div>
          </motion.div>
        </div>
      </Section>

      <Section spacing="tight" className="border-y border-neutral-200/70" background="muted" fullBleed>
        <div className="section-header">
          <p className="t-eyebrow">{trustSectionEyebrow}</p>
          <h2 className="t-h2">{trustSectionTitle}</h2>
        </div>
        <motion.ul className="grid-cards md:grid-cols-2 xl:grid-cols-4" variants={staggerContainer(0.08)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {trustFeatureCards.map((item, index) => {
            const Icon = trustIcons[index % trustIcons.length];

            return (
              <motion.li
                key={`${item.title}-${index}`}
                variants={fadeUp(14)}
                className="card-info card-interactive h-full border-neutral-200/90 p-6"
              >
                <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                </div>
                <p className="t-h4">{item.title}</p>
                <p className="t-body mt-2 leading-relaxed">{item.description}</p>
              </motion.li>
            );
          })}
        </motion.ul>
      </Section>

      <Section spacing="tight">
        <div className="section-header">
          <p className="t-eyebrow">УСЛУГИ</p>
          <h2 className="t-h2">Комплексные решения для рекламы и печати</h2>
          <p className="t-body text-muted-foreground max-w-2xl">Берём на себя весь цикл: от идеи и расчёта до производства, монтажа и сопровождения.</p>
        </div>
        <motion.div className="grid-cards grid-cols-1 items-stretch md:grid-cols-2 xl:grid-cols-3" variants={staggerContainer(0.09)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {services.map((s) => (
            <motion.div key={s.id} variants={fadeUp(16)} className="h-full">
              <ServiceCard title={s.title} desc={s.description} href={s.href} imageSrc={s.imageSrc ?? serviceImageById[s.id]} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section spacing="tight" background="muted" className="border-y border-neutral-200/60" fullBleed>
        <div className="section-header-split">
          <div className="space-y-2">
            <p className="t-eyebrow">ПОРТФОЛИО</p>
            <h2 className="t-h2">{portfolioBlockTitle}</h2>
            <p className="t-body text-muted-foreground max-w-2xl">{portfolioBlockDescription}</p>
          </div>
          <Link href="/portfolio" className={splitCtaClassName}>{portfolioLinkLabel}</Link>
        </div>
        <motion.div className="grid-cards items-stretch md:grid-cols-3" variants={staggerContainer(0.1)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
          {featuredPortfolioItems.map((item) => (
            <motion.div key={item.id} variants={fadeUp(18)} transition={{ duration: 0.2 }} className="h-full">
              <FeatureCard title={item.title} description={item.description} imageSrc={item.imageSrc} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section spacing="tight">
        <div className="section-header">
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
                className="card-info card-interactive relative h-full border-neutral-200/90 p-6"
              >
                <span className="t-caption absolute right-5 top-5 rounded-full border border-neutral-200 bg-white/80 px-2.5 py-1">0{index + 1}</span>
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

      <Section spacing="tight" background="muted" className="border-y border-neutral-200/60" fullBleed>
        <div className="section-header-split">
          <div className="space-y-2">
            <p className="t-eyebrow">{faqEyebrow}</p>
            <h2 className="t-h2">{faqTitle}</h2>
            <p className="t-body text-muted-foreground max-w-2xl">{faqDescription}</p>
          </div>
          <Link href="/contacts" className={splitCtaClassName}>{faqLinkLabel}</Link>
        </div>
        <motion.div variants={fadeUp(14)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce} className="card p-4 sm:p-5 md:p-6">
          <FAQ items={faq.slice(0, 4)} />
        </motion.div>
      </Section>

      <Section id="lead-form" spacing="tight">
        <motion.div className="card relative grid items-center gap-6 overflow-hidden rounded-[28px] border-neutral-200/90 bg-gradient-to-br from-white via-white to-neutral-50/80 p-5 sm:p-7 md:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8" variants={fadeUp(16)} initial={shouldReduceMotion ? false : 'hidden'} whileInView={shouldReduceMotion ? undefined : 'show'} viewport={viewportOnce}>
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
                <li key={`${point.label}-${index}`} className="t-body flex items-start gap-2.5 text-neutral-700">
                  <CheckCircle2 className="mt-0.5 size-4 text-[var(--brand-red)]" />
                  <span>{point.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="form-shell relative z-10 h-full">
            <LeadForm t={messages} showMessageField />
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
