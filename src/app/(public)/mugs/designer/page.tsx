import dynamic from 'next/dynamic';
import Section from '@/components/Section';

const MugDesignerWorkspaceSkeleton = dynamic(() => import('@/components/mug-designer/MugDesignerWorkspaceSkeleton'), {
  ssr: false,
});

export const metadata = {
  title: 'Конструктор кружек — новая версия',
  description: 'Standalone-версия конструктора кружек с первым интерактивным этапом редактирования изображения.',
};

export default function MugsDesignerPage() {
  return (
    <Section className="bg-gradient-to-b from-neutral-100 via-neutral-50 to-white py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:mb-6 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Standalone workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">Конструктор кружек</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-600 sm:text-base">
            Первый рабочий интерактивный этап: загрузка изображения, базовое редактирование на мокапе и управление положением
            в рамках области печати.
          </p>
        </header>

        <MugDesignerWorkspaceSkeleton />
      </div>
    </Section>
  );
}
