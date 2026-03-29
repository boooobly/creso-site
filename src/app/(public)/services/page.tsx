import { getServices } from '@/lib/contentful';
import servicesLocal from '@/data/services.json';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import { getSiteImages } from '@/lib/site-images';
import { SERVICE_CARD_IMAGE_SLOT_BY_ID } from '@/lib/site-service-image-slots';

const serviceImageById: Record<string, string> = {
  baget: '/images/services/bagget.png',
  cnc: '/images/services/milling.png',
  print: '/images/services/printing.png',
  plotter: '/images/services/plotter.png',
  thermo: '/images/services/t-shirt.png',
  mugs: '/images/services/glasses.png',
  stands: '/images/services/stends.png',
  outdoor: '/images/services/outdoor.png',
  polygraphy: '/images/services/cards.png',
};

export default async function ServicesPage() {
  const [sCMS, serviceCardImages] = await Promise.all([
    getServices().catch(() => null),
    getSiteImages(Object.values(SERVICE_CARD_IMAGE_SLOT_BY_ID)),
  ]);
  const services = sCMS ?? (servicesLocal as any[]);
  const heroBadges = ['Полный цикл работ', 'Собственное производство', 'Монтаж и сопровождение'] as const;

  const resolveServiceHref = (service: any) => {
    const isPrintService = service?.id === 'polygraphy' || service?.title === 'Визитки и флаеры';
    if (isPrintService) return '/print';
    const isMillingService = service?.id === 'cnc' || service?.title === 'Фрезеровка листовых материалов';
    if (isMillingService) return '/milling';
    const isWideFormatService = service?.id === 'print' || service?.title === 'Широкоформатная печать';
    if (isWideFormatService) return '/wide-format-printing';
    const isPlotterService = service?.id === 'plotter' || service?.title === 'Плоттерная резка';
    if (isPlotterService) return '/plotter-cutting';
    const isHeatTransferService =
      service?.id === 'thermo' || service?.title === 'Печать на футболках' || service?.title === 'Термоперенос на футболки и кружки';
    if (isHeatTransferService) return '/heat-transfer';
    const isMugsService = service?.id === 'mugs' || service?.title === 'Печать на кружках';
    if (isMugsService) return '/services/mugs';
    const isStandsService = service?.id === 'stands' || service?.title === 'Изготовление стендов';
    if (isStandsService) return '/services/stands';
    const isOutdoorService = service?.id === 'outdoor' || service?.title === 'Наружная реклама';
    if (isOutdoorService) return '/outdoor-advertising';
    return `/${service.slug}`;
  };

  return (
    <>
      <Section spacing="compact">
        <PageHero
          className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/25"
          contentClassName="max-w-[38rem] space-y-6"
          media={
            <HeroMediaPanel className="border-neutral-200/90 bg-neutral-100/95">
              <div className="grid grid-cols-2 gap-3 p-2">
                {services.slice(0, 4).map((service: any) => {
                  return (
                    <article key={`hero-${service.id}`} className="card-structured rounded-xl border-neutral-200/90 bg-white/85 p-3">
                      <p className="t-caption line-clamp-2 min-h-10 text-neutral-700">{service.title}</p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80">
                        <div className="h-full w-1/2 rounded-full bg-[var(--brand-red)]/75" />
                      </div>
                      <p className="t-caption mt-2 text-neutral-500">Популярное направление</p>
                    </article>
                  );
                })}
              </div>
            </HeroMediaPanel>
          }
        >
          <HeroEyebrow>УСЛУГИ</HeroEyebrow>
          <HeroTitle className="max-w-[15ch] text-3xl leading-[1.06] md:text-5xl">Все услуги в одном каталоге</HeroTitle>
          <HeroLead className="max-w-[35rem] text-base md:text-[1.05rem] md:leading-relaxed">
            Выполняем проекты по наружной рекламе, печати и производству под ключ: от расчёта и дизайна до монтажа и сдачи.
          </HeroLead>
          <HeroChipList className="max-w-[36rem] gap-2.5">
            {heroBadges.map((badge) => (
              <HeroChip key={badge} className="h-11 rounded-xl px-4 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/40 hover:text-neutral-900">
                {badge}
              </HeroChip>
            ))}
          </HeroChipList>
          <HeroActions className="gap-3.5 pt-1">
            <Link href="/#lead-form" className="btn-primary px-5 no-underline shadow-[0_8px_20px_rgba(220,38,38,0.24)] hover:shadow-[0_10px_24px_rgba(220,38,38,0.28)]">
              Рассчитать стоимость
            </Link>
            <Link href="/portfolio" className="btn-secondary px-5 no-underline shadow-[0_4px_14px_rgba(17,24,39,0.06)] hover:shadow-[0_6px_18px_rgba(17,24,39,0.08)]">
              Смотреть кейсы
            </Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="compact" background="muted" fullBleed className="border-y border-neutral-200/70">
        <div className="section-header">
          <p className="t-eyebrow">НАПРАВЛЕНИЯ</p>
          <h2 className="t-h2">Выберите нужную услугу</h2>
          <p className="t-body text-muted-foreground max-w-2xl">Каждая карточка ведёт на профильную страницу услуги с подробностями, примерами и формой заявки.</p>
        </div>
        <div className="grid-cards md:grid-cols-2 lg:grid-cols-3">
          {services.map((s: any) => {
            const slotKey = SERVICE_CARD_IMAGE_SLOT_BY_ID[String(s.id)];
            const imageSrc = slotKey ? (serviceCardImages[slotKey]?.url ?? serviceImageById[s.id]) : serviceImageById[s.id];

            return <ServiceCard key={s.id} title={s.title} desc={s.description} href={resolveServiceHref(s)} imageSrc={imageSrc} />;
          })}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="cta-shell">
          <div className="section-header-split mb-0">
            <div className="space-y-2">
              <p className="t-eyebrow">НЕ ЗНАЕТЕ, С ЧЕГО НАЧАТЬ</p>
              <h2 className="t-h3">Поможем подобрать оптимальный формат под вашу задачу</h2>
              <p className="t-body text-muted-foreground max-w-2xl">Подскажем материалы, технологию производства и сроки, чтобы вы быстро перешли от идеи к готовому результату.</p>
            </div>
            <Link href="/contacts" className="btn-secondary no-underline">Связаться с менеджером</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
