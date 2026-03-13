import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import Section from '@/components/layout/Section';
import { ClipboardCheck, Cog, Factory, FileText, Frame, Lightbulb, PanelsTopLeft, PencilRuler, Printer, Ruler, ShieldCheck, Sparkles, Type, Wrench } from 'lucide-react';

const capabilityBadges = ['Фрезерный станок 2×4 м', 'Печать до 3.2 м', 'Плоттерная резка', 'Багетная мастерская'] as const;

const equipment = [
  {
    title: 'Фрезерный станок',
    text: 'Рабочее поле 2×4 м. Обработка ПВХ, композита и пластика.',
    tag: 'Поле 2×4 м',
    image: '/images/production/milling.png',
  },
  {
    title: 'Широкоформатный принтер',
    text: 'Экосольвентная печать для баннеров, пленки и холста.',
    tag: 'Печать до 3.2 м',
    image: '/images/production/printer.png',
  },
  {
    title: 'Плоттерная резка',
    text: 'Контурная резка пленок, аппликаций и наклеек.',
    tag: 'Точная резка',
    image: '/images/production/plotter.png',
  },
  {
    title: 'Багетная мастерская',
    text: 'Изготовление рам и оформление работ под заказ.',
    tag: 'Оформление и сборка',
    image: '/images/production/bagget.png',
  },
] as const;

const products = [
  {
    title: 'Вывески и объемные буквы',
    text: 'Фасадные рекламные конструкции любой сложности.',
    icon: Type,
  },
  {
    title: 'Световые короба',
    text: 'Классические и нестандартные лайтбоксы.',
    icon: Lightbulb,
  },
  {
    title: 'Баннеры и широкоформатная печать',
    text: 'Печать для фасадов, стендов и рекламных конструкций.',
    icon: Printer,
  },
  {
    title: 'Стелы и конструкции',
    text: 'Изготовление рекламных стел и пилонов.',
    icon: PanelsTopLeft,
  },
  {
    title: 'Оформление картин и багет',
    text: 'Изготовление рам и оформление работ.',
    icon: Frame,
  },
  {
    title: 'Индивидуальные проекты',
    text: 'Нестандартные рекламные конструкции под задачу клиента.',
    icon: Sparkles,
  },
] as const;

const gallery = [
  {
    src: '/images/production/hero.png',
    alt: 'Производственный участок с оборудованием',
    caption: 'Производство и сборка',
    className: 'aspect-[4/3]',
  },
  {
    src: '/images/outdoor_advertising/installation.png',
    alt: 'Сборка рекламной конструкции',
    caption: 'Монтаж вывески',
    className: 'aspect-[4/3]',
  },
  {
    src: '/images/outdoor_examples/lightbox.png',
    alt: 'Световой короб на этапе изготовления',
    caption: 'Контражурная вывеска',
    className: 'aspect-[16/7] sm:aspect-[16/6]',
  },
  {
    src: '/images/outdoor_examples/dimensional_letters.png',
    alt: 'Производство объемных букв',
    caption: 'Объемные буквы',
    className: 'aspect-[4/3]',
  },
  {
    src: '/images/outdoor_examples/stela.png',
    alt: 'Изготовление стелы',
    caption: 'Стела',
    className: 'aspect-[4/3]',
  },
] as const;

const workSteps = [
  { title: 'Замер', text: 'Выезд на объект и точные размеры.', icon: Ruler },
  { title: 'Проектирование', text: 'Подготовка макета и технического решения.', icon: PencilRuler },
  { title: 'Производство', text: 'Изготовление конструкции в цеху.', icon: Cog },
  { title: 'Монтаж', text: 'Установка и подключение рекламы.', icon: Wrench },
] as const;

const trustPoints = [
  { title: 'Собственный цех', text: 'Контролируем сроки и качество без посредников.', icon: Factory },
  { title: 'Работаем по договору', text: 'Фиксируем условия, этапы и стоимость.', icon: FileText },
  { title: 'Согласуем макет', text: 'Утверждаем решение до запуска в работу.', icon: ClipboardCheck },
  { title: 'Гарантия на изделия', text: 'Сопровождаем проект и после монтажа.', icon: ShieldCheck },
] as const;

export default function ProductionPage() {
  return (
    <div>
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-[38.5rem] space-y-8 lg:pr-3">
            <p className="inline-flex rounded-full border border-red-200/80 bg-red-50/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
              СОБСТВЕННОЕ ПРОИЗВОДСТВО
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold leading-[1.08] md:text-5xl">Собственное производство рекламы</h1>
              <p className="max-w-[33rem] text-base leading-relaxed text-neutral-700 md:text-[1.05rem] md:leading-relaxed">
                Фрезеровка, печать, сборка и монтаж рекламных конструкций в собственном цеху. Без посредников, с
                контролем качества на каждом этапе.
              </p>
            </div>

            <div className="grid max-w-[34rem] grid-cols-1 gap-2.5 sm:grid-cols-2">
              {capabilityBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-[0_1px_2px_rgba(17,24,39,0.06)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/40 hover:text-neutral-900"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link href="/contacts" className="btn-primary inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold no-underline">
                Обсудить проект
              </Link>
              <a
                href="#production-gallery"
                className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 shadow-[0_4px_14px_rgba(17,24,39,0.06)] transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
              >
                Смотреть производство
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-neutral-200/90 bg-neutral-100 p-1.5 shadow-[0_20px_44px_rgba(17,24,39,0.12)]">
            <div className="relative aspect-[6/5] w-full overflow-hidden rounded-[1.45rem]">
              <Image src="/images/production/hero.png" alt="Собственное производство рекламы" fill className="object-cover" priority />
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/90 bg-white/95 px-4 py-3 backdrop-blur-lg shadow-[0_12px_30px_rgba(17,24,39,0.16)] md:bottom-5 md:left-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">Собственный цех</p>
              <p className="mt-1 text-sm font-bold text-neutral-950">Полный цикл производства</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold md:text-3xl">Наше оборудование</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {equipment.map((item) => (
              <RevealOnScroll key={item.title}>
                <article className="group relative isolate min-h-[248px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md">
                  <div className="absolute -inset-px overflow-hidden rounded-[inherit]">
                    <div className="relative h-full w-full rounded-[inherit]">
                      <Image src={item.image} alt={item.title} fill className="rounded-[inherit] object-cover" />
                    </div>
                  </div>
                  <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
                  <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-t from-black/80 via-black/45 to-black/15 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
                  <div className="absolute inset-x-4 bottom-4 z-10 space-y-3 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 md:inset-x-5 md:bottom-5">
                    <h3 className="text-xl font-semibold leading-tight text-white md:text-2xl">{item.title}</h3>
                    <p className="max-w-[36ch] text-sm leading-relaxed text-white/85 md:text-base">{item.text}</p>
                    <span className="inline-flex self-start rounded-full border border-white/35 bg-white/20 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-[2px]">
                      {item.tag}
                    </span>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold md:text-3xl">Что мы производим</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item, index) => {
              const Icon = item.icon;

              return (
                <RevealOnScroll key={item.title}>
                  <article
                    style={{ transitionDelay: `${index * 55}ms` }}
                    className="flex min-h-[204px] flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] md:p-7"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50/70 text-red-700">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold leading-snug text-neutral-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-700 md:text-base">{item.text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </Section>

      <Section id="production-gallery" className="pt-0">
        <div className="space-y-7">
          <h2 className="text-2xl font-semibold md:text-3xl">Производство в работе</h2>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {gallery.slice(0, 2).map((item) => (
                <div
                  key={item.src}
                  className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_6px_18px_rgba(17,24,39,0.06)] ${item.className}`}
                >
                  <Image src={item.src} alt={item.alt} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5">
                    <p className="text-sm font-semibold tracking-[0.01em] text-white">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_6px_18px_rgba(17,24,39,0.06)] ${gallery[2].className}`}>
              <Image
                src={gallery[2].src}
                alt={gallery[2].alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5">
                <p className="text-sm font-semibold tracking-[0.01em] text-white">{gallery[2].caption}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {gallery.slice(3).map((item) => (
                <div
                  key={item.src}
                  className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_6px_18px_rgba(17,24,39,0.06)] ${item.className}`}
                >
                  <Image src={item.src} alt={item.alt} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5">
                    <p className="text-sm font-semibold tracking-[0.01em] text-white">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold md:text-3xl">Как проходит работа</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <RevealOnScroll key={step.title}>
                  <article
                    style={{ transitionDelay: `${index * 70}ms` }}
                    className="flex min-h-[232px] flex-col rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)]"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50/70 text-red-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="mt-5 flex items-baseline gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Шаг {index + 1}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-neutral-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-700 md:text-base">{step.text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-6 md:p-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold md:text-3xl">Почему нам доверяют</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustPoints.map((item, index) => {
                const Icon = item.icon;

                return (
                  <RevealOnScroll key={item.title}>
                    <article
                      style={{ transitionDelay: `${index * 65}ms` }}
                      className={`flex min-h-[184px] flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] md:p-7 ${index === 0 ? 'border-neutral-300' : 'border-neutral-200'}`}
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50/70 text-red-700">
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold text-neutral-900">{item.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-700">{item.text}</p>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-0">
        <div className="card flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:gap-8 md:p-10">
          <div className="max-w-2xl space-y-3.5">
            <h2 className="text-2xl font-semibold leading-tight md:text-3xl">Готовы обсудить задачу?</h2>
            <p className="text-neutral-700 md:text-lg">
              Подскажем по материалам, подготовим расчет и предложим оптимальное решение под ваш проект.
            </p>
          </div>
          <Link href="/contacts" className="btn-primary inline-flex w-fit shrink-0 self-start no-underline md:self-center">
            Получить расчет
          </Link>
        </div>
      </Section>
    </div>
  );
}
