import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Building2,
  FileCheck2,
  HardHat,
  Landmark,
  Lightbulb,
  MapPinned,
  PanelsTopLeft,
  RectangleHorizontal,
  ShieldCheck,
  Sparkles,
  Sticker,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import Section from '@/components/Section';
import LeadForm from '@/components/LeadForm';
import RevealOnScroll from '@/components/RevealOnScroll';
import OutdoorFloatingCtas from '@/components/OutdoorFloatingCtas';
import ProductionTrustBlock from '@/components/ProductionTrustBlock';
import OutdoorPortfolioGallery from '@/components/OutdoorPortfolioGallery';
import { messages } from '@/lib/messages';

const services: { label: string; icon: LucideIcon }[] = [
  { label: 'Световые короба', icon: Lightbulb },
  { label: 'Объёмные буквы', icon: PanelsTopLeft },
  { label: 'Контражурные буквы', icon: Sparkles },
  { label: 'Крышные установки', icon: Landmark },
  { label: 'Баннеры на фасад', icon: RectangleHorizontal },
  { label: 'Лайтбоксы', icon: Lightbulb },
  { label: 'Гибкий неон', icon: Sticker },
  { label: 'Стелы', icon: MapPinned },
  { label: 'Таблички', icon: BadgeCheck },
  { label: 'Кастомные конструкции любой сложности', icon: Wrench },
];

const strengths: { label: string; icon: LucideIcon }[] = [
  { label: 'Собственная производственная база', icon: Building2 },
  { label: 'Монтажная бригада', icon: Users },
  { label: 'Автовышка', icon: HardHat },
  { label: 'Работа на высоте', icon: Wrench },
  { label: 'Доставка по краю', icon: Truck },
  { label: 'Заключаем договор', icon: FileCheck2 },
  { label: 'Гарантия 5 лет', icon: ShieldCheck },
];

const fullCycleItems = [
  'Дизайн и визуализация',
  'Технический расчет',
  'Проектирование',
  'Изготовление',
  'Монтаж',
] as const;

const heroTrustBadges = [
  'Работаем по ЮФО',
  'Гарантия до 5 лет',
  'Пожизненное сервисное обслуживание',
  'Собственное производство',
] as const;

const steps = ['Заявка', 'Замер (бесплатно по городу)', 'Производство', 'Монтаж'];

const cities = ['Невинномысске', 'Ставрополе', 'Пятигорске', 'Минеральных Водах', 'Кисловодске', 'Ессентуках'];

const portfolioImages = [
  {
    src: '/images/outdoor-portfolio/placeholder-1.svg',
    alt: 'Световая вывеска на фасаде торгового объекта',
    title: 'Фасадная световая вывеска',
    category: 'Вывески',
    location: 'Ставрополь',
  },
  {
    src: '/images/outdoor-portfolio/placeholder-2.svg',
    alt: 'Объёмные буквы для корпоративного офиса',
    title: 'Объёмные буквы с контражуром',
    category: 'Объёмные буквы',
    location: 'Пятигорск',
  },
  {
    src: '/images/outdoor-portfolio/placeholder-3.svg',
    alt: 'Брендированная входная группа с подсветкой',
    title: 'Брендирование входной группы',
    category: 'Комплексное оформление',
    location: 'Невинномысск',
  },
  {
    src: '/images/outdoor-portfolio/placeholder-4.svg',
    alt: 'Крышная рекламная установка',
    title: 'Крышная установка',
    category: 'Крышные конструкции',
    location: 'Минеральные Воды',
  },
  {
    src: '/images/outdoor-portfolio/placeholder-5.svg',
    alt: 'Навигационная стела у коммерческого объекта',
    title: 'Навигационная стела',
    category: 'Стелы и навигация',
    location: 'Кисловодск',
  },
  {
    src: '/images/outdoor-portfolio/placeholder-6.svg',
    alt: 'Световой короб для сети магазинов',
    title: 'Световой короб для ритейла',
    category: 'Лайтбоксы',
    location: 'Ессентуки',
  },
] as const;

export default function OutdoorAdvertisingPage() {
  return (
    <div className="pb-24 md:pb-0">
      <OutdoorFloatingCtas />

      <Section className="pb-6 md:pb-10" id="outdoor-hero" background="default">
        <div className="card grid gap-8 bg-gradient-to-b from-neutral-100 to-white p-6 dark:from-neutral-950 dark:to-neutral-900 md:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="flex h-full flex-col gap-6 md:gap-7">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">Наружная реклама под ключ в Ставропольском крае</h1>
              <p className="max-w-3xl text-lg text-neutral-700 dark:text-neutral-300">
                Проектирование, производство и монтаж рекламных конструкций любой сложности по ЮФО.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {heroTrustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#outdoor-form-section"
                className="btn-primary no-underline ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Получить бесплатный расчет
              </Link>
              <Link
                href="#outdoor-portfolio"
                className="btn-secondary no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Смотреть примеры работ
              </Link>
            </div>
          </div>

          <div className="relative min-h-[350px] overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-md dark:border-neutral-700 dark:bg-neutral-900 md:min-h-[440px]">
            <Image
              src="/images/outdoor_advertising/manufacturing.png"
              alt="Производство наружной рекламы"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
            />
          </div>
        </div>
      </Section>

      <Section className="pt-0" id="outdoor-portfolio" background="muted">
        <RevealOnScroll>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">Портфолио</h2>
            <p className="hidden text-sm text-neutral-600 md:block dark:text-neutral-300">Реализованные проекты по региону</p>
          </div>
          <OutdoorPortfolioGallery images={[...portfolioImages]} />
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="default">
        <RevealOnScroll>
          <h2 className="mb-6 text-2xl font-bold">Что изготавливаем</h2>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.label}
                className="card flex min-h-[136px] rounded-xl p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-xl hover:shadow-black/10"
              >
                <div className="flex items-start gap-3">
                  <service.icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
                  <p className="text-[15px] font-semibold leading-relaxed">{service.label}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="muted">
        <RevealOnScroll>
          <h2 className="mb-2 text-2xl font-bold">Почему выбирают нас</h2>
          <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">Без посредников - отвечаем за результат</p>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item) => (
              <article
                key={item.label}
                className="card flex min-h-[124px] rounded-xl border-neutral-200/90 bg-white/90 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/10"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold leading-relaxed">{item.label}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="default">
        <RevealOnScroll>
          <h2 className="mb-6 text-2xl font-bold">Полный цикл работ</h2>

          <ol className="grid gap-3 md:grid-cols-5">
            {fullCycleItems.map((item, index) => (
              <li
                key={item}
                className="card list-none rounded-xl border border-neutral-200/90 p-4 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/10"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Этап {index + 1}</p>
                <p className="text-sm font-semibold leading-relaxed">{item}</p>
              </li>
            ))}
          </ol>

          <article className="card mt-4 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5 md:p-6 dark:border-neutral-700 dark:bg-neutral-900/60">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-base font-semibold">Сервис и сопровождение</h3>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">
                  Диагностика и обслуживание, реставрация и обновление, постгарантийная поддержка.
                </p>
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Сопровождаем вывески на всем сроке эксплуатации.</p>
            </div>
          </article>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="muted">
        <RevealOnScroll>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900 md:p-7">
            <h2 className="mb-5 text-2xl font-bold">Как мы работаем</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article key={step} className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/70">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-red)]">Шаг {index + 1}</p>
                  <p className="text-sm font-semibold">{step}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
              Выезд в другие города — платный. <br />Возможен заказ по размерам клиента.
            </p>
          </div>
        </RevealOnScroll>
      </Section>

      <ProductionTrustBlock />

      <Section className="pt-0" background="default">
        <div className="grid items-center gap-5 rounded-2xl bg-neutral-900 px-6 py-7 text-white dark:bg-neutral-800 md:grid-cols-[1fr_auto] md:gap-6 md:px-8">
          <div>
            <h2 className="text-3xl font-bold">Нужна срочная установка?</h2>
            <p className="mt-2.5 max-w-2xl text-neutral-200">Изготавливаем и монтируем конструкции в сжатые сроки.</p>
          </div>
          <Link
            href="#outdoor-form-section"
            className="btn-primary w-full no-underline ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:w-auto"
          >
            Получить расчет
          </Link>
        </div>
      </Section>

      <Section className="pt-0" background="muted">
        <div className="card rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold">Работаем по всему Ставропольскому краю</h2>
          <p className="mt-2 text-neutral-700 dark:text-neutral-300">Изготавливаем и монтируем наружную рекламу в:</p>
          <div className="mt-5 grid gap-6 md:grid-cols-[1.15fr_1fr]">
            <ul className="grid gap-x-4 gap-y-2 text-sm md:grid-cols-2">
              {cities.map((city) => (
                <li key={city} className="text-neutral-700 dark:text-neutral-300">
                  • {city}
                </li>
              ))}
              <li className="text-neutral-700 dark:text-neutral-300">• и других городах региона</li>
            </ul>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Собственная бригада, выезд на замер и доставка конструкций позволяют запускать проекты быстро и в удобные сроки.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0" id="outdoor-form-section" background="default">
        <RevealOnScroll>
          <div className="card rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-6 md:p-8 dark:border-neutral-700 dark:bg-neutral-900/50">
            <h2 className="text-2xl font-bold">Получить бесплатный расчет наружной рекламы</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Ответим по стоимости, срокам и предложим оптимальный формат изготовления.</p>
            <div className="mt-5 [&_label]:text-neutral-700 [&_label]:dark:text-neutral-300 [&_label>span]:leading-relaxed [&_p]:text-neutral-600 [&_p]:dark:text-neutral-300">
              <LeadForm
                t={messages}
                source="outdoor"
                initialService="Наружная реклама"
                showMessageField
                phoneRequired
                submitMessagePrefix="Запрос: Наружная реклама (Ставропольский край)."
                includePageUrl
              />
            </div>
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}
