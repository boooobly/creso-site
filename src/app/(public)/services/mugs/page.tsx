import Image from 'next/image';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CupSoda,
  LayoutTemplate,
  PackageCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import Section from '@/components/Section';
import OrderMugsForm from '@/components/OrderMugsForm';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import { getSiteImages } from '@/lib/site-images';

const quickBenefits = [
  {
    title: 'Печать по кругу',
    description: 'Полноценный wrap на белых кружках 330 мл с аккуратной посадкой по ручке.',
    icon: CupSoda,
  },
  {
    title: 'Керамика AAA',
    description: 'Используем белые кружки 330 мл для стабильной цветопередачи и аккуратного результата.',
    icon: Sparkles,
  },
  {
    title: 'Проверка макета',
    description: 'До запуска в печать проверяем файл, даём рекомендации и согласуем финальную версию.',
    icon: LayoutTemplate,
  },
  {
    title: 'Скидки за тираж',
    description: 'Чем больше партия, тем выгоднее стоимость. Суммарная скидка до 20%.',
    icon: Tag,
  },
];

const pricingCards = [
  {
    title: 'Базовая стоимость',
    price: '450 ₽ / шт',
    caption: 'Белая кружка 330 мл, полноцветная печать по кругу',
    bullets: ['Белая керамика AAA', 'Покрытие: глянец или мат', 'Подходит для брендированных тиражей'],
    icon: BadgeCheck,
  },
  {
    title: 'Сроки производства',
    price: '3–5 рабочих дней',
    caption: 'Стандартный срок изготовления после согласования макета',
    bullets: ['Срочное изготовление — по согласованию', 'Подтверждаем дедлайн перед запуском', 'Отправляем в работу сразу после утверждения'],
    icon: Clock3,
  },
  {
    title: 'Что включено',
    price: 'Без доплат',
    caption: 'В стандартный пакет уже включены подготовительные этапы',
    bullets: ['2 варианта макета входят в стоимость', '2 правки 1-й категории включены', 'Проверка перед печатью и согласование'],
    icon: PackageCheck,
  },
];

const resultCards = [
  {
    title: 'Для корпоративных подарков',
    description: 'Логотип, фирменные цвета, выдержанная подача — кружка выглядит как брендированный продукт, а не сувенир “на скорую руку”.',
  },
  {
    title: 'Для розницы и маркетплейсов',
    description: 'Собираем стабильный повторяемый тираж с аккуратной печатью и понятной себестоимостью под продажи.',
  },
  {
    title: 'Для мероприятий и промо',
    description: 'Делаем партии под акции, внутренние события и презентации — с понятными сроками и прозрачными условиями.',
  },
];

const faqItems = [
  {
    question: 'Сколько занимает изготовление?',
    answer: 'Обычно 3–5 рабочих дней. Срочный запуск возможен по согласованию загрузки производства.',
  },
  {
    question: 'Можно ли напечатать по кругу?',
    answer: 'Да, выполняем круговую печать. Полезная зона зависит от макета и расположения ручки кружки.',
  },
  {
    question: 'Что если макет не подходит?',
    answer: 'Перед печатью мы проверяем макет и подсказываем, что исправить, чтобы избежать брака и потери качества.',
  },
  {
    question: 'Можно ли согласовать превью перед тиражом?',
    answer: 'Да. Перед запуском подтверждаем финальный макет и только после согласования отправляем заказ в печать.',
  },
  {
    question: 'Насколько стойкая печать в использовании?',
    answer: 'При бережном уходе печать сохраняет вид долго. Рекомендуем избегать абразивов и очень агрессивной химии.',
  },
  {
    question: 'Можно заказать небольшой тираж?',
    answer: 'Да, изготавливаем как малые партии, так и объёмные корпоративные тиражи со скидкой.',
  },
];

export default async function MugsServicePage() {
  const mugImages = await getSiteImages(['mugs.hero.main', 'mugs.result.main']);
  const heroImage = mugImages['mugs.hero.main'];
  const resultImage = mugImages['mugs.result.main'];
  const heroImageSrc = heroImage?.url ?? '/images/mug/mug-hero.jpg';
  const heroImageAlt = heroImage?.altText || 'Печать на кружках — пример готовой работы';
  const resultImageSrc = resultImage?.url ?? '/images/mug/mug_eurochem.png';
  const resultImageAlt = resultImage?.altText || 'Печать на кружках — пример корпоративного тиража';
  const glassOverlayClassName =
    'absolute bottom-4 left-4 right-4 rounded-2xl border border-white/35 bg-black/34 p-4 shadow-[0_14px_34px_-24px_rgba(2,6,23,0.9)] backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 sm:p-5';

  return (
    <div>
      <Section className="pb-5 pt-8 sm:pt-10 lg:pb-6 lg:pt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <PageHero
            className="p-6 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10"
            mediaClassName="h-full"
            media={
              <HeroMediaPanel className="min-h-[320px] rounded-2xl border-neutral-200 bg-neutral-100/70 p-0 lg:min-h-full">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                <div className={glassOverlayClassName}>
                  <p className="text-sm font-semibold text-white">Готовый результат: аккуратная полноцветная печать</p>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">Белая керамика, объём 330 мл, круговая зона печати.</p>
                </div>
              </HeroMediaPanel>
            }
          >
            <HeroEyebrow>Печать на кружках</HeroEyebrow>
            <HeroTitle className="max-w-[20ch] text-4xl tracking-tight sm:text-5xl">Брендированные кружки с печатью по кругу</HeroTitle>
            <HeroLead className="mt-4 max-w-[52ch] text-sm leading-relaxed sm:text-base">
              Изготавливаем кружки на белой керамике 330 мл: от единичных экземпляров до тиражей для компаний и мероприятий. Проверяем макет перед запуском и согласуем результат заранее.
            </HeroLead>

            <HeroChipList className="mt-6 gap-2.5">
              {['Стандартный срок: 3–5 рабочих дней', '2 варианта макета включены', 'Финал согласуем до запуска', 'Прозрачная цена без скрытых пунктов'].map((item) => (
                <HeroChip key={item} className="min-h-11 gap-2 rounded-xl px-3 py-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                  <span>{item}</span>
                </HeroChip>
              ))}
            </HeroChipList>

            <HeroActions className="mt-8">
              <a href="#mugs-order" className="btn-primary no-underline">
                Оставить заявку
              </a>
              <a href="#mugs-prices" className="btn-secondary no-underline">
                Цены и условия
              </a>
            </HeroActions>
          </PageHero>
        </div>
      </Section>

      <Section className="pb-2 pt-0 sm:pb-3">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="h-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 className="mt-3 text-base font-semibold text-neutral-900">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </Section>

      <Section id="mugs-prices" className="pb-8 pt-4 sm:pb-10 sm:pt-5 lg:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="t-eyebrow">Цены и условия</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Понятная стоимость и прозрачный процесс</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">Стоимость формируется без скрытых пунктов: вы заранее понимаете цену, сроки и что именно входит в заказ.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {pricingCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="premium-card h-full p-5 sm:p-6">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">{item.price}</p>
                  <p className="mt-1 text-sm text-neutral-600">{item.caption}</p>
                  <ul className="mt-4 space-y-2.5 text-sm text-neutral-700">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/60 p-4 text-sm text-neutral-700 sm:p-5">
            <span className="font-semibold text-neutral-900">Скидки за объём:</span> каждые 12 шт — минус 2,5%, максимальная суммарная скидка — 20%.
          </div>
        </div>
      </Section>

      <Section className="py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="t-eyebrow">Что вы получаете</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Кружка как готовый коммерческий продукт</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                Мы делаем не просто “нанесение на сувенир”, а готовое изделие для продаж, подарков и бренд-коммуникации. Важно, чтобы тираж выглядел единообразно и профессионально.
              </p>
              <div className="mt-6 grid gap-3">
                {resultCards.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                    <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-neutral-200 shadow-sm">
              <div className="relative h-full min-h-[420px] w-full sm:min-h-[520px] lg:min-h-[560px]">
                <Image
                  src={resultImageSrc}
                  alt={resultImageAlt}
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/5" />
                <div className={glassOverlayClassName}>
                  <p className="text-sm font-semibold text-white">Премиальная подача результата</p>
                  <p className="mt-1 text-xs text-white/80">Чистая белая керамика, чёткая печать и стабильный вид во всём тираже.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="mugs-order" className="pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:mb-6 sm:pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="t-eyebrow">Оформление заказа</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">Отправьте заявку за 1 минуту</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">Заполните форму, приложите файл (если есть) и укажите детали тиража. Менеджер свяжется с вами, уточнит нюансы и подтвердит стоимость перед запуском.</p>
              </div>
              <ul className="grid gap-2 text-sm text-neutral-700 lg:min-w-[340px]">
                {[
                  'Проверяем макет и предупреждаем о рисках по качеству',
                  'Согласовываем срок и итоговую стоимость до старта',
                  'Помогаем с подготовкой дизайна при необходимости',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-red-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <OrderMugsForm />
          </div>
        </div>
      </Section>

      <Section id="mugs-faq" className="pb-12 pt-0 lg:pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Частые вопросы</h2>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">Коротко о сроках, макетах и процессе печати.</p>

            <div className="mt-5 space-y-3">
              {faqItems.map((item) => (
                <details key={item.question} className="group rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 transition hover:border-neutral-300">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 pr-1 text-sm font-semibold text-neutral-900 marker:hidden">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500 transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
