import { PanelsTopLeft } from 'lucide-react';
import Image from 'next/image';

type StandPreviewCardProps = {
  title: string;
  description: string;
  label: string;
  variant?: 'indoor' | 'outdoor';
  previewHint: string;
  imageSrc: string;
};

export default function StandPreviewCard({ title, description, label, variant = 'indoor', previewHint, imageSrc }: StandPreviewCardProps) {
  const isOutdoor = variant === 'outdoor';

  return (
    <article
      tabIndex={0}
      className={[
        'card-visual card-interactive group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/80 bg-white outline-none',
        'shadow-[0_12px_32px_-26px_rgba(15,23,42,0.45)]',
        'focus-visible:border-red-300 focus-visible:ring-2 focus-visible:ring-red-500/25',
        isOutdoor ? 'min-h-[304px]' : '',
      ].join(' ')}
    >
      <div className="relative z-20 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className={isOutdoor ? 'inline-flex rounded-full border border-red-100 bg-red-50/90 px-2.5 py-1 text-xs font-semibold text-red-700' : 'inline-flex rounded-full border border-neutral-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-600'}>{label}</p>
          <span className="inline-flex size-8 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-neutral-500 transition-colors duration-300 group-hover:border-red-200 group-hover:text-red-600 group-focus-visible:border-red-200 group-focus-visible:text-red-600">
            <PanelsTopLeft className="size-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className={isOutdoor ? 'mt-4 space-y-2' : 'mt-4 space-y-2'}>
          <h3 className={isOutdoor ? 'text-xl font-semibold tracking-tight text-neutral-900' : 'text-lg font-semibold tracking-tight text-neutral-900'}>{title}</h3>
          <p className="text-sm leading-6 text-neutral-600">{description}</p>
        </div>
      </div>

      <div
        className={[
          'pointer-events-none absolute inset-x-4 bottom-4 z-10 h-36 overflow-hidden rounded-2xl border border-white/70 transition-all duration-500 ease-out',
          'md:group-hover:h-[72%] md:group-focus-visible:h-[72%]',
          isOutdoor ? 'h-40 md:h-44 md:group-hover:h-[74%] md:group-focus-visible:h-[74%]' : '',
        ].join(' ')}
        aria-hidden="true"
      >
        <div className="relative h-full w-full">
          <Image src={imageSrc} alt={title} fill className="object-cover" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pb-4 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">{previewHint}</p>
            <p className="mt-1 text-sm font-semibold text-white">{title}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
