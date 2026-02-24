import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServiceCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-neutral-200 bg-white p-6 no-underline shadow-sm transition-all duration-250 hover:-translate-y-1 hover:border-[var(--brand-red)]/35 hover:shadow-[0_10px_24px_-18px_rgba(212,28,28,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2"
    >
      <h3 className="text-xl font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-[var(--brand-red)]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{desc}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-red)]">
        Подробнее <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
