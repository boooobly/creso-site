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
      className={`premium-card card-pad group flex h-full flex-col no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-2 ${
        featured ? 'bg-[rgba(212,28,28,0.04)]' : 'bg-white'
      }`}
    >
      <div className={`mb-5 overflow-hidden rounded-2xl border ${featured ? 'border-[var(--brand-red)]/20 bg-white/80' : 'border-neutral-200 bg-neutral-50/80'} p-3`}>
        <div className={`relative h-20 overflow-hidden rounded-xl ${featured ? 'bg-gradient-to-r from-[var(--brand-red)]/20 to-transparent' : 'bg-gradient-to-r from-neutral-200 to-neutral-100'}`}>
          {imageSrc ? <Image src={imageSrc} alt={title} fill className="object-cover" sizes="(min-width: 1280px) 20vw, (min-width: 768px) 35vw, 90vw" /> : null}
        </div>
      </div>

      {featured && (
        <span className="mb-3 inline-flex w-fit rounded-full border border-[var(--brand-red)]/25 bg-[var(--brand-red)]/10 px-3 py-1 t-eyebrow text-[var(--brand-red)]">
          Основное направление
        </span>
      )}
      <div>
        <h3 className={`t-h3 leading-snug transition-colors group-hover:text-[var(--brand-red)] ${featured ? 'md:text-[1.6rem]' : ''}`}>{title}</h3>
      </div>
      <p className="t-body text-muted-foreground mt-3 line-clamp-3">{desc}</p>
      <div className="t-link mt-auto pt-5">
        Подробнее <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
