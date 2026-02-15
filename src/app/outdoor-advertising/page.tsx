import Image from 'next/image';
import Link from 'next/link';
import Section from '@/components/Section';
import OutdoorLeadForm from '@/components/OutdoorLeadForm';
import RevealOnScroll from '@/components/RevealOnScroll';
import OutdoorFloatingCtas from '@/components/OutdoorFloatingCtas';

const services = [
  'Световые короба',
  'Объёмные буквы',
  'Контражурные буквы',
  'Крышные установки',
  'Баннеры на фасад',
  'Лайтбоксы',
  'Гибкий неон',
  'Стелы',
  'Таблички',
  'Кастомные конструкции любой сложности',
];

const strengths = [
  'Собственная производственная база',
  'Монтажная бригада',
  'Автовышка',
  'Работа на высоте',
  'Доставка по краю',
  'Работаем с НДС',
  'Заключаем договор',
  'Гарантия 5 лет',
];

const steps = ['Заявка', 'Замер (бесплатно по городу)', 'Производство', 'Монтаж'];

const cities = ['Невинномысске', 'Ставрополе', 'Пятигорске', 'Минеральных Водах', 'Кисловодске', 'Ессентуках'];

const portfolioImages = [1, 2, 3, 4, 5, 6].map((index) => ({
  src: `/images/outdoor-portfolio/placeholder-${index}.svg`,
  alt: `Пример наружной рекламы ${index}`,
}));

export default function OutdoorAdvertisingPage() {
  return (
    <div className="pb-24 md:pb-0">
      <OutdoorFloatingCtas />

      <Section className="pb-8" id="outdoor-hero">
        <div className="card space-y-5 bg-gradient-to-b from-neutral-100 to-white p-6 dark:from-neutral-950 dark:to-neutral-900 md:p-10">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">Наружная реклама под ключ в Ставропольском крае</h1>
          <p className="max-w-3xl text-lg text-neutral-700 dark:text-neutral-300">
            Проектирование, производство и монтаж конструкций любой сложности.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#outdoor-lead-form"
              className="btn-primary no-underline ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
            >
              Получить бесплатный расчёт
            </Link>
            <Link href="#outdoor-portfolio" className="btn-secondary no-underline">
              Смотреть примеры работ
            </Link>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <RevealOnScroll>
          <h2 className="mb-5 text-2xl font-bold">Что изготавливаем</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service}
                className="card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10"
              >
                <p className="font-medium">{service}</p>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0">
        <RevealOnScroll>
          <h2 className="mb-5 text-2xl font-bold">Почему выбирают нас</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item) => (
              <div key={item} className="card rounded-xl p-5">
                <p className="text-sm font-medium leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0">
        <RevealOnScroll>
          <h2 className="mb-5 text-2xl font-bold">Как мы работаем</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="card rounded-xl p-5">
                <p className="mb-2 text-sm text-[var(--brand-red)]">Шаг {index + 1}</p>
                <p className="font-semibold">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
            Выезд в другие города — платный. <br />Возможен заказ по размерам клиента.
          </p>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" id="outdoor-portfolio">
        <RevealOnScroll>
          <h2 className="mb-5 text-2xl font-bold">Портфолио</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioImages.map((image) => (
              <figure key={image.src} className="card overflow-hidden">
                <Image src={image.src} alt={image.alt} width={900} height={600} className="h-52 w-full object-cover" />
              </figure>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0">
        <div className="rounded-2xl bg-neutral-900 px-6 py-8 text-white dark:bg-neutral-800 md:px-8">
          <h2 className="text-3xl font-bold">Нужна срочная установка?</h2>
          <p className="mt-3 text-neutral-200">Изготавливаем и монтируем конструкции в сжатые сроки.</p>
          <Link
            href="#outdoor-lead-form"
            className="btn-primary mt-5 no-underline ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
          >
            Получить расчёт
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card space-y-4 p-6 md:p-8">
          <h2 className="text-2xl font-bold">Работаем по всему Ставропольскому краю</h2>
          <p className="text-neutral-700 dark:text-neutral-300">Изготавливаем и монтируем наружную рекламу в:</p>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {cities.map((city) => (
              <li key={city} className="text-neutral-700 dark:text-neutral-300">
                • {city}
              </li>
            ))}
            <li className="text-neutral-700 dark:text-neutral-300">• и других городах региона</li>
          </ul>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Собственная бригада, выезд на замер и доставка конструкций позволяют запускать проекты быстро и в удобные сроки.
          </p>
        </div>
      </Section>

      <Section className="pt-0" id="outdoor-form-section">
        <RevealOnScroll>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Получить бесплатный расчёт наружной рекламы</h2>
            <OutdoorLeadForm />
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}
