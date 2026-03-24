import Section from '@/components/Section';
import MugDesignerWorkspaceSkeleton from '@/components/mug-designer/MugDesignerWorkspaceSkeleton';

export const metadata = {
  title: 'Конструктор кружек — новая версия',
  description: 'Новая рабочая страница конструктора кружек. Базовый layout для следующего этапа разработки.',
};

export default function MugsDesignerPage() {
  return (
    <Section className="bg-gradient-to-b from-neutral-100 via-neutral-50 to-white py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Новая рабочая зона</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Конструктор кружек (каркас)
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600 sm:text-base">
            Это отдельная страница-основа для будущего конструктора. Сейчас здесь только корректный layout без логики редактирования.
          </p>
        </header>

        <MugDesignerWorkspaceSkeleton />
      </div>
    </Section>
  );
}
