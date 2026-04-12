import { PanelsTopLeft } from 'lucide-react';
import ProtectedImage from '@/components/ui/ProtectedImage';

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
        'group relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-2xl border bg-white p-5 outline-none transition-all duration-300',
        'border-neutral-200 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.45)]',
        'hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_18px_34px_-22px_rgba(15,23,42,0.4)]',
        'focus-visible:-translate-y-0.5 focus-visible:border-red-300 focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:shadow-[0_18px_34px_-22px_rgba(15,23,42,0.4)]',
        isOutdoor ? 'min-h-[270px] p-6 md:p-7' : '',
      ].join(' ')}
    >
      <div
        className={[
          'relative z-20 transition-opacity duration-300 md:group-hover:opacity-0 md:group-focus-visible:opacity-0',
          isOutdoor ? 'pb-[8.5rem]' : 'pb-[7.5rem]',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={isOutdoor ? 'inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600' : 'inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600'}>{label}</p>
          <span className="inline-flex size-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-colors duration-300 group-hover:border-red-200 group-hover:text-red-500 group-focus-visible:border-red-200 group-focus-visible:text-red-500">
            <PanelsTopLeft className="size-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className={isOutdoor ? 'mt-2.5 min-h-[6.75rem] space-y-1.5' : 'mt-2.5 min-h-[6.25rem] space-y-1.5'}>
          <h3 className={isOutdoor ? 'text-xl font-semibold' : 'text-lg font-semibold'}>{title}</h3>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>

      <div
        className={[
          'pointer-events-none absolute z-10 overflow-hidden border border-neutral-200 bg-gradient-to-br from-neutral-100 to-white transition-all duration-300 ease-out',
          'left-5 right-5 bottom-5 h-28 rounded-xl',
          'md:group-hover:inset-0 md:group-hover:h-auto md:group-hover:rounded-none md:group-hover:border-transparent',
          'md:group-focus-visible:inset-0 md:group-focus-visible:h-auto md:group-focus-visible:rounded-none md:group-focus-visible:border-transparent',
          isOutdoor ? 'left-6 right-6 bottom-6 h-32' : '',
        ].join(' ')}
        aria-hidden="true"
      >
        <div className="relative flex h-full w-full items-end p-3 md:p-4">
          <ProtectedImage src={imageSrc} alt={title} fill className="object-cover" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-white/5" />

          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1 bg-gradient-to-t from-black/45 via-black/20 to-transparent px-4 pb-4 pt-10 opacity-0 transition-all duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
            <p className="text-xs font-medium uppercase tracking-wide text-white/85">{previewHint}</p>
            <p className="mt-1 text-sm font-semibold text-white">{title}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
