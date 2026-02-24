import Link from 'next/link';

export default function FeatureCard({
  title,
  category,
  href,
}: {
  title: string;
  category: string;
  href: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-36 bg-gradient-to-br from-neutral-100 via-neutral-50 to-white" />
      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-red)]">{category}</p>
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <Link href={href} className="inline-flex text-sm font-medium text-neutral-700 no-underline hover:text-[var(--brand-red)]">
          Смотреть кейс
        </Link>
      </div>
    </article>
  );
}
