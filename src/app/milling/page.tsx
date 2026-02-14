import Link from 'next/link';
import Section from '@/components/Section';

const advantages = [
  'Точная фрезеровка ПВХ, композита, акрила, фанеры и МДФ',
  'Резка по вашему макету или подготовка чертежа под задачу',
  'Серийное и индивидуальное производство',
];

const materials = ['ПВХ', 'Композит', 'Акрил', 'Фанера', 'МДФ', 'ПЭТ'];

export default function MillingPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card space-y-4 p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Фрезеровка листовых материалов</h1>
          <p className="text-neutral-700 dark:text-neutral-300">Изготавливаем вывески, таблички, объемные буквы, декоративные элементы и детали для рекламы.</p>
          <div className="flex flex-wrap gap-2">
            {materials.map((item) => (
              <span key={item} className="rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800 dark:text-neutral-200">{item}</span>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 md:grid-cols-3">
          {advantages.map((item) => (
            <div key={item} className="card rounded-xl p-5">
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold">Нужен расчет стоимости?</h2>
            <p className="text-neutral-700 dark:text-neutral-300">Отправьте размеры и материал — подготовим предложение по цене и срокам.</p>
          </div>
          <Link href="/contacts" className="btn-primary inline-flex no-underline">Оставить заявку</Link>
        </div>
      </Section>
    </div>
  );
}
