import type { FaqItem } from '@/types';

export default function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="premium-card p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold leading-tight text-neutral-900">
            <span className="card-dot" />
            {f.q}
          </summary>
          <p className="mt-2 text-sm text-neutral-700">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
