import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServiceCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="card p-5 no-underline group hover:shadow-md transition">
      <h3 className="text-lg font-semibold group-hover:text-[var(--brand-red)]">{title}</h3>
      <p className="text-sm text-neutral-600 mt-2">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-[var(--brand-red)]">
        Подробнее <ArrowRight className="size-4" />
      </div>
    </Link>
  );
}