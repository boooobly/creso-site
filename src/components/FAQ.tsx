import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="premium-card p-4 sm:p-5">
          <summary className="t-h3 flex cursor-pointer list-none items-center gap-2 font-semibold">
            <span className="card-dot" />
            {f.q}
          </summary>
          <p className="t-body text-muted-foreground mt-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
