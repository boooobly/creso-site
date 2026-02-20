import Section from '@/components/Section';
import OrderMillingForm from '@/components/OrderMillingForm';
import MillingMaterialsAccordion from '@/components/MillingMaterialsAccordion';
import {
  MILLING_ADDITIONAL_SERVICES,
  MILLING_MATERIAL_GROUPS,
} from '@/lib/pricing-config/milling';

const rules = [
  'Минимальная сумма заказа — 450 ₽.',
  'Цены указаны без стоимости материала.',
  'Подготовительные и постобрабатывающие работы согласовываются отдельно.',
  'Для рекламных агентств и постоянных клиентов действуют индивидуальные скидки.',
];

export default function MillingPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card space-y-4 p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Фрезеровка листовых материалов</h1>
          <p className="text-neutral-700 dark:text-neutral-300">Точная 2D-фрезеровка пластика, композита и древесных плит по вашим векторным макетам. Работаем с единичными заказами и сериями.</p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card p-6 md:p-8">
          <h2 className="mb-5 text-2xl font-semibold">Прайс по материалам</h2>
          <MillingMaterialsAccordion groups={MILLING_MATERIAL_GROUPS} />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Условия и правила</h2>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              {rules.map((rule) => (
                <li key={rule} className="flex items-start gap-2"><span className="mt-1 text-red-500">•</span><span>{rule}</span></li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-500">Информация на странице не является публичной офертой.</p>
          </div>

          <div className="card p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Дополнительные услуги</h2>
            <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60">
                  <tr>
                    <th className="px-4 py-2 font-medium">Услуга</th>
                    <th className="px-4 py-2 font-medium">Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {MILLING_ADDITIONAL_SERVICES.map((service) => (
                    <tr key={service.title} className="border-t border-neutral-200 dark:border-neutral-800">
                      <td className="px-4 py-2">{service.title}</td>
                      <td className="px-4 py-2">{service.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-12">
        <OrderMillingForm />
      </Section>
    </div>
  );
}
