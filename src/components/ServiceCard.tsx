import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServiceCard({
  title,
  desc,
  href,
  featured = false,
}: {
  title: string;
  desc: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`premium-card group block p-6 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 ${
        featured ? 'bg-[rgba(212,28,28,0.04)]' : ''
      }`}
    >
      {featured && (
        <span className="mb-3 inline-flex rounded-full border border-[var(--brand-red)]/25 bg-[var(--brand-red)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-red)]">
          Основное направление
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="card-dot" />
        <h3 className={`font-semibold leading-tight text-neutral-900 transition-colors group-hover:text-[var(--brand-red)] ${featured ? 'text-2xl' : 'text-xl'}`}>
          {title}
        </h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{desc}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-red)]">
        Подробнее <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
