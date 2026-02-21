import Section from '@/components/Section';
import OrderMugsForm from '@/components/OrderMugsForm';

const complexityLevels = [
  { title: 'I', description: 'Простой текст, логотип или базовый макет без сложной обработки.' },
  { title: 'II', description: 'Комбинация текста и графики, умеренная подготовка и правки.' },
  { title: 'III', description: 'Сложный коллаж, много элементов, детальная допечатная подготовка.' },
];

const checklist = [
  'Нужна цветокоррекция/чистка исходника',
  'Несколько изображений в одном макете',
  'Сложная типографика или много текста',
  'Нестандартная композиция по кругу кружки',
  'Подготовка варианта для глянца и мата',
  'Замена фона/ретушь',
  'Подбор фирменных цветов по брендбуку',
  'Срочная подготовка макета',
];

export default function MugsServicePage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card space-y-4 p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Печать на кружках</h1>
          <p className="text-neutral-700 dark:text-neutral-300">
            Белые керамические кружки 330 мл. Премиальное качество Класс ААА. Срок 3–5 рабочих дней (может быть быстрее по загрузке).
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Стоимость и условия</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>• 450 ₽/шт (круговой перенос)</li>
            <li>• От 10 шт - скидка 10%</li>
            <li>• 3 макета входят в стоимость</li>
            <li>• Белая кружка. На выбор: глянец или мат</li>
          </ul>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card space-y-5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Дизайн</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">3 макета входит в стоимость.</p>

          <div>
            <h3 className="text-lg font-medium">Категории сложности I/II/III</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              {complexityLevels.map((level) => (
                <li key={level.title}><span className="font-semibold">{level.title}:</span> {level.description}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">Чек-лист (+1 за каждый пункт)</h3>
            <ul className="mt-3 grid gap-2 text-sm text-neutral-700 dark:text-neutral-300 md:grid-cols-2">
              {checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">Интерпретация: 0–2 → I, 3–5 → II, 6–8 → III.</p>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-12">
        <OrderMugsForm />
      </Section>
    </div>
  );
}
