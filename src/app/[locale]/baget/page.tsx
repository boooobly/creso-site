import Section from '@/components/Section';
import BagetAvailabilityCalculator from '@/components/BagetAvailabilityCalculator';

export default function BagetPage() {
  return (
    <Section containerClassName="space-y-6">
      <h1 className="text-2xl font-bold">Оформление картин в багет</h1>
      <p className="text-neutral-700">Рамки, паспарту, стекло, подвесы. Индивидуальные решения.</p>
      <BagetAvailabilityCalculator />
    </Section>
  );
}
