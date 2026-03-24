import Image from 'next/image';

const futureSections = [
  'Слой макета',
  'Позиционирование',
  'Текст и типографика',
  'Цвет и эффекты',
  'Параметры печати',
];

export default function MugDesignerWorkspaceSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,1fr)]">
      <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">Превью кружки</h2>
            <p className="text-sm text-neutral-600">Базовый мокап 1457 × 630 px для нового конструктора.</p>
          </div>
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
            Основа
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3 sm:p-4">
          <div className="mx-auto w-full max-w-[1457px]">
            <Image
              src="/images/mug/mug-base.png"
              alt="Базовый мокап кружки"
              width={1457}
              height={630}
              priority
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">Панель управления</h2>
        <p className="mt-1 text-sm text-neutral-600">Здесь в следующих итерациях появятся инструменты конструктора.</p>

        <div className="mt-5 space-y-3">
          {futureSections.map((section) => (
            <div key={section} className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {section}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Основное действие (скоро)
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700"
          >
            Вторичное действие (скоро)
          </button>
        </div>
      </aside>
    </div>
  );
}
