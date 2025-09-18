import Hero from '@/components/Hero';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import PortfolioGrid from '@/components/PortfolioGrid';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import services from '@/data/services.json';
import portfolio from '@/data/portfolio.json';
import faq from '@/data/faq.json';
import { type Locale } from '@/i18n';

export default async function Home({ params: { locale } }: { params: { locale: Locale } }) {
const t = (await import('@/i18n/ru')).messages as any;
  return (
    <div className="space-y-12">
      <Hero t={t} locale={locale} />

      <Section className="container">
        <h2 className="text-2xl font-bold mb-4">Наши услуги</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} title={s.title} desc={s.description} href={`/${locale}/${s.slug}`} />
          ))}
        </div>
      </Section>

      <Section className="container">
        <h2 className="text-2xl font-bold mb-4">Портфолио</h2>
        <PortfolioGrid items={portfolio} />
      </Section>

      <Section className="container grid gap-6 md:grid-cols-2 items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4">{t.lead.title}</h2>
          <LeadForm t={t} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          <FAQ items={faq} />
        </div>
      </Section>
    </div>
  );
}
