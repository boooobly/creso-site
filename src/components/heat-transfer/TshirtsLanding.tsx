'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, ChevronDown, ClipboardCheck, FileImage, FileUp, Layers, Palette, ShieldCheck, Shirt, Timer, Truck } from 'lucide-react';
import { CSSProperties, ReactNode, useState } from 'react';
import OrderTshirtsForm from '@/components/OrderTshirtsForm';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import Section from '@/components/layout/Section';
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll';
import type { SiteImageRecord } from '@/lib/site-images';

type FaqItem = { question: string; answer: string };

type SectionRenderState = {
  isVisible: boolean;
  prefersReducedMotion: boolean;
};

type SectionBlockProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: (state: SectionRenderState) => ReactNode;
};

const kpiChips = ['От 1 изделия', 'Для бизнеса и команд', 'Аккуратный принт', 'Согласование до запуска'] as const;

const pricingCards = [
  {
    title: 'Полноцвет A4',
    icon: FileImage,
    price: '250 ₽/сторона',
    lines: ['Перед, спина или рукав', 'Проверка макета перед стартом'],
    featured: true,
  },
  { title: 'Футболки', icon: Shirt, price: 'от 500 ₽', lines: ['Размеры 32–60', 'Можно печатать на наших или ваших'], featured: false },
  {
    title: 'Термоплёнка',
    icon: Layers,
    price: 'Расчёт менеджером',
    lines: ['Печать + резка + перенос', 'Цветная и флуор плёнка'],
    featured: false,
  },
] as const;

const printTechnologyCards = [
  {
    title: 'Сублимация',
    label: 'Для полноцвета',
    descriptor: 'Яркое полноцветное изображение для светлой синтетики.',
    points: ['Подходит для фото, градиентов и сложной графики', 'Оптимально для спортивной и промо-одежды', 'Принт стойкий, без эффекта плотной наклейки'],
    bestFor: 'Когда нужен насыщенный полноцвет на полиэстере.',
  },
  {
    title: 'Термотрансферная пленка',
    label: 'Для надписей и логотипов',
    descriptor: 'Чёткие надписи и логотипы на хлопке и смесовых тканях.',
    points: ['Имена, номера, логотипы и короткие надписи', 'Подходит для формы, спецодежды и брендированной одежды', 'Контрастный знак с ровным контуром'],
    bestFor: 'Когда важна читаемая графика и точный контур.',
  },
] as const;

const galleryCards = [
  {
    title: 'Логотип на груди',
    description: 'Компактное нанесение логотипа на футболки для формы, персонала и промо.',
    imageSrc: '/images/t-shirt/logo.png',
    slotKey: 'tshirts.examples.logo',
  },
  {
    title: 'Мерч для команды',
    description: 'Единый стиль для сотрудников, команд и мероприятий с аккуратным переносом.',
    imageSrc: '/images/t-shirt/eurochem.png',
    slotKey: 'tshirts.examples.team',
  },
  {
    title: 'Надпись термоплёнкой',
    description: 'Контрастные надписи и простая графика с чистой и стойкой посадкой на ткани.',
    imageSrc: '/images/t-shirt/termoplenka.png',
    slotKey: 'tshirts.examples.film',
  },
] as const;

const steps = [
  {
    title: 'Присылаете макет или задачу',
    description: 'Принимаем файл или описание задачи и быстро уточняем исходные данные.',
    icon: FileUp,
  },
  {
    title: 'Уточняем детали и подтверждаем стоимость',
    description: 'Согласовываем тираж, способ нанесения, срок и итоговую стоимость.',
    icon: ClipboardCheck,
  },
  {
    title: 'Печать и выдача / доставка',
    description: 'Печатаем заказ, проверяем качество и передаём удобным способом.',
    icon: Truck,
  },
] as const;

const advantages = [
  { text: 'Собственное производство и контроль на каждом этапе', icon: ShieldCheck },
  { text: 'Понятные сроки и аккуратное соблюдение договорённостей', icon: Timer },
  { text: 'Стабильный результат в повторных тиражах', icon: BadgeCheck },
  { text: 'Работаем на ваших и наших футболках', icon: Shirt },
  { text: 'Цветная и флуор плёнка', icon: Palette },
  { text: 'Поддержка менеджера до передачи готового заказа', icon: ClipboardCheck },
] as const;

const faqItems: FaqItem[] = [
  { question: 'Можно печатать на своей футболке?', answer: 'Да, работаем как с вашими изделиями, так и с нашими заготовками.' },
  { question: 'Сколько стоит футболка?', answer: 'Футболки от 500 ₽, итог зависит от размера и наличия. Точную цену сообщит менеджер.' },
  { question: 'Что делать, если нет файла?', answer: 'Оставьте заявку и кратко опишите задачу — подскажем, как лучше подготовить макет.' },
  { question: 'Сроки?', answer: 'Обычно 3–5 рабочих дней, но при свободной загрузке можем сделать быстрее.' },
  { question: 'Есть минималка?', answer: 'Нет, минимального тиража нет.' },
];

function revealClass(isVisible: boolean, reduceMotion: boolean): string {
  if (reduceMotion) return 'opacity-100 translate-y-0';
  return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';
}

function delayStyle(index: number, reduceMotion: boolean): CSSProperties {
  return reduceMotion ? {} : { transitionDelay: `${index * 70}ms` };
}

function SectionBlock({ id, eyebrow, title, subtitle, children }: SectionBlockProps) {
  const reveal = useRevealOnScroll<HTMLDivElement>();

  return (
    <Section id={id} spacing="tight" className="scroll-mt-24">
      <div
        ref={reveal.ref}
        className={`transition-all duration-700 ease-out motion-reduce:transition-none ${revealClass(reveal.isVisible, reveal.prefersReducedMotion)}`}
      >
        <div className="section-header">
          {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
          <h2 className="t-h2">{title}</h2>
          {subtitle && (
            <p className={`t-body ${id === 'examples' ? 'max-w-5xl lg:whitespace-nowrap' : 'max-w-3xl'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {children({ isVisible: reveal.isVisible, prefersReducedMotion: reveal.prefersReducedMotion })}
      </div>
    </Section>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="pr-4 text-sm font-semibold md:text-base">{item.question}</span>
              <ChevronDown
                className={`size-5 shrink-0 text-red-600 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            <div className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-neutral-600 dark:text-neutral-300">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnimatedCard({ index, reveal, className, children }: { index: number; reveal: SectionRenderState; className: string; children: ReactNode }) {
  return (
    <article
      style={delayStyle(index, reveal.prefersReducedMotion)}
      className={`${className} transition-all duration-500 motion-reduce:transition-none ${revealClass(reveal.isVisible, reveal.prefersReducedMotion)}`}
    >
      {children}
    </article>
  );
}

function ExampleMockup({ title, description, imageSrc }: { title: string; description: string; imageSrc: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden">
      <Image src={imageSrc} alt={title} fill className="object-cover" sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" />
      <div className="card-image-overlay" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
        <p className="inline-flex rounded-full border border-white/35 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/90">Пример работ</p>
        <h3 className="mt-2 max-w-[26ch] text-[1.1rem] font-semibold leading-snug text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)] sm:text-[1.2rem]">{title}</h3>
        <p className="mt-2 max-w-[34ch] text-xs leading-relaxed text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] sm:text-sm">{description}</p>
      </div>
    </div>
  );
}


type TshirtsLandingProps = {
  heroTitle?: string;
  heroDescription?: string;
  heroPrimaryButtonText?: string;
  heroSecondaryButtonText?: string;
  galleryImages?: Record<string, SiteImageRecord | null>;
};

export default function TshirtsLanding({
  heroTitle = 'Печать на футболках',
  heroDescription = 'Печать на футболках для команд, брендов и мероприятий. Помогаем выбрать способ нанесения и выдаём изделие, готовое к использованию.',
  heroPrimaryButtonText = 'Оставить заявку',
  heroSecondaryButtonText = 'Смотреть примеры',
  galleryImages = {},
}: TshirtsLandingProps) {
  const heroReveal = useRevealOnScroll<HTMLDivElement>({ threshold: 0.12 });

  return (
    <div className="bg-white pb-10 dark:bg-neutral-950">
      <Section id="tshirts-hero" spacing="hero" className="relative overflow-hidden">
        <div className="relative">
          <div
            ref={heroReveal.ref}
            className={`transition-all duration-700 ${revealClass(heroReveal.isVisible, heroReveal.prefersReducedMotion)}`}
          >
            <PageHero
              className="border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50 to-red-50/15 p-5 shadow-sm shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 md:p-7 lg:p-9"
              contentClassName="max-w-[580px]"
              mediaClassName="lg:min-h-[420px]"
              media={
                <HeroMediaPanel className="relative min-h-[250px] p-0 shadow-[0_16px_36px_rgba(15,23,42,0.14)] sm:min-h-[320px] lg:min-h-[420px]">
                  <Image
                    src={galleryImages['tshirts.hero.main']?.url ?? '/images/t-shirt/tshirt_hero.png'}
                    alt={galleryImages['tshirts.hero.main']?.altText || 'Брендированные футболки для команды'}
                    fill
                    className="object-cover object-center"
                    sizes="(min-width: 1280px) 540px, (min-width: 1024px) 44vw, 100vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
                    <p className="text-sm font-semibold text-white">Печать для мерча, формы и промо</p>
                    <p className="mt-0.5 text-xs text-white/85">Стабильная цветопередача и аккуратная посадка принта</p>
                  </div>
                </HeroMediaPanel>
              }
            >
              <HeroEyebrow className="text-xs tracking-[0.18em]">Брендированная одежда</HeroEyebrow>
              <HeroTitle className="mt-3 max-w-[15ch] text-3xl font-extrabold leading-tight tracking-tight md:text-5xl md:leading-[1.04]">{heroTitle}</HeroTitle>
              <HeroLead className="mt-3 max-w-2xl text-sm leading-6 dark:text-neutral-300 md:text-[1.03rem] md:leading-7">
                {heroDescription}
              </HeroLead>

                <p className="mt-6 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                  Работаем с тиражами от 1 изделия: подойдёт для мерча, формы и корпоративных запусков.
                </p>
                <HeroChipList className="mt-3 gap-2 sm:grid-cols-2">
                  {kpiChips.map((chip, index) => (
                    <HeroChip
                      key={chip}
                      style={delayStyle(index, heroReveal.prefersReducedMotion)}
                      className={`rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900 ${revealClass(heroReveal.isVisible, heroReveal.prefersReducedMotion)}`}
                    >
                      <p className="flex items-center gap-2 text-xs font-semibold leading-none text-neutral-900 dark:text-neutral-100">
                        <span className="size-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                        {chip}
                      </p>
                    </HeroChip>
                  ))}
                </HeroChipList>

                <HeroActions className="mt-6">
                  <Link
                    href="#tshirts-order"
                    className="btn-primary h-11 px-6 text-sm no-underline"
                  >
                    {heroPrimaryButtonText}
                  </Link>
                  <Link
                    href="#examples"
                    className="btn-secondary h-11 border-neutral-300 bg-white/90 px-5 text-sm text-neutral-700 no-underline"
                  >
                    {heroSecondaryButtonText}
                  </Link>
                </HeroActions>
            </PageHero>
          </div>
        </div>
      </Section>

      <SectionBlock
        eyebrow="Технологии"
        title="Технологии печати"
        subtitle="Подбираем технологию под ткань, задачу и тип макета."
      >
        {(reveal) => (
          <div className="grid gap-5 lg:grid-cols-2">
            {printTechnologyCards.map((card, index) => (
              <AnimatedCard
                key={card.title}
                index={index}
                reveal={reveal}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                  {card.label}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{card.descriptor}</p>

                <ul className="mt-5 space-y-2.5 text-sm text-neutral-700 dark:text-neutral-200">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-neutral-200 pt-4 text-xs font-medium leading-relaxed text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  {card.bestFor}
                </p>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock
        eyebrow="Ориентиры по цене"
        title="Стоимость"
        subtitle="Прозрачные условия без скрытых доплат. Для нестандартных задач менеджер подтвердит расчёт перед печатью."
      >
        {(reveal) => (
          <div className="grid gap-4 md:grid-cols-3">
            {pricingCards.map((card, index) => (
              <AnimatedCard
                key={card.title}
                index={index}
                reveal={reveal}
                className={`card-info card-interactive h-full rounded-2xl border bg-white/95 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] dark:bg-neutral-900 ${
                  card.featured
                    ? 'border-red-300 ring-1 ring-red-200/70 dark:border-red-900 dark:ring-red-900/40'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="mb-3 inline-flex size-8 items-center justify-center rounded-lg border border-red-200/70 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
                  <card.icon size={16} strokeWidth={1.9} aria-hidden="true" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold md:text-lg">{card.title}</h3>
                </div>
                <p className="mt-3 border-t border-neutral-200/80 pt-3 text-2xl font-bold text-neutral-900 dark:border-neutral-800 dark:text-neutral-50">{card.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {card.lines.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock id="examples" eyebrow="Портфолио" title="Примеры работ" subtitle="Нанесение для команды, промо и корпоративного мерча — с акцентом на аккуратный вид и стойкость принта.">
        {(reveal) => (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {galleryCards.map((card, index) => (
              <AnimatedCard
                key={card.title}
                index={index}
                reveal={reveal}
                className="premium-card group h-full overflow-hidden"
              >
                <ExampleMockup
                  title={card.title}
                  description={card.description}
                  imageSrc={galleryImages[card.slotKey]?.url ?? card.imageSrc}
                />
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock eyebrow="Процесс" title="Как это работает">
        {(reveal) => (
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <AnimatedCard
                  key={step.title}
                  index={index}
                  reveal={reveal}
                  className="h-full rounded-2xl border border-neutral-200 bg-white/90 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-red-200/70 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Шаг {index + 1}</p>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{step.description}</p>
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </SectionBlock>

      <SectionBlock eyebrow="Преимущества" title="Почему выбирают нас">
        {(reveal) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, index) => {
              const Icon = item.icon;

              return (
              <AnimatedCard
                key={item.text}
                index={index}
                reveal={reveal}
                className="card-info card-interactive rounded-2xl border border-neutral-200/90 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-red-200/70 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.text}</p>
                </div>
              </AnimatedCard>
              );
            })}
          </div>
        )}
      </SectionBlock>

      <SectionBlock eyebrow="FAQ" title="Частые вопросы" subtitle="Короткие ответы по срокам, файлам и условиям заказа.">
        {() => <FaqAccordion />}
      </SectionBlock>

      <Section id="tshirts-order" spacing="tight" className="scroll-mt-24">
        <OrderTshirtsForm />
      </Section>
    </div>
  );
}
