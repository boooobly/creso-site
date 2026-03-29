import Link from 'next/link';
import Image from 'next/image';
import { Building2, CheckCircle2, ClipboardList, PackageCheck, Ruler, School, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import Section from '@/components/Section';
import StandPreviewCard from '@/components/services/StandPreviewCard';
import RevealOnScroll from '@/components/RevealOnScroll';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import { messages } from '@/lib/messages';
import { getSiteImages } from '@/lib/site-images';
import { STANDS_SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

const heroChips = ['Собственное производство', 'Карманы и сменные блоки', 'Изготовление по размерам', 'Доставка и монтаж'] as const;

const indoorStands = [
  { title: 'Стенд «Информация»', description: 'Универсальное решение для объявлений и инструкций.', previewHint: 'Типовая компоновка с карманами А4 и шапкой.', imageSrc: '/images/stands/info.png', slotKey: 'stands.indoor.info' },
  { title: 'Уголок потребителя', description: 'Для торговых точек, салонов и офисов.', previewHint: 'Блоки с документами, реквизитами и правилами.', imageSrc: '/images/stands/consumer_corner.png', slotKey: 'stands.indoor.consumer_corner' },
  { title: 'Пожарные стенды', description: 'Схемы, регламенты и инструкции по безопасности.', previewHint: 'Схема эвакуации и обязательные памятки.', imageSrc: '/images/stands/fire_safety.png', slotKey: 'stands.indoor.fire_safety' },
  { title: 'Охрана труда', description: 'Наглядные материалы для производственных зон.', previewHint: 'Нормативы, инструкции и чек-листы для персонала.', imageSrc: '/images/stands/labor_protection.png', slotKey: 'stands.indoor.labor_protection' },
  { title: 'Первая помощь', description: 'Памятки и алгоритмы действий в экстренных случаях.', previewHint: 'Алгоритмы оказания помощи и контактные номера.', imageSrc: '/images/stands/first_aid.png', slotKey: 'stands.indoor.first_aid' },
  { title: 'Гражданская оборона и ЧС', description: 'Информационные блоки для обучения персонала.', previewHint: 'Порядок действий при внештатных ситуациях.', imageSrc: '/images/stands/civil_defense.png', slotKey: 'stands.indoor.civil_defense' },
] as const;

const outdoorStands = [
  { title: 'Уличные информационные стенды', description: 'Антивандальные решения с защитой от погоды.', previewHint: 'Усиленная рама и защищённая зона размещения листов.', imageSrc: '/images/stands/street_stand.png', slotKey: 'stands.outdoor.street_stand' },
  { title: 'Уличные городские стенды', description: 'Оформление в фирменных требованиях муниципалитетов.', previewHint: 'Формат с бренд-зоной и нормативной структурой.', imageSrc: '/images/stands/city_stand.png', slotKey: 'stands.outdoor.city_stand' },
  { title: 'На детские площадки', description: 'Яркие и безопасные конструкции для дворов и парков.', previewHint: 'Визуально читаемый стенд для жителей и родителей.', imageSrc: '/images/stands/playgrounds.png', slotKey: 'stands.outdoor.playgrounds' },
] as const;

const materials = [
  { title: 'Основа из ПВХ', description: 'Лёгкая и практичная база для интерьерных стендов.', icon: ClipboardList },
  { title: 'Композитные панели', description: 'Жёсткая конструкция для долговечной эксплуатации.', icon: PackageCheck },
  { title: 'Карманы из оргстекла', description: 'Прозрачные карманы под листы и сменные сообщения.', icon: Sparkles },
  { title: 'Стойки и рамы', description: 'Настенные и напольные варианты крепления.', icon: Wrench },
  { title: 'Сменные информационные блоки', description: 'Быстрое обновление данных без переделки стенда.', icon: CheckCircle2 },
  { title: 'Изготовление по индивидуальным размерам', description: 'Подстраиваем формат и компоновку под вашу задачу.', icon: Ruler },
] as const;

const audiences = ['Школы', 'Детские сады', 'Магазины и офисы', 'Производственные предприятия', 'Управляющие компании', 'Муниципальные учреждения'] as const;

const advantages = [
  'Собственное производство',
  'Изготовление по ТЗ и размерам',
  'Разработка макета',
  'Карманы, стойки и рамки под задачу',
  'Доставка и монтаж',
  'Работаем с единичными и тиражными заказами',
] as const;


const revealDelayClasses = [
  '',
  'delay-75',
  'delay-150',
  'delay-200',
  'delay-300',
  'delay-[360ms]',
  'delay-[420ms]',
  'delay-[480ms]',
] as const;

const getRevealDelayClass = (index: number) => revealDelayClasses[index] ?? revealDelayClasses[revealDelayClasses.length - 1];

export default async function StandsServicePage() {
  const siteImages = await getSiteImages(STANDS_SITE_IMAGE_SLOTS.map((slot) => slot.key));
  const heroImageSrc = siteImages['stands.hero.main']?.url ?? '/images/stands/hero.png';
  const heroImageAlt = siteImages['stands.hero.main']?.altText || 'Изготовление информационных стендов';

  return (
    <div>
      <Section className="pb-8 pt-8 md:pb-10 md:pt-10" background="default" id="stands-hero">
        <PageHero
          className="border border-neutral-200/80 bg-gradient-to-br from-white via-neutral-50 to-red-50/[0.14]"
          contentClassName="space-y-6 lg:pr-4"
          media={
            <HeroMediaPanel className="rounded-3xl border-neutral-200/90 bg-neutral-100/90 p-4 md:p-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 bg-white/80">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  priority
                />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/90 bg-white/95 px-4 py-3 backdrop-blur-md shadow-[0_12px_30px_rgba(17,24,39,0.14)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Собственное производство</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">Под задачи бизнеса и учреждений</p>
              </div>
            </HeroMediaPanel>
          }
        >
          <HeroEyebrow>ИЗГОТОВЛЕНИЕ СТЕНДОВ</HeroEyebrow>
          <HeroTitle className="max-w-[16ch] text-3xl tracking-tight md:text-5xl">Изготовление информационных стендов</HeroTitle>
          <HeroLead className="max-w-[34rem] text-base md:leading-relaxed">
            Производим стенды для школ, детских садов, организаций, офисов, предприятий и уличных пространств. Подбираем формат,
            материалы и конструкцию под конкретную задачу.
          </HeroLead>

          <HeroActions className="mt-7">
            <Link href="#stands-lead-form" className="btn-primary no-underline">
              Рассчитать стоимость
            </Link>
            <Link href="#stands-catalog" className="btn-secondary no-underline">
              Смотреть варианты
            </Link>
          </HeroActions>

          <HeroChipList className="mt-5 max-w-2xl gap-2.5">
            {heroChips.map((chip) => (
              <HeroChip key={chip} className="chip-elevated min-h-9 border-neutral-200/80 bg-white/85 px-3.5 py-1.5 text-xs">
                {chip}
              </HeroChip>
            ))}
          </HeroChipList>
        </PageHero>
      </Section>

      <Section id="stands-catalog" background="muted" fullBleed className="border-y border-neutral-200/70 py-12 md:py-16">
        <div className="section-header space-y-3">
          <p className="t-eyebrow">КАТАЛОГ</p>
          <h2 className="t-h2">Стенды для помещений</h2>
          <p className="t-body max-w-3xl text-neutral-600">Базовые и специализированные стенды для ежедневной работы, инструктажей и внутренней коммуникации.</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {indoorStands.map((item) => (
            <StandPreviewCard
              key={item.title}
              label="Для помещений"
              title={item.title}
              description={item.description}
              previewHint={item.previewHint}
              imageSrc={siteImages[item.slotKey]?.url ?? item.imageSrc}
            />
          ))}
        </div>
      </Section>

      <Section background="default" className="py-12 md:py-16">
        <div className="section-header space-y-3">
          <p className="t-eyebrow">ВАРИАНТЫ ДЛЯ УЛИЦЫ</p>
          <h2 className="t-h2">Уличные стенды</h2>
          <p className="t-body max-w-3xl text-neutral-600">Решения для размещения на фасадах, территориях учреждений и общественных площадках.</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {outdoorStands.map((item) => (
            <StandPreviewCard
              key={item.title}
              variant="outdoor"
              label="Для улицы"
              title={item.title}
              description={item.description}
              previewHint={item.previewHint}
              imageSrc={siteImages[item.slotKey]?.url ?? item.imageSrc}
            />
          ))}
        </div>
      </Section>

      <Section background="muted" fullBleed className="border-y border-neutral-200/70 py-12 md:py-16">
        <div className="section-header space-y-3">
          <p className="t-eyebrow">ПРОЦЕСС И МАТЕРИАЛЫ</p>
          <h2 className="t-h2">Как изготавливаем стенды</h2>
          <p className="t-body max-w-3xl text-neutral-600">Подбираем конструкцию с учётом места установки, условий эксплуатации и частоты обновления информации.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((item, index) => (
            <RevealOnScroll key={item.title} className="h-full">
              <article className="card-info card-interactive group h-full p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl border border-red-100 bg-red-50/80 text-red-700 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:bg-red-100">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">0{index + 1}</span>
                </div>
                <h3 className="text-base font-semibold tracking-tight text-neutral-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{item.description}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="section-header space-y-3">
          <p className="t-eyebrow">ОБЛАСТИ ПРИМЕНЕНИЯ</p>
          <h2 className="t-h2">Для кого подойдут стенды</h2>
          <p className="t-body max-w-3xl text-neutral-600">Изготавливаем стенды под требования учреждений, бизнеса и производственных площадок.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => (
            <article key={item} className="card-info flex items-center gap-3 p-4">
              <span className="inline-flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100/85 text-neutral-600">
                {item.includes('Школ') || item.includes('сады') ? <School className="size-4" aria-hidden="true" /> : <Building2 className="size-4" aria-hidden="true" />}
              </span>
              <p className="text-sm font-semibold leading-6 text-neutral-800">{item}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section background="muted" fullBleed className="border-y border-neutral-200/70 py-12 md:py-16">
        <div className="section-header space-y-3">
          <p className="t-eyebrow">ПРЕИМУЩЕСТВА</p>
          <h2 className="t-h2">Почему заказывают у нас</h2>
          <p className="t-body max-w-3xl text-neutral-600">Работаем в привычном для клиентов формате: от идеи и макета до готовой поставки и монтажа.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((item, index) => (
            <RevealOnScroll key={item} className={getRevealDelayClass(index)}>
              <article className="card-info card-interactive group flex h-full min-h-[96px] items-center p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-700 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:bg-red-100">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-neutral-800">{item}</p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="cta-shell border-neutral-800/80 bg-neutral-900 px-6 py-8 text-white md:px-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center md:gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Консультация по проекту</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Нужен стенд под вашу задачу?</h2>
              <p className="mt-2 max-w-2xl text-sm text-neutral-200 md:text-base">
                Подскажем размеры, материалы, количество карманов и формат крепления, рассчитаем стоимость изготовления, доставки и монтажа.
              </p>
            </div>
            <Link href="#stands-lead-form" className="btn-primary w-full no-underline md:w-auto">
              Получить консультацию
            </Link>
          </div>
        </div>
      </Section>

      <Section id="stands-lead-form" background="muted" fullBleed className="pt-0">
        <div className="card rounded-3xl border border-neutral-200/85 bg-white p-6 md:p-8">
          <div className="space-y-3">
            <p className="t-eyebrow">Заявка на расчёт</p>
            <h2 className="text-2xl font-bold tracking-tight">Рассчитать стоимость стенда</h2>
            <p className="text-sm text-neutral-600 md:text-base">
              Опишите, какой стенд нужен, где он будет размещаться и требуются ли карманы, стойки или монтаж — подготовим расчёт и варианты.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">Расчёт под задачу</span>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">Материалы и комплектация</span>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">Доставка и монтаж</span>
            </div>
          </div>
          <div className="mt-5">
            <LeadForm
              t={messages}
              source="stands"
              initialService="Изготовление стендов"
              showMessageField
              phoneRequired
              submitMessagePrefix="Запрос: Изготовление стендов."
              includePageUrl
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
