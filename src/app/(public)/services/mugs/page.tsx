import Section from '@/components/Section';
import Image from 'next/image';
import MugPrintAreaCalibrator from '@/components/mug-designer/MugPrintAreaCalibrator';
import OrderMugsForm from '@/components/OrderMugsForm';
import { getSiteImage } from '@/lib/site-images';

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

export default async function MugsServicePage() {
  const heroImage = await getSiteImage('mugs.hero.main');
  const heroImageSrc = heroImage?.url ?? '/images/mug/mug-hero.jpg';
  const heroImageAlt = heroImage?.altText || 'Печать на кружках — пример готовой работы';
  const heroBenefits = ['3–5 рабочих дней', '2 макета включены', 'Скидка до 20%', 'Проверка перед печатью'];

  return (
    <div>
      <Section className="bg-gradient-to-br from-white via-neutral-50 to-neutral-100 pb-6 pt-8 sm:pb-8 sm:pt-10 lg:pb-10 lg:pt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 px-8 py-10 shadow-sm lg:px-12 lg:py-12">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">СТУДИЙНЫЙ УРОВЕНЬ ПЕЧАТИ</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight lg:text-5xl">Печать на кружках</h1>
                <p className="mt-4 max-w-[42ch] leading-relaxed text-neutral-600">Белые керамические кружки 330 мл. Класс AAA. Печать по кругу.</p>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
                  {heroBenefits.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <span className="text-red-600">✓</span>
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#mugs-designer" className="inline-flex h-12 items-center rounded-xl bg-red-600 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-red-700">
                    Оставить заявку
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 -z-10 rounded-[32px] bg-red-500/10 blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={heroImageSrc}
                      alt={heroImageAlt}
                      fill
                      sizes="(min-width: 1024px) 520px, 90vw"
                      className="object-cover object-[55%_50%]"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                  </div>
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Пример готовой кружки</p>
                      <p className="text-xs text-neutral-500">Печать по кругу, белая керамика 330 мл</p>
                    </div>
                    <div className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
                      450 ₽ / шт
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="mugs-description" className="py-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">Печатаем на белых керамических кружках 330 мл. Макет проверяем перед запуском, чтобы не было сюрпризов по цвету и обрезке.</p>
          </div>
        </div>
      </Section>

      <Section id="mugs-prices" className="pb-8 pt-8 sm:py-10 lg:py-12">
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
                <li>• Скидка: каждые 12 шт — 2,5%, максимум 20%</li>
                <li>• 2 макета входят в стоимость</li>
                <li>• 2 правки 1-й категории включены</li>
                <li>• Срочная печать по согласованию</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section id="mugs-designer" className="pb-8 pt-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Оформление заказа</h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">Прикрепите готовый файл макета или опишите задачу — мы подготовим всё к печати.</p>

          <div className="mt-6">
            <OrderMugsForm />
          </div>
          <p className="mt-3 text-xs text-neutral-500">Мы проверим макет перед печатью и напишем, если нужно что-то поправить.</p>
        </div>
      </Section>

      <Section id="mugs-faq" className="pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12">
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
