import { PanelsTopLeft } from 'lucide-react';

type StandPreviewCardProps = {
  title: string;
  description: string;
  label: string;
  variant?: 'indoor' | 'outdoor';
  previewHint: string;
  previewTag: string;
};

export default function StandPreviewCard({ title, description, label, variant = 'indoor', previewHint, previewTag }: StandPreviewCardProps) {
  const isOutdoor = variant === 'outdoor';

  return (
    <article
      tabIndex={0}
      className={[
        'group relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-2xl border bg-white p-5 outline-none transition-all duration-300',
        'border-neutral-200 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.45)]',
        'hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.35)]',
        'focus-visible:-translate-y-0.5 focus-visible:border-red-300 focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.35)]',
        isOutdoor ? 'min-h-[270px] p-6 md:p-7' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={isOutdoor ? 'inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600' : 'inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600'}>{label}</p>
        <span className="inline-flex size-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-colors duration-300 group-hover:border-red-200 group-hover:text-red-500 group-focus-visible:border-red-200 group-focus-visible:text-red-500">
          <PanelsTopLeft className="size-3.5" aria-hidden="true" />
        </span>
      </div>

      <div className={isOutdoor ? 'mt-3 min-h-[6.75rem] space-y-2' : 'mt-3 min-h-[6.25rem] space-y-2'}>
        <h3 className={isOutdoor ? 'text-xl font-semibold' : 'text-lg font-semibold'}>{title}</h3>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>

      <div className={isOutdoor ? 'mt-auto h-32 overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-100 to-white' : 'mt-auto h-28 overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-100 to-white'}>
        <div
          className={[
            'flex h-full w-full flex-col justify-between p-3 transition-all duration-300 ease-out',
            'opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-focus-visible:opacity-100 md:group-focus-visible:translate-y-0',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-white/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">{previewTag}</span>
            <span className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">Превью</span>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <div className="space-y-2">
              <div className="h-1.5 w-3/4 rounded-full bg-neutral-300/80" />
              <div className="h-1.5 w-2/3 rounded-full bg-neutral-300/70" />
              <div className="h-1.5 w-1/2 rounded-full bg-neutral-300/60" />
            </div>
            <div className={isOutdoor ? 'h-14 w-12 rounded-md border border-neutral-300 bg-white/90 shadow-sm' : 'h-12 w-10 rounded-md border border-neutral-300 bg-white/90 shadow-sm'} />
          </div>

          <p className="text-[11px] text-neutral-500">{previewHint}</p>
        </div>
      </div>
    </article>
  );
}
