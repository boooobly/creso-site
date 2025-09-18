import services from '@/data/services.json';
import ServiceCard from '@/components/ServiceCard';

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Список услуг</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.id} title={s.title} desc={s.description} href={`/${locale}/${s.slug}`} />
        ))}
      </div>
    </div>
  );
}