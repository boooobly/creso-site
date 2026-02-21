import Section from '@/components/Section';
import OrderMillingForm from '@/components/OrderMillingForm';
import MillingMaterialsAccordion from '@/components/MillingMaterialsAccordion';
import {
  MILLING_ADDITIONAL_SERVICE_GROUPS,
  MILLING_MATERIAL_GROUPS,
} from '@/lib/pricing-config/milling';

const quickInfo = [
  'Минимальный заказ - 450 ₽',
  'Цены без учета материала',
  'По вашим векторным файлам',
];

const rules = [
  'Минимальная сумма заказа — 450 ₽.',
  'Цены указаны без стоимости материала.',
  'Подготовительные и постобрабатывающие работы согласовываются отдельно.',
  'Для рекламных агентств и постоянных клиентов действуют индивидуальные скидки.',
  'Максимальный размер заготовки: 2×4 м.',
];

export default function MillingPage() {
  const renderServicePrice = (price: string) => {
    const percentMatch = price.match(/^(\+\d+%)(.*)$/);
    if (!percentMatch) {
      return <span className="whitespace-normal break-words">{price}</span>;
    }

    const [, percent, remainder] = percentMatch;
    const rest = remainder.replace(/^,\s*/, '').trim();

    return (
      <span className="inline-flex flex-wrap items-start justify-end gap-2 whitespace-normal break-words">
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {percent}
        </span>
        {rest ? <span>{rest}</span> : null}
      </span>
    );
  };

  const renderServiceTitle = (title: string) => (
    <span className="whitespace-normal break-words">{title}</span>
  );

  const renderStoragePrice = (price: string) => {
    const points = price.split(',').map((item) => item.trim()).filter(Boolean);
    return (
      <ul className="ml-auto list-disc space-y-1 pl-5 text-left">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <Section className="pb-8">
        <div className="card space-y-4 p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Фрезеровка листовых материалов</h1>
          <p className="text-neutral-700 dark:text-neutral-300">Точная 2D-фрезеровка пластика, композита и древесных плит по вашим векторным макетам. Работаем с единичными заказами и сериями.</p>
        </div>
      </Section>

      <Section className="pt-0">
        <div id="milling-prices" className="card p-6 md:p-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap gap-2">
            {quickInfo.map((item) => (
              <span key={item} className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200">{item}</span>
            ))}
          </div>
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
            <div className="space-y-4">
              {MILLING_ADDITIONAL_SERVICE_GROUPS.map((group) => (
                <section key={group.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{group.title}</h3>
                  <ul className="mt-3 space-y-3">
                    {group.items.map((item) => (
                      <li key={item.label} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200 sm:max-w-[62%]">{item.label}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            {item.badges?.map((badge) => (
                              <span
                                key={badge}
                                className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                              >
                                {badge}
                              </span>
                            ))}
                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{item.details}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
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
