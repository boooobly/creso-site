import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ServiceCard({
  title,
  desc,
  href,
  featured = false,
  imageSrc,
}: {
  title: string;
  desc: string;
  href: string;
  featured?: boolean;
  imageSrc?: string;
}) {
  return (
    <Link
      href={href}
      className={`premium-card group flex h-full flex-col p-5 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 md:p-6 ${
        featured ? 'border-[var(--brand-red)]/25 bg-[linear-gradient(180deg,rgba(212,28,28,0.06)_0%,rgba(255,255,255,0.98)_30%)]' : ''
      }`}
    >
      <div className={`mb-5 overflow-hidden rounded-xl border ${featured ? 'border-[var(--brand-red)]/20 bg-white/90' : 'border-neutral-200/90 bg-neutral-50/85'} p-2.5`}>
        <div className={`relative aspect-[16/8] overflow-hidden rounded-lg ${featured ? 'bg-gradient-to-r from-[var(--brand-red)]/10 via-white to-white' : 'bg-gradient-to-r from-neutral-200/90 to-neutral-100/90'}`}>
          {imageSrc ? (
            <>
              <Image src={imageSrc} alt={title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1280px) 20vw, (min-width: 768px) 35vw, 90vw" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/10 via-transparent to-white/15" />
            </>
          ) : null}
        </div>
      </div>

      {featured && (
        <span className="mb-3 inline-flex w-fit rounded-full border border-[var(--brand-red)]/25 bg-[var(--brand-red)]/8 px-3 py-1 t-eyebrow text-[var(--brand-red)]">
          Основное направление
        </span>
      )}
      <div>
        <h3 className="t-h3 leading-snug transition-colors group-hover:text-[var(--brand-red)]">{title}</h3>
      </div>
      <p className="t-body text-muted-foreground mt-3 line-clamp-3">{desc}</p>
      <div className="t-link mt-auto pt-5">
        Подробнее <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
