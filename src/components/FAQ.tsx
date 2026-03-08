import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="group rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-sm transition sm:px-5 sm:py-4">
          <summary className="t-faq flex cursor-pointer list-none items-start justify-between gap-3">
            <span className="flex items-start gap-2">
              <span className="card-dot mt-[0.45em] shrink-0" />
              {f.q}
            </span>
            <span className="mt-1 text-xs font-semibold text-neutral-400 transition group-open:rotate-45 group-open:text-[var(--brand-red)]">+</span>
          </summary>
          <p className="t-body text-muted-foreground mt-2.5 pl-4 sm:pl-5">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
