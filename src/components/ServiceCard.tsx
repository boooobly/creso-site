import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProtectedImage from '@/components/ui/ProtectedImage';

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
      className={`premium-card card-pad group flex h-full flex-col no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 ${
        featured ? 'bg-[rgba(212,28,28,0.04)]' : 'bg-white'
      }`}
    >
      <div className="mb-4 overflow-hidden rounded-xl border border-neutral-200/80 transition-colors duration-300 group-hover:border-neutral-300">
        <div className="relative aspect-[16/5] w-full overflow-hidden rounded-xl">
          {imageSrc ? <ProtectedImage src={imageSrc} alt={title} fill className="object-cover" sizes="(min-width: 1280px) 20vw, (min-width: 768px) 35vw, 90vw" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-45 transition-opacity duration-300 group-hover:opacity-20" />
        </div>
      </div>

      {featured && (
        <span className="mb-3 inline-flex w-fit rounded-full border border-[var(--brand-red)]/25 bg-[var(--brand-red)]/10 px-3 py-1 t-eyebrow text-[var(--brand-red)]">
          Основное направление
        </span>
      )}
      <div className="card-title-stack">
        <h3 className={`t-h3 leading-snug transition-colors group-hover:text-[var(--brand-red)] ${featured ? 'md:text-[1.6rem]' : ''}`}>{title}</h3>
        <p className="t-caption inline-flex items-center gap-2 uppercase tracking-[0.08em] text-neutral-500">
          <span className="card-dot" />
          Услуга
        </p>
      </div>
      <p className="t-body text-muted-foreground mt-3 line-clamp-3">{desc}</p>
      <div className="t-link mt-auto pt-5">
        Подробнее <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
