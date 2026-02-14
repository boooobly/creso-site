import Section from '@/components/Section';
import HeatTransferCalculator from '@/components/HeatTransferCalculator';

export default function HeatTransferPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Термоперенос на кружки и футболки</h1>
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">
            Рассчитайте стоимость для кружек, футболок или термоплёнки и отправьте заявку в один клик.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <HeatTransferCalculator />
      </Section>
    </div>
  );
}
