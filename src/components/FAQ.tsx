import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition">
          <summary className="t-faq flex w-full cursor-pointer list-none items-start justify-between gap-3 px-4 py-3.5 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)]/30 sm:px-5 sm:py-4">
            <span className="flex items-start gap-2">
              <span className="card-dot mt-[0.45em] shrink-0" />
              {f.q}
            </span>
            <span className="mt-1 text-xs font-semibold text-neutral-400 transition group-open:rotate-45 group-open:text-[var(--brand-red)]">+</span>
          </summary>
          <p className="t-body text-muted-foreground px-4 pb-4 pl-8 sm:px-5 sm:pb-5 sm:pl-9">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
