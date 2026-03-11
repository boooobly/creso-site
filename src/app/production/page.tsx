import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import Section from '@/components/layout/Section';

const capabilityBadges = ['Фрезерный станок 2×4 м', 'Печать до 3.2 м', 'Плоттерная резка', 'Багетная мастерская'] as const;

const equipment = [
  {
    title: 'Фрезерный станок',
    text: 'Рабочее поле 2×4 м. Обработка ПВХ, композита и пластика.',
    tag: 'Поле 2×4 м',
  },
  {
    title: 'Широкоформатный принтер',
    text: 'Экосольвентная печать для баннеров, пленки и холста.',
    tag: 'Печать до 3.2 м',
  },
  {
    title: 'Плоттерная резка',
    text: 'Контурная резка пленок, аппликаций и наклеек.',
    tag: 'Точная резка',
  },
  {
    title: 'Багетная мастерская',
    text: 'Изготовление рам и оформление работ под заказ.',
    tag: 'Оформление и сборка',
  },
] as const;

const products = [
  {
    title: 'Вывески и объемные буквы',
    text: 'Фасадные рекламные конструкции любой сложности.',
  },
  {
    title: 'Световые короба',
    text: 'Классические и нестандартные лайтбоксы.',
  },
  {
    title: 'Баннеры и широкоформатная печать',
    text: 'Печать для фасадов, стендов и рекламных конструкций.',
  },
  {
    title: 'Стелы и конструкции',
    text: 'Изготовление рекламных стел и пилонов.',
  },
  {
    title: 'Оформление картин и багет',
    text: 'Изготовление рам и оформление работ.',
  },
  {
    title: 'Индивидуальные проекты',
    text: 'Нестандартные рекламные конструкции под задачу клиента.',
  },
] as const;

const gallery = [
  {
    src: '/images/outdoor_advertising/manufacturing.png',
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
  { title: 'Замер', text: 'Выезд на объект и точные размеры.' },
  { title: 'Проектирование', text: 'Подготовка макета и технического решения.' },
  { title: 'Производство', text: 'Изготовление конструкции в цеху.' },
  { title: 'Монтаж', text: 'Установка и подключение рекламы.' },
] as const;

const trustPoints = [
  { title: 'Собственный цех', text: 'Контролируем сроки и качество без посредников.' },
  { title: 'Работаем по договору', text: 'Фиксируем условия, этапы и стоимость.' },
  { title: 'Согласуем макет', text: 'Утверждаем решение до запуска в работу.' },
  { title: 'Гарантия на изделия', text: 'Сопровождаем проект и после монтажа.' },
] as const;

export default function ProductionPage() {
  return (
    <div>
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-700">
              СОБСТВЕННОЕ ПРОИЗВОДСТВО
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-[1.1] md:text-5xl">Собственное производство рекламы</h1>
            <p className="max-w-2xl text-base leading-relaxed text-neutral-700 md:text-lg md:leading-relaxed">
              Фрезеровка, печать, сборка и монтаж рекламных конструкций в собственном цеху. Без посредников, с
              контролем качества на каждом этапе.
            </p>

            <div className="flex flex-wrap gap-3 md:gap-3.5">
              {capabilityBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex h-11 items-center rounded-full border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-800 shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link href="/contacts" className="btn-primary inline-flex no-underline">
                Обсудить проект
              </Link>
              <a
                href="#production-gallery"
                className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"
              >
                Смотреть производство
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 p-1.5 shadow-[0_18px_38px_rgba(17,24,39,0.12)]">
            <div className="relative aspect-[6/5] w-full">
              <Image
                src="/images/outdoor_advertising/manufacturing.png"
                alt="Собственное производство рекламы"
                fill
                className="rounded-[1.35rem] object-cover"
                priority
              />
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
                <article className="flex min-h-[248px] flex-col rounded-2xl border border-neutral-200 bg-white p-8 md:p-9 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
                  <h3 className="text-xl font-semibold leading-tight text-neutral-900 md:text-2xl">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700 md:text-base">{item.text}</p>
                  <span className="mt-7 inline-flex self-start rounded-full border border-neutral-300 bg-neutral-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-700">
                    {item.tag}
                  </span>
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
            {products.map((item) => (
              <article
                key={item.title}
                className="flex min-h-[188px] flex-col rounded-2xl border border-neutral-200 bg-white p-6 md:p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold leading-snug text-neutral-900">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-neutral-700 md:text-base">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="production-gallery" className="pt-0">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold md:text-3xl">Производство в работе</h2>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {gallery.slice(0, 2).map((item) => (
                <div
                  key={item.src}
                  className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 ${item.className}`}
                >
                  <Image src={item.src} alt={item.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm font-medium text-white">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 ${gallery[2].className}`}>
              <Image
                src={gallery[2].src}
                alt={gallery[2].alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-sm font-medium text-white">{gallery[2].caption}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {gallery.slice(3).map((item) => (
                <div
                  key={item.src}
                  className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 ${item.className}`}
                >
                  <Image src={item.src} alt={item.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm font-medium text-white">{item.caption}</p>
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
          <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute left-12 right-12 top-10 hidden h-px bg-neutral-200 lg:block" />
            {workSteps.map((step, index) => (
              <div key={step.title} className="relative flex min-h-[232px] flex-col rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
                <span className="relative z-10 mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-base font-semibold text-white shadow-sm ring-4 ring-white">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700 md:text-base">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50/80 p-6 md:p-9">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold md:text-3xl">Почему нам доверяют производство</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustPoints.map((item) => (
                <article key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-0">
        <div className="card flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:gap-10 md:p-9">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold md:text-3xl">Готовы обсудить задачу?</h2>
            <p className="max-w-2xl text-neutral-700 md:text-lg">
              Подскажем по материалам, подготовим расчет и предложим оптимальное решение под ваш проект.
            </p>
          </div>
          <Link href="/contacts" className="btn-primary inline-flex w-fit shrink-0 no-underline">
            Получить расчет
          </Link>
        </div>
      </Section>
    </div>
  );
}
