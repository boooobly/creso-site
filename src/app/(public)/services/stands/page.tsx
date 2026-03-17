import Link from 'next/link';
import Image from 'next/image';
import { Building2, CheckCircle2, ClipboardList, PackageCheck, Ruler, School, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import Section from '@/components/Section';
import StandPreviewCard from '@/components/services/StandPreviewCard';
import RevealOnScroll from '@/components/RevealOnScroll';
import { messages } from '@/lib/messages';
import { getSiteImage } from '@/lib/site-images';

const heroChips = ['Собственное производство', 'Карманы и сменные блоки', 'Изготовление по размерам', 'Доставка и монтаж'] as const;

const indoorStands = [
  { title: 'Стенд «Информация»', description: 'Универсальное решение для объявлений и инструкций.', previewHint: 'Типовая компоновка с карманами А4 и шапкой.', imageSrc: '/images/stands/info.png' },
  { title: 'Уголок потребителя', description: 'Для торговых точек, салонов и офисов.', previewHint: 'Блоки с документами, реквизитами и правилами.', imageSrc: '/images/stands/consumer_corner.png' },
  { title: 'Пожарные стенды', description: 'Схемы, регламенты и инструкции по безопасности.', previewHint: 'Схема эвакуации и обязательные памятки.', imageSrc: '/images/stands/fire_safety.png' },
  { title: 'Охрана труда', description: 'Наглядные материалы для производственных зон.', previewHint: 'Нормативы, инструкции и чек-листы для персонала.', imageSrc: '/images/stands/labor_protection.png' },
  { title: 'Первая помощь', description: 'Памятки и алгоритмы действий в экстренных случаях.', previewHint: 'Алгоритмы оказания помощи и контактные номера.', imageSrc: '/images/stands/first_aid.png' },
  { title: 'Гражданская оборона и ЧС', description: 'Информационные блоки для обучения персонала.', previewHint: 'Порядок действий при внештатных ситуациях.', imageSrc: '/images/stands/civil_defense.png' },
] as const;

const outdoorStands = [
  { title: 'Уличные информационные стенды', description: 'Антивандальные решения с защитой от погоды.', previewHint: 'Усиленная рама и защищённая зона размещения листов.', imageSrc: '/images/stands/street_stand.png' },
  { title: 'Уличные городские стенды', description: 'Оформление в фирменных требованиях муниципалитетов.', previewHint: 'Формат с бренд-зоной и нормативной структурой.', imageSrc: '/images/stands/city_stand.png' },
  { title: 'На детские площадки', description: 'Яркие и безопасные конструкции для дворов и парков.', previewHint: 'Визуально читаемый стенд для жителей и родителей.', imageSrc: '/images/stands/playgrounds.png' },
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
  const heroImage = await getSiteImage('stands.hero.main');
  const heroImageSrc = heroImage?.url ?? '/images/stands/hero.png';
  const heroImageAlt = heroImage?.altText || 'Изготовление информационных стендов';

  return (
    <div>
      <Section className="pb-8 pt-8 md:pb-10 md:pt-10" background="default" id="stands-hero">
        <div className="card grid gap-8 rounded-3xl bg-gradient-to-br from-white to-neutral-50 p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="t-eyebrow">Изготовление стендов</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Изготовление информационных стендов</h1>
            <p className="mt-4 t-body max-w-2xl">
              Производим стенды для школ, детских садов, организаций, офисов, предприятий и уличных пространств. Подбираем формат,
              материалы и конструкцию под конкретную задачу.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#stands-lead-form" className="btn-primary no-underline">
                Рассчитать стоимость
              </Link>
              <Link href="#stands-catalog" className="btn-secondary no-underline">
                Смотреть варианты
              </Link>
            </div>

            <div className="mt-5 grid max-w-xl grid-cols-2 gap-2.5">
              {heroChips.map((chip) => (
                <span key={chip} className="chip-elevated rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-700">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-gradient-to-br from-neutral-100/90 to-white p-5 md:p-6">
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
            </div>
          </div>
        </div>
      </Section>

      <Section id="stands-catalog" background="muted" fullBleed className="border-y border-neutral-200/70 py-12 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Стенды для помещений</h2>
          <p className="t-body max-w-3xl">Базовые и специализированные стенды для ежедневной работы, инструктажей и внутренней коммуникации.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indoorStands.map((item) => (
            <StandPreviewCard
              key={item.title}
              label="Для помещений"
              title={item.title}
              description={item.description}
              previewHint={item.previewHint}
              imageSrc={item.imageSrc}
            />
          ))}
        </div>
      </Section>

      <Section background="default" className="py-12 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Уличные стенды</h2>
          <p className="t-body max-w-3xl">Решения для размещения на фасадах, территориях учреждений и общественных площадках.</p>
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
              imageSrc={item.imageSrc}
            />
          ))}
        </div>
      </Section>

      <Section background="muted" fullBleed className="border-y border-neutral-200/70 py-12 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Как изготавливаем стенды</h2>
          <p className="t-body max-w-3xl">Подбираем конструкцию с учётом места установки, условий эксплуатации и частоты обновления информации.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((item) => (
            <RevealOnScroll key={item.title} className="h-full">
              <article className="group h-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)]">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:bg-red-100">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Для кого подойдут стенды</h2>
          <p className="t-body max-w-3xl">Изготавливаем стенды под требования учреждений, бизнеса и производственных площадок.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => (
            <article key={item} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                  {item.includes('Школ') || item.includes('сады') ? <School className="size-4" aria-hidden="true" /> : <Building2 className="size-4" aria-hidden="true" />}
                </span>
                <p className="text-sm font-semibold text-neutral-800">{item}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section background="muted" fullBleed className="border-y border-neutral-200/70 py-12 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Почему заказывают у нас</h2>
          <p className="t-body max-w-3xl">Работаем в привычном для клиентов формате: от идеи и макета до готовой поставки и монтажа.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((item, index) => (
            <RevealOnScroll key={item} className={getRevealDelayClass(index)}>
              <article className="group flex h-full min-h-[88px] items-center rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:bg-red-100">
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
        <div className="rounded-2xl bg-neutral-900 px-6 py-8 text-white md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:px-8">
          <div>
            <h2 className="text-3xl font-bold">Нужен стенд под вашу задачу?</h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-200 md:text-base">
              Подскажем размеры, материалы, количество карманов и формат крепления, рассчитаем стоимость изготовления, доставки и монтажа.
            </p>
          </div>
          <Link href="#stands-lead-form" className="btn-primary mt-5 w-full no-underline md:mt-0 md:w-auto">
            Получить консультацию
          </Link>
        </div>
      </Section>

      <Section id="stands-lead-form" background="muted" fullBleed className="pt-0">
        <div className="card rounded-2xl border border-neutral-200/80 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold">Рассчитать стоимость стенда</h2>
          <p className="mt-2 text-sm text-neutral-600 md:text-base">
            Опишите, какой стенд нужен, где он будет размещаться и требуются ли карманы, стойки или монтаж — подготовим расчёт и варианты.
          </p>
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
