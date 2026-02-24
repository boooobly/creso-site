import Link from 'next/link';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import BadgeChip from '@/components/home/BadgeChip';
import FeatureCard from '@/components/home/FeatureCard';
import KpiCard from '@/components/home/KpiCard';
import servicesLocal from '@/data/services.json';
import portfolioLocal from '@/data/portfolio.json';
import faqLocal from '@/data/faq.json';
import { getServices, getPortfolio, getFaq } from '@/lib/contentful';
import { messages } from '@/lib/messages';

const trustBadges = ['Более 10 лет на рынке', 'Собственное производство', 'Контроль качества на каждом этапе', 'Сроки от 2 дней'];

const processSteps = [
  { title: 'Бриф и расчёт', description: 'Уточняем задачу, сроки и бюджет. Предлагаем лучший формат и материалы.' },
  { title: 'Макет и согласование', description: 'Подготавливаем визуализацию и корректируем детали до финального согласования.' },
  { title: 'Производство', description: 'Запускаем проект на собственных мощностях, соблюдая стандарты качества.' },
  { title: 'Монтаж и передача', description: 'Организуем доставку, установку или передачу готового тиража.' },
];

export default async function Home() {
  const [sCMS, pCMS, fCMS] = await Promise.all([
    getServices().catch(() => null),
    getPortfolio().catch(() => null),
    getFaq().catch(() => null),
  ]);

  const services = sCMS ?? servicesLocal;
  const portfolio = pCMS ?? portfolioLocal;
  const faq = fCMS ?? faqLocal;

  const resolveServiceHref = (service: any) => {
    const isPrintService = service?.id === 'polygraphy' || service?.title === 'Визитки и флаеры';
    if (isPrintService) return '/print';
    const isMillingService = service?.id === 'cnc' || service?.title === 'Фрезеровка листовых материалов';
    if (isMillingService) return '/milling';
    const isWideFormatService = service?.id === 'print' || service?.title === 'Широкоформатная печать';
    if (isWideFormatService) return '/wide-format-printing';
    const isPlotterService = service?.id === 'plotter' || service?.title === 'Плоттерная резка';
    if (isPlotterService) return '/plotter-cutting';
    const isHeatTransferService = service?.id === 'thermo' || service?.title === 'Печать на футболках' || service?.title === 'Термоперенос на футболки и кружки';
    if (isHeatTransferService) return '/heat-transfer';
    const isMugsService = service?.id === 'mugs' || service?.title === 'Печать на кружках';
    if (isMugsService) return '/services/mugs';
    const isOutdoorService = service?.id === 'outdoor' || service?.title === 'Наружная реклама';
    if (isOutdoorService) return '/outdoor-advertising';
    return `/${service.slug}`;
  };

  return (
    <div>
      <Section className="pb-10 md:pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-red)]">
              Производственная студия Creso
            </p>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-6xl">
              {messages.hero.title}
            </h1>
            <p className="max-w-2xl text-base text-neutral-600 md:text-lg">{messages.hero.subtitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link className="btn-primary no-underline text-center" href="/#lead-form">
                {messages.hero.ctas.primary}
              </Link>
              <Link className="btn-secondary no-underline text-center" href="/portfolio">
                {messages.hero.ctas.secondary}
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard value="5000+" label="Реализованных проектов" />
            <KpiCard value="2 дня" label="Средний срок запуска" />
            <KpiCard value="24/7" label="Поддержка менеджера" />
            <KpiCard value="98%" label="Клиентов возвращаются снова" />
          </div>
        </div>
      </Section>

      <Section className="py-8 md:py-10" background="muted">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <BadgeChip key={badge} label={badge} />
          ))}
        </ul>
      </Section>

      <Section>
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Услуги</p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Комплексные решения для рекламы и печати</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s: any) => (
            <ServiceCard key={s.id} title={s.title} desc={s.description} href={resolveServiceHref(s)} />
          ))}
        </div>
      </Section>

      <Section background="muted">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Портфолио</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Избранные проекты</h2>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)]">
            Смотреть всё портфолио
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {(portfolio as any[]).slice(0, 3).map((item) => (
            <FeatureCard key={item.id} title={item.title} category={item.category} href="/portfolio" />
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Процесс</p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Как мы запускаем ваш проект</h2>
        </div>
        <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[var(--brand-red)]">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section background="muted">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Частые вопросы</h2>
          </div>
          <Link href="/contacts" className="text-sm font-semibold text-neutral-700 no-underline hover:text-[var(--brand-red)]">
            Задать свой вопрос
          </Link>
        </div>
        <FAQ items={(faq as any[]).slice(0, 4)} />
      </Section>

      <Section id="lead-form">
        <div className="grid gap-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">Оставить заявку</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">{messages.lead.title}</h2>
            <p className="text-sm text-neutral-600">Опишите задачу, а мы предложим оптимальный формат производства, сроки и стоимость.</p>
          </div>
          <LeadForm t={messages} />
        </div>
      </Section>
    </div>
  );
}
