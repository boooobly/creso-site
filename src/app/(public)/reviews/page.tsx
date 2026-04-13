import Link from 'next/link';
import type { ComponentType } from 'react';
import { ArrowUpRight, BadgeCheck, Building2, Clock3, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-react';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewsClient, { type PublicReviewItem } from '@/components/ReviewsClient';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
type CredibilityItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};
const credibilityPoints: CredibilityItem[] = [
  {
    icon: ShieldCheck,
    title: 'Проверенные публикации',
    description: 'Показываем только одобренные отзывы клиентов после модерации.',
  },
  {
    icon: Building2,
    title: 'Реальные проекты',
    description: 'Отзывы привязаны к выполненным работам и реальному опыту сотрудничества.',
  },
  {
    icon: Clock3,
    title: 'Опыт в сроках и сервисе',
    description: 'Чаще всего отмечают соблюдение сроков, прозрачность и сопровождение проекта.',
  },
];
const yandexReviewsUrl = 'https://yandex.com/maps/org/credomir/162252059264/reviews/?ll=41.959534%2C44.623058&z=17';
async function loadApprovedReviews(): Promise<PublicReviewItem[]> {
  try {
    const items = await prisma.review.findMany({
      where: { status: 'approved' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        isAnonymous: true,
        rating: true,
        text: true,
        createdAt: true,
      },
    });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      isAnonymous: item.isAnonymous,
      rating: item.rating,
      text: item.text,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('[env]')) {
      return [];
    }
    console.error('[reviews/page] failed to load approved reviews', error);
    return [];
  }
}
export default async function ReviewsPage() {
  const reviews = await loadApprovedReviews();
  return (
    <div className="space-y-7 md:space-y-8">
      <section className="card rounded-3xl border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50/80 to-red-50/[0.18] p-6 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717] md:p-8">
        <RevealOnScroll>
          <div className="space-y-3 text-center md:space-y-4">
            <p className="t-eyebrow mx-auto">Социальное доказательство</p>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-4xl">Отзывы реальных клиентов</h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
              Собрали живую обратную связь о качестве, сроках и коммуникации — чтобы вы могли оценить наш подход до старта проекта.
            </p>
          </div>
        </RevealOnScroll>
      </section>
      <ReviewsClient reviews={reviews} />
      <section className="card relative z-10 rounded-2xl p-6 md:p-8">
        <RevealOnScroll>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-7">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
                Отзывы на Яндекс Картах
              </div>
              <h2 className="text-xl font-semibold tracking-tight dark:text-neutral-100 md:text-2xl">Смотрите отзывы на внешней площадке</h2>
              <p className="max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
                Для дополнительной проверки можно открыть карточку компании в Яндекс Картах и посмотреть полный список оценок.
              </p>
            </div>
            <a href={yandexReviewsUrl} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2 no-underline md:justify-self-end">
              Открыть Яндекс Карты
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </RevealOnScroll>
      </section>
      <section className="card relative z-10 rounded-2xl p-6 md:p-8">
        <RevealOnScroll>
          <div className="mb-4 flex items-center gap-2.5 md:mb-5">
            <span className="public-icon-badge">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight dark:text-neutral-100 md:text-2xl">Почему отзывам можно доверять</h2>
          </div>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {credibilityPoints.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.title} className="card-structured h-full rounded-xl p-4">
                  <div className="space-y-2">
                    <span className="public-icon-badge-sm">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 md:text-base">{point.title}</p>
                    <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-300 md:text-sm">{point.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </RevealOnScroll>
      </section>
      <section className="relative z-10 pb-2">
        <RevealOnScroll>
          <div className="cta-shell card border-neutral-200/85 dark:border-neutral-800/90 dark:bg-neutral-900/85">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-red)]">Следующий шаг</p>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Готовы обсудить ваш проект?</h2>
                <p className="max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
                  Расскажите о задаче — предложим формат, материалы и сроки под ваш бюджет и площадку.
                </p>
              </div>
              <div className="flex w-full md:w-auto md:justify-end">
                <Link href="/contacts" className="btn-primary w-full items-center gap-2 no-underline md:w-auto">
                  Обсудить проект
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
