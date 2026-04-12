import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details
          key={i}
          className="accordion-panel group"
        >
          <summary className="accordion-trigger t-faq">
            <span className="flex items-start gap-2">
              <span className="card-dot mt-[0.45em] shrink-0" />
              {f.q}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-neutral-400 transition duration-300 ease-out group-open:rotate-180 group-open:text-[var(--brand-red)] dark:text-neutral-500 dark:group-open:text-red-400"
              strokeWidth={2.3}
            />
          </summary>
          <p className="accordion-content t-body text-muted-foreground pl-8 sm:pl-9">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
