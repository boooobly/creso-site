import Section from '@/components/Section';
import Link from 'next/link';
import Image from 'next/image';
import MugPrintAreaCalibrator from '@/components/mug-designer/MugPrintAreaCalibrator';
import OrderMugsForm from '@/components/OrderMugsForm';

const anchorLinks = [
  { href: '#mugs-description', label: 'Описание' },
  { href: '#mugs-prices', label: 'Цены' },
  { href: '#mugs-designer', label: 'Конструктор' },
  { href: '#mugs-request', label: 'Заявка' },
  { href: '#mugs-faq', label: 'Вопросы' },
];

const faqItems = [
  {
    question: 'Сколько занимает изготовление?',
    answer: 'Обычно 3–5 рабочих дней. Срочно - по согласованию.',
  },
  {
    question: 'Можно ли напечатать по кругу?',
    answer: 'Да, печать по кругу. Зона зависит от макета и ручки кружки.',
  },
  {
    question: 'Что если мой макет не подходит?',
    answer: 'Мы проверим и подскажем, что исправить, перед запуском в печать.',
  },
];

export default function MugsServicePage() {
  const heroBenefits = ['3–5 рабочих дней', '3 макета включены', 'Скидка от 10 шт', 'Проверка перед печатью'];

  return (
    <div className="space-y-10 sm:space-y-12 lg:space-y-14">
      <Section className="pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Студийный уровень печати</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Печать на кружках</h1>
              <p className="mt-4 text-base text-neutral-600 sm:text-lg">Белые керамические кружки 330 мл. Класс AAA. Печать по кругу.</p>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-700">
                {heroBenefits.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="text-red-600">✓</span>
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#mugs-designer" className="rounded-md bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700">
                  Собрать макет
                </Link>
                <Link href="/portfolio" className="rounded-md border border-neutral-200 bg-white px-5 py-3 text-sm font-medium transition hover:bg-neutral-50">
                  Смотреть примеры
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
              <div className="mx-auto flex justify-center">
                <Image src="/images/mug/mug-base.png" alt="Белая кружка с зоной печати" width={320} height={320} className="h-auto w-full max-w-[320px] shadow-md" priority />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-2">
            {anchorLinks.map((link) => (
              <a key={link.href} href={link.href} className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </Section>

      <Section id="mugs-description" className="pt-0 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">Печатаем на белых керамических кружках 330 мл. Макет проверяем перед запуском, чтобы не было сюрпризов по цвету и обрезке.</p>
          </div>
        </div>
      </Section>

      <Section id="mugs-prices" className="pt-0 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Цены и условия</h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">Прозрачно и без скрытых пунктов.</p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Стоимость</h3>
              <p className="mt-4 text-4xl font-semibold">450 ₽</p>
              <p className="text-sm text-neutral-500">за 1 шт, печать по кругу</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>• Кружка белая</li>
                <li>• Глянец или мат</li>
                <li>• Макет проверим перед запуском</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Сроки и скидки</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>• Изготовление: 3–5 рабочих дней</li>
                <li>• От 10 шт — скидка 10%</li>
                <li>• 3 макета входят в стоимость</li>
                <li>• Срочная печать по согласованию</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section id="mugs-designer" className="pt-0 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Конструктор</h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">Соберите макет прямо на сайте - или прикрепите файл, если уже готов.</p>

          <div className="mt-6">
            <OrderMugsForm />
          </div>
          <p className="mt-3 text-xs text-neutral-500">Мы проверим макет перед печатью и напишем, если нужно что-то поправить.</p>
        </div>
      </Section>

      <Section id="mugs-request" className="pt-0 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Заявка</h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">Оставьте контакты - ответим в течение 30 минут в рабочее время.</p>
          <p className="mt-2 text-xs text-neutral-500">Форма заявки расположена в блоке конструктора выше на этой странице.</p>
        </div>
      </Section>

      <Section id="mugs-faq" className="pt-0 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Вопросы</h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">Коротко о сроках, печати и подготовке макета.</p>

          <div className="mt-6 space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer text-sm font-medium text-neutral-900">{item.question}</summary>
                <p className="mt-2 text-sm text-neutral-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {process.env.NODE_ENV !== 'production' && (
        <Section className="pt-0 pb-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <details className="card p-4 md:p-6">
              <summary className="cursor-pointer text-sm font-semibold text-neutral-700">Print area calibrator</summary>
              <div className="mt-4">
                <MugPrintAreaCalibrator />
              </div>
            </details>
          </div>
        </Section>
      )}
    </div>
  );
}
