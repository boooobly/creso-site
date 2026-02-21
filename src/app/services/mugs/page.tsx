import Section from '@/components/Section';
import OrderMugsForm from '@/components/OrderMugsForm';
import Link from 'next/link';

const complexityLevels = [
  { title: 'I', description: 'Простой текст, логотип или базовый макет без сложной обработки.' },
  { title: 'II', description: 'Комбинация текста и графики, умеренная подготовка и правки.' },
  { title: 'III', description: 'Сложный коллаж, много элементов, детальная допечатная подготовка.' },
];

const checklist = [
  'Нужна цветокоррекция/чистка исходника',
  'Несколько изображений в одном макете',
  'Сложная типографика или много текста',
  'Нестандартная композиция по кругу кружки',
  'Подготовка варианта для глянца и мата',
  'Замена фона/ретушь',
  'Подбор фирменных цветов по брендбуку',
  'Срочная подготовка макета',
];

export default function MugsServicePage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="overflow-hidden rounded-[20px] border border-neutral-200 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">СТУДИЙНЫЙ УРОВЕНЬ ПЕЧАТИ</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-neutral-900 md:text-5xl">Печать на кружках</h1>
              <p className="mt-4 max-w-xl text-sm text-neutral-600 md:text-lg">White ceramic mugs 330 ml, AAA quality, 3–5 working days.</p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {['AAA качество', '3–5 рабочих дней', '3 макета входят', 'Скидка от 10 шт'].map((item) => (
                  <span key={item} className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 md:text-sm">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#mugs-request" className="inline-flex items-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                  Оставить заявку
                </Link>
                <Link href="/portfolio" className="inline-flex items-center rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50">
                  Смотреть примеры
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-8 inset-y-10 rounded-full bg-gradient-to-br from-red-100 via-white to-neutral-100 blur-2xl" aria-hidden="true" />
              <div className="relative rounded-[20px] bg-white p-6 shadow-[0_28px_56px_-36px_rgba(15,23,42,0.4)] transition-transform duration-300 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0">
                <div className="mx-auto flex h-[290px] w-full max-w-[280px] items-center justify-center rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100">
                  <div className="relative h-44 w-36 rounded-b-[46px] rounded-t-[28px] border-4 border-neutral-300 bg-white shadow-inner">
                    <div className="absolute -right-10 top-12 h-16 w-12 rounded-r-full border-[9px] border-l-0 border-neutral-300" />
                    <div className="absolute inset-x-5 top-8 h-10 rounded-full bg-gradient-to-r from-red-50 via-red-100/70 to-red-50" />
                    <div className="absolute inset-x-8 bottom-6 h-1.5 rounded-full bg-neutral-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Стоимость и условия</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>• 450 ₽/шт (круговой перенос)</li>
            <li>• От 10 шт - скидка 10%</li>
            <li>• 3 макета входят в стоимость</li>
            <li>• Белая кружка. На выбор: глянец или мат</li>
          </ul>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card space-y-5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Дизайн</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">3 макета входит в стоимость.</p>

          <div>
            <h3 className="text-lg font-medium">Категории сложности I/II/III</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              {complexityLevels.map((level) => (
                <li key={level.title}><span className="font-semibold">{level.title}:</span> {level.description}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">Чек-лист (+1 за каждый пункт)</h3>
            <ul className="mt-3 grid gap-2 text-sm text-neutral-700 dark:text-neutral-300 md:grid-cols-2">
              {checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">Интерпретация: 0–2 → I, 3–5 → II, 6–8 → III.</p>
          </div>
        </div>
      </Section>

      <Section id="mugs-request" className="pt-0 pb-12">
        <OrderMugsForm />
      </Section>
    </div>
  );
}
