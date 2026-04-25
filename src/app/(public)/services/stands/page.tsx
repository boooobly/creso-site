import Link from 'next/link';
import { Building2, CheckCircle2, ClipboardList, PackageCheck, Ruler, School, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import Section from '@/components/Section';
import StandPreviewCard from '@/components/services/StandPreviewCard';
import RevealOnScroll from '@/components/RevealOnScroll';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import ProtectedImage from '@/components/ui/ProtectedImage';
import { messages } from '@/lib/messages';
import { getSiteImages } from '@/lib/site-images';
import { STANDS_SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

const heroChips = ['Для помещений и улицы', 'Структура под ваши документы', 'Согласование макета перед запуском', 'От 1 стенда до серии'] as const;

const indoorStands = [
  { title: 'Стенд «Информация»', description: 'Для текущих объявлений, графиков и внутренних уведомлений.', previewHint: 'Шапка стенда и карманы A4/A5 для быстрой замены листов.', imageSrc: '/images/stands/info.png', slotKey: 'stands.indoor.info' },
  { title: 'Уголок потребителя', description: 'Для размещения обязательных сведений в точках обслуживания.', previewHint: 'Фиксированные блоки под реквизиты, правила и контакты.', imageSrc: '/images/stands/consumer_corner.png', slotKey: 'stands.indoor.consumer_corner' },
  { title: 'Пожарные стенды', description: 'Для инструктажа и информирования по пожарной безопасности.', previewHint: 'Зона под схему эвакуации и набор обязательных памяток.', imageSrc: '/images/stands/fire_safety.png', slotKey: 'stands.indoor.fire_safety' },
  { title: 'Охрана труда', description: 'Для регулярного информирования персонала на производстве.', previewHint: 'Секции под инструкции, нормы и журнальные чек-листы.', imageSrc: '/images/stands/labor_protection.png', slotKey: 'stands.indoor.labor_protection' },
  { title: 'Первая помощь', description: 'Для наглядных алгоритмов действий в экстренных ситуациях.', previewHint: 'Пошаговые памятки и отдельный блок с экстренными номерами.', imageSrc: '/images/stands/first_aid.png', slotKey: 'stands.indoor.first_aid' },
  { title: 'Гражданская оборона и ЧС', description: 'Для обучения сотрудников действиям при ЧС.', previewHint: 'Структурированные разделы по сценариям и порядку оповещения.', imageSrc: '/images/stands/civil_defense.png', slotKey: 'stands.indoor.civil_defense' },
] as const;

const outdoorStands = [
  { title: 'Уличные информационные стенды', description: 'Для объявлений на входных группах и внешних территориях.', previewHint: 'Герметичная зона под листы и усиленный профиль для улицы.', imageSrc: '/images/stands/street_stand.png', slotKey: 'stands.outdoor.street_stand' },
  { title: 'Уличные городские стенды', description: 'Для официальной информации во дворах и общественных местах.', previewHint: 'Компоновка под муниципальные требования и фирменный блок.', imageSrc: '/images/stands/city_stand.png', slotKey: 'stands.outdoor.city_stand' },
  { title: 'На детские площадки', description: 'Для правил поведения, контактов и полезной информации.', previewHint: 'Безопасные материалы, читаемая типографика и защитное покрытие.', imageSrc: '/images/stands/playgrounds.png', slotKey: 'stands.outdoor.playgrounds' },
] as const;

const materials = [
  { title: 'Основа из ПВХ', description: 'Ровная лёгкая плита для интерьерных стендов и кабинетов.', icon: ClipboardList },
  { title: 'Композитные панели', description: 'Жёсткая основа для уличной установки и длительной эксплуатации.', icon: PackageCheck },
  { title: 'Карманы из оргстекла', description: 'Прозрачные накладные карманы для листов A4/A5 и бланков.', icon: Sparkles },
  { title: 'Стойки и рамы', description: 'Настенный или напольный вариант с подбором типа крепления.', icon: Wrench },
  { title: 'Сменные информационные блоки', description: 'Модульные секции, которые обновляются без замены всей основы.', icon: CheckCircle2 },
  { title: 'Изготовление по размерам', description: 'Точно выдерживаем габариты под нишу, стену или фасад.', icon: Ruler },
] as const;

const audiences = ['Школы', 'Детские сады', 'Магазины и офисы', 'Производственные предприятия', 'Управляющие компании', 'Муниципальные учреждения'] as const;

const advantages = [
  'Понятный расчёт по параметрам и комплектации',
  'Аккуратное изготовление по согласованному макету',
  'Соблюдаем согласованные сроки производства',
  'Сопровождаем заказ от заявки до сдачи',
  'Организуем доставку и монтаж при необходимости',
  'Работаем с разовыми и серийными заказами',
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
  const heroMedia = (
    <HeroMediaPanel className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 p-0 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative aspect-[5/4] min-h-[320px] overflow-hidden rounded-3xl">
        <ProtectedImage
          src={heroImageSrc}
          alt={heroImageAlt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 45vw, 100vw"
          priority
        />
      </div>
    </HeroMediaPanel>
  );

  return (
    <div>
      <Section className="pb-8 pt-8 md:pb-10 md:pt-10" background="default" id="stands-hero">
        <PageHero className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900/80 lg:hidden">
          <HeroEyebrow>Изготовление стендов</HeroEyebrow>
          <HeroTitle className="hero-title-mobile-safe max-w-2xl lg:text-5xl">Изготовление информационных стендов</HeroTitle>
          <HeroLead>
            Делаем стенды для навигации, инструкций и обязательной информации. В результате вы получаете готовую к установке конструкцию
            с понятной подачей материалов и удобным обновлением листов.
          </HeroLead>

          <HeroChipList className="mt-5 max-w-xl gap-2.5">
            {heroChips.map((chip) => (
              <HeroChip key={chip} className="chip-elevated gap-2 px-3 py-1.5 text-xs">
                <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
                <span>{chip}</span>
              </HeroChip>
            ))}
          </HeroChipList>

          <HeroActions className="mt-7">
            <Link href="#stands-lead-form" data-floating-cta-hide className="btn-primary no-underline">
              Рассчитать стоимость
            </Link>
            <Link href="#stands-catalog" className="btn-secondary no-underline">
              Смотреть варианты
            </Link>
          </HeroActions>
        </PageHero>

        <div className="mt-4 lg:hidden">
          <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_18px_44px_-28px_rgba(15,23,42,0.42)] dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:shadow-[0_20px_44px_-28px_rgba(0,0,0,0.72)]">
            {heroMedia}
          </div>
        </div>

        <PageHero
          className="hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900/80 lg:block"
          media={heroMedia}
        >
          <HeroEyebrow>Изготовление стендов</HeroEyebrow>
          <HeroTitle className="max-w-2xl text-3xl tracking-tight md:text-5xl">Изготовление информационных стендов</HeroTitle>
          <HeroLead>
            Делаем стенды для навигации, инструкций и обязательной информации. В результате вы получаете готовую к установке конструкцию
            с понятной подачей материалов и удобным обновлением листов.
          </HeroLead>

          <HeroChipList className="mt-5 max-w-xl gap-2.5">
            {heroChips.map((chip) => (
              <HeroChip key={chip} className="chip-elevated gap-2 px-3 py-1.5 text-xs">
                <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
                <span>{chip}</span>
              </HeroChip>
            ))}
          </HeroChipList>

          <HeroActions className="mt-7">
            <Link href="#stands-lead-form" data-floating-cta-hide className="btn-primary no-underline">
              Рассчитать стоимость
            </Link>
            <Link href="#stands-catalog" className="btn-secondary no-underline">
              Смотреть варианты
            </Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section id="stands-catalog" background="muted" fullBleed className="border-y border-neutral-200/70 py-12 dark:border-neutral-800/80 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Стенды для помещений</h2>
          <p className="t-body max-w-3xl">Решения для внутренних зон: офисов, учебных и производственных помещений.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="space-y-3">
          <h2 className="t-h2">Уличные стенды</h2>
          <p className="t-body max-w-3xl">Конструкции для фасадов и открытых площадок с учётом уличной эксплуатации.</p>
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

      <Section background="muted" fullBleed className="border-y border-neutral-200/70 py-12 dark:border-neutral-800/80 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Как изготавливаем стенды</h2>
          <p className="t-body max-w-3xl">Подбираем основу, крепления и информационные элементы под место установки и формат обновления контента.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((item) => (
            <RevealOnScroll key={item.title} className="h-full">
              <article className="group h-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] dark:border-neutral-800 dark:bg-neutral-900/85 dark:shadow-[0_12px_30px_-24px_rgba(0,0,0,0.75)] dark:hover:border-neutral-700 dark:hover:shadow-[0_18px_36px_-24px_rgba(220,38,38,0.35)]">
                <span className="public-icon-badge-sm">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-semibold dark:text-neutral-100">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{item.description}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Где устанавливают такие стенды</h2>
          <p className="t-body max-w-3xl">Типовые площадки, где важна регулярная и наглядная подача информации.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => (
            <article key={item} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-[0_10px_28px_-24px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {item.includes('Школ') || item.includes('сады') ? <School className="size-4" aria-hidden="true" /> : <Building2 className="size-4" aria-hidden="true" />}
                </span>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{item}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section background="muted" fullBleed className="border-y border-neutral-200/70 py-12 dark:border-neutral-800/80 md:py-16">
        <div className="space-y-3">
          <h2 className="t-h2">Почему заказывают у нас</h2>
          <p className="t-body max-w-3xl">Фокус на предсказуемом процессе: понятные условия, аккуратное исполнение и сопровождение на каждом этапе.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((item, index) => (
            <RevealOnScroll key={item} className={getRevealDelayClass(index)}>
              <article className="group flex h-full min-h-[88px] items-center rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] dark:border-neutral-800 dark:bg-neutral-900/85 dark:shadow-[0_12px_30px_-24px_rgba(0,0,0,0.75)] dark:hover:border-neutral-700 dark:hover:shadow-[0_18px_36px_-24px_rgba(220,38,38,0.35)]">
                <div className="flex items-center gap-3">
                  <span className="public-icon-badge-sm shrink-0">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-neutral-800 dark:text-neutral-100">{item}</p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      <Section id="stands-lead-form" background="muted" fullBleed className="pt-0">
        <div data-floating-cta-hide className="card rounded-2xl border border-neutral-200/80 bg-white p-6 dark:border-neutral-800 dark:bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-900/80 dark:shadow-[0_16px_36px_-26px_rgba(0,0,0,0.8)] md:p-8">
          <h2 className="text-2xl font-bold dark:text-neutral-100">Рассчитать стоимость стенда</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">
            Укажите тип стенда, размеры, место установки и желаемую комплектацию. После заявки уточним детали и отправим расчёт с вариантами исполнения.
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
