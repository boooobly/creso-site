import Link from 'next/link';
import { Building2, CheckCircle2, ClipboardList, PackageCheck, Ruler, School, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import Section from '@/components/Section';
import StandPreviewCard from '@/components/services/StandPreviewCard';
import { messages } from '@/lib/messages';

const heroChips = ['Собственное производство', 'Карманы и сменные блоки', 'Изготовление по размерам', 'Доставка и монтаж'] as const;

const indoorStands = [
  { title: 'Стенд «Информация»', description: 'Универсальное решение для объявлений и инструкций.', previewTag: 'Интерьер', previewHint: 'Типовая компоновка с карманами А4 и шапкой.' },
  { title: 'Уголок потребителя', description: 'Для торговых точек, салонов и офисов.', previewTag: 'Ритейл', previewHint: 'Блоки с документами, реквизитами и правилами.' },
  { title: 'Пожарные стенды', description: 'Схемы, регламенты и инструкции по безопасности.', previewTag: 'Безопасность', previewHint: 'Схема эвакуации и обязательные памятки.' },
  { title: 'Охрана труда', description: 'Наглядные материалы для производственных зон.', previewTag: 'Производство', previewHint: 'Нормативы, инструкции и чек-листы для персонала.' },
  { title: 'Первая помощь', description: 'Памятки и алгоритмы действий в экстренных случаях.', previewTag: 'Медицина', previewHint: 'Алгоритмы оказания помощи и контактные номера.' },
  { title: 'Гражданская оборона и ЧС', description: 'Информационные блоки для обучения персонала.', previewTag: 'ГО и ЧС', previewHint: 'Порядок действий при внештатных ситуациях.' },
] as const;

const outdoorStands = [
  { title: 'Уличные информационные стенды', description: 'Антивандальные решения с защитой от погоды.', previewTag: 'Outdoor', previewHint: 'Усиленная рама и защищённая зона размещения листов.' },
  { title: 'Стенды «Наше Подмосковье»', description: 'Оформление в фирменных требованиях муниципалитетов.', previewTag: 'Муниципальный', previewHint: 'Формат с бренд-зоной и нормативной структурой.' },
  { title: 'На детские площадки', description: 'Яркие и безопасные конструкции для дворов и парков.', previewTag: 'Дворовая среда', previewHint: 'Визуально читаемый стенд для жителей и родителей.' },
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

export default function StandsServicePage() {
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
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-neutral-200 bg-white/80">
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-700">Зона под визуал стенда</p>
                  <p className="mt-1 text-xs text-neutral-500">Здесь можно подключить фото или mockup в следующем этапе.</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-neutral-500">Подготовили аккуратный placeholder для будущих превью и рендеров.</p>
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
              previewTag={item.previewTag}
              previewHint={item.previewHint}
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
              previewTag={item.previewTag}
              previewHint={item.previewHint}
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
            <article key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
            </article>
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
          {advantages.map((item) => (
            <article key={item} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold leading-relaxed text-neutral-800">{item}</p>
              </div>
            </article>
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
