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
        <span className="mb-3 inline-flex rounded-full border border-[var(--brand-red)]/25 bg-[var(--brand-red)]/10 px-3 py-1 t-eyebrow text-[var(--brand-red)]">
          Основное направление
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="card-dot" />
        <h3 className={`t-h3 transition-colors group-hover:text-[var(--brand-red)] ${featured ? 'md:text-[1.625rem]' : ''}`}>
          {title}
        </h3>
      </div>
      <p className="t-body mt-3 text-neutral-500">{desc}</p>
      <div className="t-link mt-5">
        Подробнее <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
