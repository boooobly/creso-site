'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MillingMaterialGroup } from '@/lib/pricing-config/milling';

type MillingMaterialsAccordionProps = {
  groups: MillingMaterialGroup[];
};

type OpenMaterialEvent = CustomEvent<{ material: string }>;

export default function MillingMaterialsAccordion({ groups }: MillingMaterialsAccordionProps) {
  const [openId, setOpenId] = useState<string | null>('pvc');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const baseId = useId();
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onOpenMaterial = (event: Event) => {
      const customEvent = event as OpenMaterialEvent;
      const material = customEvent.detail?.material;
      if (!material) return;

      const matchedGroup = groups.find((group) => group.title === material);
      if (!matchedGroup) return;

      setOpenId(matchedGroup.id);
      setHighlightedId(matchedGroup.id);

      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedId(null);
      }, 1800);
    };

    window.addEventListener('milling:open-material', onOpenMaterial);
    return () => {
      window.removeEventListener('milling:open-material', onOpenMaterial);
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [groups]);

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = openId === group.id;
        const panelId = `${baseId}-${group.id}-panel`;
        const buttonId = `${baseId}-${group.id}-button`;
        const isHighlighted = highlightedId === group.id;

        return (
          <div
            key={group.id}
            className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-colors dark:bg-neutral-900 ${isHighlighted ? 'border-red-400 ring-2 ring-red-500/25' : 'border-neutral-300 dark:border-neutral-700'}`}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId((prev) => (prev === group.id ? null : group.id))}
                className="flex min-h-16 w-full items-center justify-between gap-4 border-b border-transparent bg-neutral-50 px-5 py-4 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:bg-neutral-800/70 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              >
                <span className="text-base font-semibold md:text-lg">{group.title}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-300 motion-reduce:duration-0 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-neutral-300 p-4 dark:border-neutral-700">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{group.description}</p>
                  <div className="mt-3 overflow-hidden rounded-lg border border-zinc-300 dark:border-neutral-800">
                    <table className="w-full table-fixed text-left text-sm">
                      <thead className="bg-neutral-50 dark:bg-neutral-800/60">
                        <tr>
                          <th className="w-1/2 px-4 py-2 font-medium">Толщина</th>
                          <th className="w-1/2 px-4 py-2 text-right font-medium">Цена</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row, rowIndex) => (
                          <tr
                            key={row.thickness}
                            className={`border-t border-zinc-200 dark:border-neutral-800 transition-colors hover:bg-zinc-100/70 dark:hover:bg-neutral-800/70 ${rowIndex % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-zinc-50 dark:bg-neutral-800/50'}`}
                          >
                            <td className={`px-4 py-2 align-top ${rowIndex % 2 !== 0 ? 'border-l-2 border-l-zinc-200 dark:border-l-transparent' : ''}`}>{row.thickness}</td>
                            <td className="px-4 py-2 text-right font-medium align-top">{row.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
