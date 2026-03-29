import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details
          key={i}
          className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-colors duration-200 hover:border-neutral-300 open:border-[var(--brand-red)]/20"
        >
          <summary className="t-faq flex w-full cursor-pointer list-none items-start justify-between gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)]/30 sm:px-5 sm:py-4">
            <span className="flex items-start gap-2">
              <span className="card-dot mt-[0.45em] shrink-0" />
              {f.q}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-neutral-400 transition duration-300 ease-out group-open:rotate-180 group-open:text-[var(--brand-red)]"
              strokeWidth={2.3}
            />
          </summary>
          <p className="t-body text-muted-foreground px-4 pb-4 pl-8 sm:px-5 sm:pb-5 sm:pl-9">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
