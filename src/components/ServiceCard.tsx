import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServiceCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="premium-card group block p-6 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-2">
        <span className="card-dot" />
        <h3 className="text-xl font-semibold leading-tight text-neutral-900 transition-colors group-hover:text-[var(--brand-red)]">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{desc}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-red)]">
        Подробнее <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
