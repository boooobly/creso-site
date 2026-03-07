'use client';

import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

type AccessoryHelpTooltipProps = {
  imageSrc: string;
  label: string;
  ariaLabel: string;
};

export default function AccessoryHelpTooltip({ imageSrc, label, ariaLabel }: AccessoryHelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
        onClick={() => setIsOpen((prev) => !prev)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-[156px] -translate-x-1/2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
        >
          <Image
            src={imageSrc}
            alt={label}
            width={140}
            height={140}
            className="h-auto w-[140px] rounded-md object-contain"
          />
        </span>
      ) : null}
    </span>
  );
}
