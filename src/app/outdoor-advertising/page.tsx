import Image from 'next/image';
import Link from 'next/link';
import Section from '@/components/Section';
import OutdoorLeadForm from '@/components/OutdoorLeadForm';

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

const portfolioImages = [1, 2, 3, 4, 5, 6].map((index) => ({
  src: `/images/outdoor-portfolio/placeholder-${index}.svg`,
  alt: `Пример наружной рекламы ${index}`,
}));

export default function OutdoorAdvertisingPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card space-y-5 p-6 md:p-10">
          <h1 className="text-3xl font-bold md:text-5xl">Наружная реклама под ключ в Ставропольском крае</h1>
          <p className="max-w-3xl text-lg text-neutral-700 dark:text-neutral-300">
            Проектирование, производство и монтаж конструкций любой сложности.
          </p>
          <Link href="#outdoor-lead-form" className="btn-primary no-underline">
            Получить бесплатный расчёт
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="mb-5 text-2xl font-bold">Что изготавливаем</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article key={service} className="card rounded-xl p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
              <p className="font-medium">{service}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="mb-5 text-2xl font-bold">Почему выбирают нас</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {strengths.map((item) => (
            <div key={item} className="card rounded-xl p-5">
              <p className="text-sm font-medium leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
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
      </Section>

      <Section className="pt-0">
        <h2 className="mb-5 text-2xl font-bold">Портфолио</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioImages.map((image) => (
            <figure key={image.src} className="card overflow-hidden">
              <Image src={image.src} alt={image.alt} width={900} height={600} className="h-52 w-full object-cover" />
            </figure>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-2xl bg-neutral-900 px-6 py-8 text-white dark:bg-neutral-800 md:px-8">
          <h2 className="text-3xl font-bold">Нужна срочная установка?</h2>
          <p className="mt-3 text-neutral-200">Изготавливаем и монтируем конструкции в сжатые сроки.</p>
          <Link href="#outdoor-lead-form" className="btn-primary mt-5 no-underline">
            Получить расчёт
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Получить бесплатный расчёт наружной рекламы</h2>
          <OutdoorLeadForm />
        </div>
      </Section>
    </div>
  );
}
