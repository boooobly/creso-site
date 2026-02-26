import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="premium-card p-3.5 sm:p-4">
          <summary className="t-faq flex cursor-pointer list-none items-start gap-2">
            <span className="card-dot mt-[0.45em] shrink-0" />
            {f.q}
          </summary>
          <p className="t-body text-muted-foreground mt-1.5">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
