import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Building2, Clock3, Construction, FileCheck2, ShieldCheck, Truck, Users } from 'lucide-react';
import Section from '@/components/Section';
import LeadForm from '@/components/LeadForm';
import RevealOnScroll from '@/components/RevealOnScroll';
import OutdoorFloatingCtas from '@/components/OutdoorFloatingCtas';
import ProductionTrustBlock from '@/components/ProductionTrustBlock';
import { HeroActions, HeroChip, HeroChipList, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import OutdoorPortfolioGallery from '@/components/OutdoorPortfolioGallery';
import { messages } from '@/lib/messages';
import { getSiteImages } from '@/lib/site-images';
import { OUTDOOR_SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

const services: Array<{ title: string; image: string; slotKey: string; featured?: boolean }> = [
  { title: 'Световые короба', image: '/images/outdoor_examples/lightbox.png', slotKey: 'outdoor.services.lightbox', featured: true },
  { title: 'Объемные буквы', image: '/images/outdoor_examples/dimensional_letters.png', slotKey: 'outdoor.services.dimensional_letters' },
  { title: 'Контражурные буквы', image: '/images/outdoor_examples/backlit_sign.png', slotKey: 'outdoor.services.backlit_sign' },
  { title: 'Крышные установки', image: '/images/outdoor_examples/roof_sign.png', slotKey: 'outdoor.services.roof_sign' },
  { title: 'Баннеры', image: '/images/outdoor_examples/banner.png', slotKey: 'outdoor.services.banner' },
  { title: 'Лайтбоксы', image: '/images/outdoor_examples/lightbox_cube.png', slotKey: 'outdoor.services.lightbox_cube' },
  { title: 'Гибкий неон', image: '/images/outdoor_examples/neon.png', slotKey: 'outdoor.services.neon' },
  { title: 'Стелы', image: '/images/outdoor_examples/stela.png', slotKey: 'outdoor.services.stela' },
  { title: 'Адресные таблички', image: '/images/outdoor_examples/adress_sign.png', slotKey: 'outdoor.services.address_sign' },
  { title: 'Сложные конструкции любой сложности', image: '/images/outdoor_examples/custom.png', slotKey: 'outdoor.services.custom' },
] as const;

const strengths: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Собственное производство',
    description: 'Контролируем качество и сроки без посредников.',
    icon: Building2,
  },
  {
    title: 'Монтажная бригада',
    description: 'Доставка и установка силами собственной команды.',
    icon: Users,
  },
  {
    title: 'Автовышка',
    description: 'Работаем с высотными объектами и сложным монтажом.',
    icon: Construction,
  },
  {
    title: 'Работа на высоте',
    description: 'Выполняем монтажные работы на фасадах и крышах.',
    icon: ShieldCheck,
  },
  {
    title: 'Доставка по краю',
    description: 'Работаем по Ставропольскому краю и ближайшим городам.',
    icon: Truck,
  },
  {
    title: 'Заключаем договор',
    description: 'Фиксируем условия, этапы и стоимость работ.',
    icon: FileCheck2,
  },
  {
    title: 'Гарантия 5 лет',
    description: 'Сопровождаем проект и после установки.',
    icon: BadgeCheck,
  },
  {
    title: 'Более 15 лет на рынке',
    description: 'Опыт в изготовлении и монтаже рекламных конструкций.',
    icon: Clock3,
  },
];

const fullCycleItems = [
  {
    title: 'Проект и смета',
    description: 'Бриф, замер и согласование конструкции под объект.',
  },
  {
    title: 'Производство',
    description: 'Изготавливаем на собственной базе и проверяем качество.',
  },
  {
    title: 'Доставка и монтаж',
    description: 'Привозим и устанавливаем с соблюдением техники безопасности.',
  },
  {
    title: 'Запуск и сервис',
    description: 'Проверяем работу подсветки и остаемся на связи по гарантии.',
  },
] as const;

const heroTrustBadges = ['Собственное производство', 'Монтаж на высоте', 'Работаем по ЮФО', 'Гарантия 5 лет'] as const;

const steps = [
  { title: 'Заявка и задача', detail: 'Фиксируем формат, бюджет и срок запуска.' },
  { title: 'Замер и предложение', detail: 'Показываем решение, стоимость и этапы в договоре.' },
  { title: 'Производство', detail: 'Изготавливаем конструкцию и согласуем дату выезда.' },
  { title: 'Монтаж и сдача', detail: 'Устанавливаем, проверяем и передаем готовый объект.' },
] as const;

const cities = ['Краснодаре', 'Ростове-на-Дону', 'Ставрополе', 'Пятигорске', 'Минеральных Водах', 'Сочи'];

const portfolioProjects = [
  {
    id: 'baton',
    label: 'Baton',
    images: [
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/baton.png',
        slotKey: 'outdoor.portfolio.baton.main',
        alt: 'Проект Baton: общий вид рекламной конструкции',
        title: 'Общий вид',
        category: 'Фасадная вывеска',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-1.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/baton_zoom.png',
        slotKey: 'outdoor.portfolio.baton.zoom',
        alt: 'Проект Baton: крупный план деталей вывески',
        title: 'Детали',
        category: 'Крупный план',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-2.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/baton_night.png',
        slotKey: 'outdoor.portfolio.baton.night',
        alt: 'Проект Baton: ночной вид с подсветкой',
        title: 'Ночной вид',
        category: 'Подсветка',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-3.svg',
      },
    ],
  },
  {
    id: 'cheese',
    label: 'Cheese',
    images: [
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/cheese.png',
        slotKey: 'outdoor.portfolio.cheese.main',
        alt: 'Проект Cheese: общий вид рекламной конструкции',
        title: 'Общий вид',
        category: 'Фасадная вывеска',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-4.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/cheese_zoom.png',
        slotKey: 'outdoor.portfolio.cheese.zoom',
        alt: 'Проект Cheese: крупный план деталей вывески',
        title: 'Детали',
        category: 'Крупный план',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-5.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/cheese_night.png',
        slotKey: 'outdoor.portfolio.cheese.night',
        alt: 'Проект Cheese: ночной вид с подсветкой',
        title: 'Ночной вид',
        category: 'Подсветка',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-6.svg',
      },
    ],
  },
] as const;

export default async function OutdoorAdvertisingPage() {
  const [contentMap, siteImages] = await Promise.all([
    getPageContentMap('outdoor'),
    getSiteImages(OUTDOOR_SITE_IMAGE_SLOTS.map((slot) => slot.key)),
  ]);
  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Наружная реклама под задачи бизнеса в ЮФО');
  const heroDescription = getPageContentValue(contentMap, 'hero', 'description', 'Проектируем, производим и монтируем фасадные вывески и конструкции, чтобы ваш объект был заметен и приводил клиентов.');
  const heroPrimaryButtonText = getPageContentValue(contentMap, 'hero', 'primaryButtonText', 'Получить бесплатный расчет');
  const heroSecondaryButtonText = getPageContentValue(contentMap, 'hero', 'secondaryButtonText', 'Смотреть примеры работ');

  const heroImageSrc = siteImages['outdoor.hero.main']?.url ?? '/images/outdoor_advertising/manufacturing.png';
  const heroImageAlt = siteImages['outdoor.hero.main']?.altText || 'Производство наружной рекламы';

  const resolvedPortfolioProjects = portfolioProjects.map((project) => ({
    ...project,
    images: project.images.map((image) => ({
      ...image,
      src: siteImages[image.slotKey]?.url ?? image.src,
      alt: siteImages[image.slotKey]?.altText || image.alt,
    })),
  }));
  const sectionTitleClassName = 't-h2';
  const sectionIntroClassName = 't-body text-muted-foreground max-w-3xl';

  return (
    <div className="pb-24 md:pb-0">
      <OutdoorFloatingCtas />

      <Section className="pb-6 md:pb-10" id="outdoor-hero" background="default" spacing="compact">
        <PageHero
          className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/25"
          contentClassName="flex h-full max-w-[38.5rem] flex-col gap-6 md:gap-7 lg:pr-3"
          media={
            <HeroMediaPanel className="overflow-hidden rounded-[1.4rem] border-neutral-200/85 bg-neutral-100/80 p-0">
              <div className="relative aspect-[6/5] w-full overflow-hidden">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-2xl border border-white/30 bg-black/35 px-4 py-3 backdrop-blur-sm shadow-[0_14px_34px_-24px_rgba(2,6,23,0.9)] md:bottom-5 md:left-5 md:right-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">Наружная реклама под ключ</p>
                <p className="mt-1 text-sm font-semibold text-white">От заметной идеи до готового монтажа на объекте</p>
              </div>
            </HeroMediaPanel>
          }
        >
          <div className="space-y-4">
            <HeroTitle className="max-w-[15ch] text-3xl leading-[1.06] md:text-5xl">{heroTitle}</HeroTitle>
            <HeroLead className="max-w-[35rem] text-base md:text-[1.05rem] md:leading-relaxed">{heroDescription}</HeroLead>
          </div>

          <HeroChipList className="max-w-[38rem] gap-2.5">
            {heroTrustBadges.map((badge) => (
              <HeroChip key={badge} className="h-11 whitespace-nowrap rounded-xl px-3.5 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/40 hover:text-neutral-900">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                {badge}
              </HeroChip>
            ))}
          </HeroChipList>

          <HeroActions className="gap-3.5 pt-1">
            <Link
              href="#outdoor-form-section"
              className="btn-primary px-5 no-underline shadow-[0_8px_20px_rgba(220,38,38,0.24)] hover:shadow-[0_10px_24px_rgba(220,38,38,0.28)]"
            >{heroPrimaryButtonText}</Link>
            <Link
              href="#outdoor-portfolio"
              className="btn-secondary px-5 no-underline shadow-[0_4px_14px_rgba(17,24,39,0.06)] hover:shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
            >{heroSecondaryButtonText}</Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section className="pt-0" id="outdoor-portfolio" background="muted" fullBleed>
        <RevealOnScroll>
          <div className="section-header-split">
            <div className="space-y-2">
              <p className="t-eyebrow">ПОРТФОЛИО</p>
              <h2 className={sectionTitleClassName}>Реализованные проекты</h2>
              <p className={sectionIntroClassName}>Примеры наружной рекламы, которые мы спроектировали, изготовили и смонтировали в регионе.</p>
            </div>
            <p className="t-small text-muted-foreground max-w-xs text-right">Фасадные решения, объёмные буквы и подсветка в коммерческих проектах</p>
          </div>
          <OutdoorPortfolioGallery projects={resolvedPortfolioProjects} />
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="default">
        <RevealOnScroll>
          <div className="section-header">
            <p className="t-eyebrow">НАПРАВЛЕНИЯ</p>
            <h2 className={sectionTitleClassName}>Что изготавливаем</h2>
            <p className={sectionIntroClassName}>Изготавливаем вывески и конструкции под формат объекта, бюджет и требования к визуальному эффекту.</p>
          </div>
          <div className="grid-cards grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className={`card-visual card-interactive group relative isolate bg-neutral-900 ${service.featured ? 'min-h-[250px] md:col-span-2 lg:col-span-3 lg:min-h-[320px]' : 'min-h-[205px]'}`}
              >
                <Image
                  src={siteImages[service.slotKey]?.url ?? service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes={service.featured ? '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 95vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                />
                <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-t from-black/80 via-black/45 to-black/15" />
                <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-t from-black/85 via-black/55 to-black/20 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
                <div className="absolute inset-x-4 bottom-4 z-10 md:inset-x-5 md:bottom-5">
                  <p className="text-lg font-semibold leading-snug text-white md:text-xl">{service.title}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="muted" fullBleed>
        <RevealOnScroll>
          <div className="section-header">
            <p className="t-eyebrow">ПРЕИМУЩЕСТВА</p>
            <h2 className={sectionTitleClassName}>Почему выбирают нас</h2>
            <p className={sectionIntroClassName}>Даем предсказуемый сервис: понятные сроки, собственные специалисты и гарантийная поддержка.</p>
          </div>
          <div className="grid-cards auto-rows-fr sm:grid-cols-2 xl:grid-cols-4">
            {strengths.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="card-info card-interactive h-full p-6"
                >
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  </div>
                  <h3 className="t-h4 !text-base">{item.title}</h3>
                  <p className="t-body mt-2">{item.description}</p>
                </article>
              );
            })}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="default">
        <RevealOnScroll>
          <div className="section-header">
            <p className="t-eyebrow">ПОЛНЫЙ ЦИКЛ</p>
            <h2 className={sectionTitleClassName}>Полный цикл работ</h2>
            <p className={sectionIntroClassName}>Берем на себя все этапы реализации, чтобы вы получили готовую конструкцию без координации нескольких подрядчиков.</p>
          </div>

          <ol className="grid-cards md:grid-cols-2">
            {fullCycleItems.map((item, index) => (
              <li key={item.title} className="card-info card-interactive list-none p-5 md:p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-red)]">Этап {index + 1}</p>
                <p className="t-h4 !text-base">{item.title}</p>
                <p className="t-body mt-2">{item.description}</p>
              </li>
            ))}
          </ol>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="muted" fullBleed>
        <RevealOnScroll>
          <div className="card p-6 md:p-7">
            <div className="section-header-tight">
              <p className="t-eyebrow">ПРОЦЕСС</p>
              <h2 className={sectionTitleClassName}>Как мы работаем</h2>
            </div>
            <div className="grid-cards md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article key={step.title} className="card-structured p-4 dark:bg-neutral-800/70">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-red)]">Шаг {index + 1}</p>
                  <p className="t-h4 !text-base">{step.title}</p>
                  <p className="t-small mt-2 text-neutral-600 dark:text-neutral-300">{step.detail}</p>
                </article>
              ))}
            </div>
            <p className="t-body mt-4">По Ставрополю замер бесплатный, для других городов ЮФО условия выезда согласовываем заранее.</p>
          </div>
        </RevealOnScroll>
      </Section>

      <ProductionTrustBlock />

      <Section className="pt-0" background="muted" fullBleed>
        <div className="card overflow-hidden p-6 md:p-8">
          <div className="section-header-tight">
            <p className="t-eyebrow">ГЕОГРАФИЯ РАБОТ</p>
            <h2 className={sectionTitleClassName}>Работаем по всему ЮФО</h2>
            <p className={sectionIntroClassName}>Организуем производство, доставку и монтаж в городах Южного федерального округа.</p>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-[1.1fr_1fr]">
            <ul className="grid gap-x-4 gap-y-2 rounded-2xl border border-neutral-200/80 bg-white/70 p-4 text-sm md:grid-cols-2">
              {cities.map((city) => (
                <li key={city} className="text-neutral-700 dark:text-neutral-300">
                  • {city}
                </li>
              ))}
              <li className="text-neutral-700 dark:text-neutral-300">• и других городах ЮФО</li>
            </ul>
            <div className="card-structured !rounded-2xl !p-5">
              <p className="t-body text-neutral-700 dark:text-neutral-200">Согласовываем логистику, подъемную технику и окно монтажа под режим работы вашей точки.</p>
              <p className="t-small mt-3 font-medium text-neutral-700 dark:text-neutral-200">Работаем по договору и фиксируем сроки запуска до начала производства.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0" id="outdoor-form-section" background="default">
        <RevealOnScroll>
          <div className="form-shell card">
            <div className="section-header-tight">
              <p className="t-eyebrow">ЗАЯВКА НА РАСЧЁТ</p>
              <h2 className={sectionTitleClassName}>Получить бесплатный расчет наружной рекламы</h2>
              <p className={sectionIntroClassName}>Присылаем понятную смету и сроки после уточнения формата, размеров и адреса монтажа.</p>
            </div>
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
