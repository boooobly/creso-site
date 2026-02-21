import Section from '@/components/Section';
import OrderTshirtsForm from '@/components/OrderTshirtsForm';

const terms = [
  'Перенос полноцвет A4 - 250 ₽/шт (1 сторона)',
  'Футболки от 500 ₽ (размеры 32–60) - цену уточняйте у менеджера',
  'Термоплёнка: стоимость считает менеджер (печать + резка + перенос). Цвета: белая, чёрная, зелёная, красная, жёлтая, розовая (флуор). Минималки нет.',
];

export default function HeatTransferPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Печать на футболках</h1>
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">
            Печатаем на ваших или наших футболках. Финальную стоимость и сроки подтверждает менеджер после проверки макета.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Цены и условия</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            {terms.map((term) => (
              <li key={term}>• {term}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="pt-0 pb-12">
        <OrderTshirtsForm />
      </Section>
    </div>
  );
}
