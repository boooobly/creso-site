import BagetConfigurator from '@/components/baget/BagetConfigurator';

type BagetPageProps = {
  searchParams?: {
    width?: string;
    height?: string;
  };
};

export default function BagetPage({ searchParams }: BagetPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold md:text-3xl">Конфигуратор багета</h1>
        <p className="text-neutral-700">Подберите профиль, оцените превью и получите точный расчёт стоимости.</p>
        <BagetConfigurator initialWidth={searchParams?.width} initialHeight={searchParams?.height} />
      </main>
    </div>
  );
}
