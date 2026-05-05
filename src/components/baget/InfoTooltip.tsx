'use client';

import { HelpCircle } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type InfoTooltipProps = {
  text: string;
  ariaLabel: string;
};

export default function InfoTooltip({ text, ariaLabel }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<{ top: number; left: number } | null>(null);
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const tooltipWidth = 256;
      const viewportPadding = 8;
      const centeredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      const maxLeft = window.innerWidth - tooltipWidth - viewportPadding;
      const clampedLeft = Math.max(viewportPadding, Math.min(centeredLeft, maxLeft));

      setTooltipStyle({
        top: rect.bottom + 8,
        left: clampedLeft,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  return (
    <span
      className="relative z-[100] inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
            buttonRef.current?.blur();
          }
        }}
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {isOpen && tooltipStyle
        ? createPortal(
            <span
              id={tooltipId}
              role="tooltip"
              style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
              className="pointer-events-none fixed z-[9999] w-64 rounded-xl bg-white p-2 text-xs font-normal text-neutral-700 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-white/10"
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
