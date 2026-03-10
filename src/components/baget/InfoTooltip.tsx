'use client';

import { HelpCircle } from 'lucide-react';
import { useId, useState } from 'react';

type InfoTooltipProps = {
  text: string;
  ariaLabel: string;
};

export default function InfoTooltip({ text, ariaLabel }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl bg-white p-2 text-xs font-normal text-neutral-700 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-white/10"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
