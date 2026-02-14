import Link from 'next/link';

const pricing = [
  { material: 'Акрил', thickness: '3 мм', price: 45 },
  { material: 'Акрил', thickness: '5 мм', price: 55 },
  { material: 'Акрил', thickness: '8 мм', price: 70 },
  { material: 'ПВХ', thickness: '3 мм', price: 40 },
  { material: 'ПВХ', thickness: '5 мм', price: 50 },
  { material: 'ПВХ', thickness: '10 мм', price: 65 },
  { material: 'Композит', thickness: '3 мм', price: 60 },
  { material: 'Композит', thickness: '4 мм', price: 75 },
  { material: 'Дерево (фанера)', thickness: '6 мм', price: 50 },
  { material: 'Дерево (фанера)', thickness: '10 мм', price: 70 },
  { material: 'Дерево (фанера)', thickness: '18 мм', price: 95 },
];

export default function MillingPage() {
  return (
    <section className="container max-w-5xl space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Фрезеровка листовых материалов</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Точная фрезеровка ПВХ, акрила, композита и дерева на ЧПУ оборудовании.
        </p>
      </header>

      <article className="card overflow-hidden rounded-xl shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Материал</th>
                <th className="px-4 py-3 font-semibold">Толщина</th>
                <th className="px-4 py-3 font-semibold">Цена за погонный метр</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((row) => (
                <tr key={`${row.material}-${row.thickness}`} className="border-t transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60">
                  <td className="px-4 py-3">{row.material}</td>
                  <td className="px-4 py-3">{row.thickness}</td>
                  <td className="px-4 py-3 font-medium">{row.price} ₽ / м</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {pricing.map((row) => (
            <div key={`${row.material}-${row.thickness}`} className="rounded-xl border p-3 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60">
              <p className="font-medium">{row.material}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Толщина: {row.thickness}</p>
              <p className="text-sm">Цена: <span className="font-medium">{row.price} ₽ / м</span></p>
            </div>
          ))}
        </div>
      </article>

      <div className="card rounded-xl p-5 space-y-4">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Минимальный заказ — 1 погонный метр.
          <br />
          Стоимость может изменяться в зависимости от сложности макета.
        </p>
        <Link href="/contacts" className="btn-primary inline-flex no-underline">
          Рассчитать проект
        </Link>
      </div>
    </section>
  );
}
