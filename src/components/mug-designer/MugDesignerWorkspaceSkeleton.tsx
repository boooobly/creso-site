import Image from 'next/image';

const toolSections = [
  {
    title: 'Файл',
    controls: ['Новый макет', 'Открыть шаблон', 'Дублировать версию'],
  },
  {
    title: 'Редактирование',
    controls: ['Слои (скоро)', 'Выравнивание (скоро)', 'История действий'],
  },
  {
    title: 'Текст',
    controls: ['Добавить заголовок', 'Шрифт: Inter', 'Размер: 32 px'],
  },
  {
    title: 'Параметры печати',
    controls: ['Метод: сублимация', 'Цветопрофиль: CMYK', 'Проверка вылетов'],
  },
  {
    title: 'Заказ',
    controls: ['Тираж: 1 шт.', 'Срок: стандартный', 'Комментарий к макету'],
  },
];

export default function MugDesignerWorkspaceSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_380px] 2xl:grid-cols-[minmax(0,2fr)_400px]">
      <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">Рабочее превью</h2>
            <p className="mt-1 text-sm text-neutral-600">Базовый макет кружки 1457 × 630 px с направляющими зонами печати.</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Макет активен
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-100 to-neutral-50 p-3 sm:p-4">
          <div className="relative mx-auto aspect-[1457/630] w-full max-w-[1180px] overflow-hidden rounded-xl border border-neutral-200 bg-white px-[4%] py-[7%] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
            <div className="relative h-full w-full">
              <Image
                src="/images/mug/mug-base.png"
                alt="Базовый мокап кружки"
                fill
                priority
                sizes="(min-width: 1536px) 72vw, (min-width: 1280px) 62vw, 100vw"
                className="object-contain"
              />

              <div className="pointer-events-none absolute left-[18%] top-[22%] h-[56%] w-[64%] rounded-[22px] border-2 border-sky-500/80 bg-sky-500/10">
                <span className="absolute left-3 top-3 rounded-md bg-sky-600 px-2 py-1 text-xs font-semibold text-white">
                  Область печати
                </span>
              </div>

              <div className="pointer-events-none absolute left-[23%] top-[28%] h-[44%] w-[54%] rounded-[18px] border-2 border-emerald-500/90 bg-emerald-400/10">
                <span className="absolute left-3 top-3 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                  Безопасная зона
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">Инструменты макета</h2>
        <p className="mt-1 text-sm text-neutral-600">Структура панели подготовлена для следующих шагов реализации редактора.</p>

        <div className="mt-4 space-y-3">
          {toolSections.map((section) => (
            <section key={section.title} className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
              <h3 className="text-sm font-semibold text-neutral-900">{section.title}</h3>
              <div className="mt-2 grid gap-2">
                {section.controls.map((control) => (
                  <div
                    key={control}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700"
                  >
                    {control}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>

      <div className="xl:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:px-5">
          <p className="text-sm text-neutral-600">Итерация 1: layout и визуальные направляющие без интерактивного редактирования.</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              Назад
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Сохранить макет
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
