import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="premium-card p-4">
          <summary className="t-h3 flex cursor-pointer list-none items-center gap-2">
            <span className="card-dot" />
            {f.q}
          </summary>
          <p className="t-body mt-2 text-neutral-700">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
