import Hero from '@/components/Hero';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import PortfolioGrid from '@/components/PortfolioGrid';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import { messages as t } from '@/lib/messages';

import servicesLocal from '@/data/services.json';
import portfolioLocal from '@/data/portfolio.json';
import faqLocal from '@/data/faq.json';

import { getServices, getPortfolio, getFaq } from '@/lib/contentful';

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
    return `/${service.slug}`;
  };

  return (
    <div className="space-y-12">
      <Hero t={t} />

      <Section>
        <h2 className="text-2xl font-bold mb-4">Наши услуги</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((s: any) => (
            <ServiceCard key={s.id} title={s.title} desc={s.description} href={resolveServiceHref(s)} />
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="text-2xl font-bold mb-4">Портфолио</h2>
        <PortfolioGrid items={portfolio as any[]} />
      </Section>

      <Section containerClassName="grid gap-6 md:grid-cols-2 items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4">{t.lead.title}</h2>
          <LeadForm t={t} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          <FAQ items={faq as any[]} />
        </div>
      </Section>
    </div>
  );
}
