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
  'Вывески и объемные буквы',
  'Световые короба',
  'Баннеры и широкоформатная печать',
  'Стелы и конструкции',
  'Оформление картин и багет',
  'Индивидуальные проекты',
] as const;

const gallery = [
  {
    src: '/images/outdoor_advertising/manufacturing.png',
    alt: 'Производственный участок с оборудованием',
    className: 'aspect-[4/3]',
  },
  {
    src: '/images/outdoor_advertising/installation.png',
    alt: 'Сборка рекламной конструкции',
    className: 'aspect-[4/3]',
  },
  {
    src: '/images/outdoor_examples/lightbox.png',
    alt: 'Световой короб на этапе изготовления',
    className: 'aspect-[16/7] sm:aspect-[16/6]',
  },
  {
    src: '/images/outdoor_examples/dimensional_letters.png',
    alt: 'Производство объемных букв',
    className: 'aspect-[4/3]',
  },
  {
    src: '/images/outdoor_examples/stela.png',
    alt: 'Изготовление стелы',
    className: 'aspect-[4/3]',
  },
] as const;

const workSteps = [
  { title: 'Замер', text: 'Выезд на объект и точные размеры.' },
  { title: 'Проектирование', text: 'Подготовка макета и технического решения.' },
  { title: 'Производство', text: 'Изготовление конструкции.' },
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
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700">
              Собственное производство
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-4xl">Собственное производство рекламы</h1>
            <p className="max-w-2xl text-base leading-relaxed text-neutral-700 md:text-lg">
              Фрезеровка, печать, сборка и монтаж рекламных конструкций в собственном цеху. Работаем без посредников и
              контролируем качество на каждом этапе.
            </p>

            <div className="flex flex-wrap gap-3">
              {capabilityBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex h-11 items-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/contacts" className="btn-primary inline-flex no-underline">
                Обсудить проект
              </Link>
              <a
                href="#production-gallery"
                className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
              >
                Смотреть производство
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
            <div className="relative aspect-[5/4] w-full">
              <Image src="/images/outdoor_advertising/manufacturing.png" alt="Собственное производство рекламы" fill className="object-cover" priority />
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
                <article className="flex min-h-[210px] flex-col rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
                  <h3 className="text-xl font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700 md:text-base">{item.text}</p>
                  <span className="mt-auto inline-flex self-start rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => (
              <div key={item} className="rounded-2xl border border-neutral-200 bg-white p-5 text-base font-medium text-neutral-800 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="production-gallery" className="pt-0">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold md:text-3xl">Производство в работе</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.slice(0, 2).map((item) => (
                <div key={item.src} className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 ${item.className}`}>
                  <Image src={item.src} alt={item.alt} fill className="object-cover" />
                </div>
              ))}
            </div>

            <div className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 ${gallery[2].className}`}>
              <Image src={gallery[2].src} alt={gallery[2].alt} fill className="object-cover" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.slice(3).map((item) => (
                <div key={item.src} className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 ${item.className}`}>
                  <Image src={item.src} alt={item.alt} fill className="object-cover" />
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
            {workSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50/80 p-6 md:p-8">
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold md:text-3xl">Почему нам доверяют производство</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustPoints.map((item) => (
                <article key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-0">
        <div className="card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Готовы обсудить задачу?</h2>
            <p className="max-w-2xl text-neutral-700">Подскажем по материалам, подготовим расчет и предложим оптимальное решение под ваш проект.</p>
          </div>
          <Link href="/contacts" className="btn-primary inline-flex no-underline">
            Получить расчет
          </Link>
        </div>
      </Section>
    </div>
  );
}
